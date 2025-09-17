import express from 'express';
import User from '../models/userModel.js';
import Post from '../models/postModel.js';
import Notification from '../models/notificationModel.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

// @route   GET /api/users
// @desc    Get all users, sorted by newest
router.get('/', protect, async (req, res) => {
    try {
        const users = await User.find({}).select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});


// @route   GET /api/users/:id
// @desc    Get user profile by ID
router.get('/:id', protect, async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});


// @route   PUT /api/users/profile
// @desc    Update user profile
router.put('/profile', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (user) {
            user.name = req.body.name || user.name;
            user.username = req.body.username || user.username;
            user.bio = req.body.bio ?? user.bio;
            user.avatarUrl = req.body.avatarUrl === null ? null : req.body.avatarUrl || user.avatarUrl;
            user.bannerUrl = req.body.bannerUrl === null ? null : req.body.bannerUrl || user.bannerUrl;

            const updatedUser = await user.save();
            
            // Emit an event to all clients that this user has been updated
            req.io.emit('userUpdated', updatedUser.toJSON());

            res.json(updatedUser);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   DELETE /api/users/profile
// @desc    Delete user account
router.delete('/profile', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        await Post.deleteMany({ user: req.user.id });
        
        await User.updateMany(
            { $or: [{ followers: req.user.id }, { following: req.user.id }, { blockedUsers: req.user.id }] },
            { $pull: { followers: req.user.id, following: req.user.id, blockedUsers: req.user.id } }
        );

        await user.deleteOne();
        res.json({ message: 'User account deleted successfully.' });
    } catch (error) {
        console.error('Delete account error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});


// @route   PUT /api/users/:id/follow
// @desc    Follow / Unfollow a user
router.put('/:id/follow', protect, async (req, res) => {
    try {
        const userToFollow = await User.findById(req.params.id);
        const currentUser = await User.findById(req.user.id);

        if (!userToFollow || !currentUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (req.params.id === req.user.id) {
            return res.status(400).json({ message: 'You cannot follow yourself' });
        }
        
        const isFollowing = currentUser.following.includes(userToFollow._id);

        if (isFollowing) {
            // Unfollow
            currentUser.following = currentUser.following.filter(id => id.toString() !== userToFollow._id.toString());
            userToFollow.followers = userToFollow.followers.filter(id => id.toString() !== currentUser._id.toString());
        } else {
            // Follow
            currentUser.following.push(userToFollow._id);
            userToFollow.followers.push(currentUser._id);

            // Create notification
            const notification = new Notification({
                recipient: userToFollow._id,
                sender: currentUser._id,
                type: 'follow',
            });
            await notification.save();
            const populatedNotification = await notification.populate('sender', 'id name username avatarUrl');
            
            // Emit notification to the user who was followed
            const recipientSocket = req.onlineUsers.get(userToFollow._id.toString());
            if (recipientSocket) {
                req.io.to(recipientSocket).emit('newNotification', populatedNotification);
            }
        }

        await currentUser.save();
        await userToFollow.save();

        // Emit updates for both users
        req.io.emit('userUpdated', currentUser.toJSON());
        req.io.emit('userUpdated', userToFollow.toJSON());

        res.json({ message: 'Follow status updated' });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   PUT /api/users/:id/block
// @desc    Block / Unblock a user
router.put('/:id/block', protect, async (req, res) => {
    try {
        const userToBlock = await User.findById(req.params.id);
        const currentUser = await User.findById(req.user.id);

        if (!userToBlock || !currentUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (req.params.id === req.user.id) {
            return res.status(400).json({ message: 'You cannot block yourself' });
        }

        const isBlocked = currentUser.blockedUsers.includes(userToBlock._id);

        if (isBlocked) {
            // Unblock
            currentUser.blockedUsers = currentUser.blockedUsers.filter(id => id.toString() !== userToBlock._id.toString());
        } else {
            // Block
            currentUser.blockedUsers.push(userToBlock._id);
            // Also force unfollow from both sides
            currentUser.following = currentUser.following.filter(id => id.toString() !== userToBlock._id.toString());
            userToBlock.followers = userToBlock.followers.filter(id => id.toString() !== currentUser._id.toString());
            // And remove from their following list
            userToBlock.following = userToBlock.following.filter(id => id.toString() !== currentUser._id.toString());
            currentUser.followers = currentUser.followers.filter(id => id.toString() !== userToBlock._id.toString());
        }

        await currentUser.save();
        await userToBlock.save();
        
        res.json({ message: 'Block status updated' });

    } catch (error) {
        console.error('Block user error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});


export default router;