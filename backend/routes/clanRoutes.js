import express from 'express';
import protect from '../middleware/authMiddleware.js';
import Tribe from '../models/clanModel.js';
import TribeMessage from '../models/clanMessageModel.js';
import User from '../models/userModel.js';

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
            avatarUrl: avatarUrl || `https://i.pravatar.cc/150?u=${name.replace(/\s/g, '')}`,
            owner: req.user.id,
            members: [req.user.id], // Owner is the first member
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
        const tribes = await Tribe.find({}).populate('owner', 'name username');
        res.json(tribes);
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
            // Leave tribe
             if (tribe.owner.equals(req.user.id)) {
                return res.status(400).json({ message: 'Owner cannot leave the tribe' });
            }
            tribe.members = tribe.members.filter(memberId => !memberId.equals(req.user.id));
        } else {
            // Join tribe
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

        // Check if user is a member
        if (!tribe.members.some(memberId => memberId.equals(req.user.id))) {
            return res.status(403).json({ message: 'You must be a member to view messages' });
        }
        
        const messages = await TribeMessage.find({ tribe: req.params.id })
            .populate('sender', 'name username avatarUrl')
            .sort({ createdAt: 'asc' });
        
        res.json(messages);

    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});


// @route   POST /api/tribes/:id/messages
// @desc    Post a new message in a tribe
router.post('/:id/messages', protect, async (req, res) => {
    const { text } = req.body;
    if (!text) {
        return res.status(400).json({ message: 'Message text is required' });
    }
    try {
        const tribe = await Tribe.findById(req.params.id);
        if (!tribe) return res.status(404).json({ message: 'Tribe not found' });

        // Check if user is a member
        if (!tribe.members.some(memberId => memberId.equals(req.user.id))) {
            return res.status(403).json({ message: 'You must be a member to send messages' });
        }
        
        const message = new TribeMessage({
            tribe: req.params.id,
            sender: req.user.id,
            text,
        });

        const savedMessage = await message.save();
        const populatedMessage = await savedMessage.populate('sender', 'name username avatarUrl');

        res.status(201).json(populatedMessage);

    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});


export default router;