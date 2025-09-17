import express from 'express';
import protect from '../middleware/authMiddleware.js';
import Tribe from '../models/tribeModel.js';
import TribeMessage from '../models/tribeMessageModel.js';

const router = express.Router();

// @route   POST /api/tribes
// @desc    Create a new tribe
router.post('/', protect, async (req, res) => {
    const { name, description, avatarUrl } = req.body;
    if (!name || !description) {
        return res.status(400).json({ message: 'Please provide a name and description' });
    }
    try {
        const tribeExists = await Tribe.findOne({ name });
        if (tribeExists) {
            return res.status(400).json({ message: 'A tribe with this name already exists' });
        }
        const tribe = new Tribe({
            name,
            description,
            avatarUrl,
            owner: req.user.id,
            members: [req.user.id],
        });
        const createdTribe = await tribe.save();
        res.status(201).json(createdTribe);
    } catch (error) {
        console.error('Error creating tribe:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   GET /api/tribes
// @desc    Get all tribes
router.get('/', protect, async (req, res) => {
    try {
        const tribes = await Tribe.find({}).sort({ createdAt: -1 });
        res.json(tribes);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   PUT /api/tribes/:id
// @desc    Update a tribe
router.put('/:id', protect, async (req, res) => {
    const { name, description, avatarUrl } = req.body;
    try {
        const tribe = await Tribe.findById(req.params.id);
        if (!tribe) {
            return res.status(404).json({ message: 'Tribe not found' });
        }
        if (tribe.owner.toString() !== req.user.id) {
            return res.status(401).json({ message: 'User not authorized' });
        }
        tribe.name = name || tribe.name;
        tribe.description = description || tribe.description;
        if (avatarUrl !== undefined) {
          tribe.avatarUrl = avatarUrl;
        }
        const updatedTribe = await tribe.save();
        res.json(updatedTribe);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   PUT /api/tribes/:id/join
// @desc    Join or leave a tribe
router.put('/:id/join', protect, async (req, res) => {
    try {
        const tribe = await Tribe.findById(req.params.id);
        if (!tribe) {
            return res.status(404).json({ message: 'Tribe not found' });
        }
        const isMember = tribe.members.some(memberId => memberId.equals(req.user.id));
        if (isMember) {
             if (tribe.owner.equals(req.user.id)) {
                return res.status(400).json({ message: 'Owner cannot leave the tribe' });
            }
            tribe.members = tribe.members.filter(memberId => !memberId.equals(req.user.id));
        } else {
            tribe.members.push(req.user.id);
        }
        await tribe.save();
        res.json(tribe);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   GET /api/tribes/:id/messages
// @desc    Get all messages for a tribe
router.get('/:id/messages', protect, async (req, res) => {
    try {
        const tribe = await Tribe.findById(req.params.id);
        if (!tribe) return res.status(404).json({ message: 'Tribe not found' });
        
        if (!tribe.members.some(memberId => memberId.equals(req.user.id))) {
            return res.status(403).json({ message: 'You must be a member to view messages' });
        }
        
        const messages = await TribeMessage.find({ tribe: req.params.id })
            .sort({ createdAt: 'asc' });
        
        res.json(messages.map(m => m.toJSON()));

    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   POST /api/tribes/:id/messages
// @desc    Post a new message in a tribe
router.post('/:id/messages', protect, async (req, res) => {
    const { text, imageUrl } = req.body;
    if (!text && !imageUrl) {
        return res.status(400).json({ message: 'Message text or image is required' });
    }
    try {
        const tribe = await Tribe.findById(req.params.id);
        if (!tribe) return res.status(404).json({ message: 'Tribe not found' });
        if (!tribe.members.some(memberId => memberId.equals(req.user.id))) {
            return res.status(403).json({ message: 'You must be a member to send messages' });
        }
        const message = new TribeMessage({
            tribe: req.params.id,
            sender: req.user.id,
            text,
            imageUrl: imageUrl || null
        });
        const savedMessage = await message.save();
        const responseMessage = savedMessage.toJSON();

        // Emit the message to the tribe's room
        req.io.to(`tribe-${req.params.id}`).emit('newTribeMessage', responseMessage);

        res.status(201).json(responseMessage);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

export default router;