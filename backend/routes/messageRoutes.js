import express from 'express';
import Message from '../models/messageModel.js';
import User from '../models/userModel.js';
import protect from '../middleware/authMiddleware.js';
import mongoose from 'mongoose';

const router = express.Router();

// @route   GET /api/messages/conversations
// @desc    Get all conversations for the current user
router.get('/conversations', protect, async (req, res) => {
    try {
        const userId = new mongoose.Types.ObjectId(req.user.id);
        
        const messages = await Message.aggregate([
            { $match: { $or: [{ sender: userId }, { receiver: userId }] } },
            { $sort: { createdAt: -1 } },
            {
                $group: {
                    _id: {
                        $cond: [
                            { $gt: ["$sender", "$receiver"] },
                            { sender: "$sender", receiver: "$receiver" },
                            { sender: "$receiver", receiver: "$sender" }
                        ]
                    },
                    lastMessage: { $first: "$message" },
                    timestamp: { $first: "$createdAt" },
                    docId: { $first: "$_id" }
                }
            },
             {
                $project: {
                    _id: 0,
                    conversationId: "$_id",
                    lastMessage: "$lastMessage",
                    timestamp: "$timestamp"
                }
            },
            { $sort: { timestamp: -1 } },
        ]);
        
        const conversations = messages.map(msg => {
            const otherUserId = msg.conversationId.sender.equals(userId) ? msg.conversationId.receiver : msg.conversationId.sender;
            return {
                id: `${msg.conversationId.sender}-${msg.conversationId.receiver}`, // A consistent ID
                participants: [{id: req.user.id}, {id: otherUserId.toString()}],
                lastMessage: msg.lastMessage,
                timestamp: msg.timestamp
            };
        });

        res.status(200).json(conversations);

    } catch (error) {
        console.log("Error in getConversations controller: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
});


// @route   POST /api/messages/send/:receiverId
// @desc    Send a message to a user
router.post('/send/:receiverId', protect, async (req, res) => {
    try {
        const { message, imageUrl } = req.body;
        const { receiverId } = req.params;
        const senderId = req.user._id;

        const newMessage = new Message({
            sender: senderId,
            receiver: receiverId,
            message,
            imageUrl: imageUrl || null
        });

        await newMessage.save();

        const responseMessage = newMessage.toJSON();

        // Emit the message to the specific room for this DM
        const roomName = `dm-${[senderId.toString(), receiverId].sort().join('-')}`;
        req.io.to(roomName).emit('newMessage', responseMessage);
        
        res.status(201).json(responseMessage);

    } catch (error) {
        console.log("Error in sendMessage controller: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
});

// @route   GET /api/messages/:userToChatId
// @desc    Get messages between current user and another user
router.get('/:userToChatId', protect, async (req, res) => {
    try {
        const { userToChatId } = req.params;
        const senderId = req.user._id;

        const messages = await Message.find({
            $or: [
                { sender: senderId, receiver: userToChatId },
                { sender: userToChatId, receiver: senderId },
            ],
        }).sort({ createdAt: 1 });

        res.status(200).json(messages.map(m => m.toJSON()));

    } catch (error) {
        console.log("Error in getMessages controller: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
});

export default router;