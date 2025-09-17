import express from 'express';
import protect from '../middleware/authMiddleware.js';
import Notification from '../models/notificationModel.js';

const router = express.Router();

// @route   GET /api/notifications
// @desc    Get all notifications for the current user
router.get('/', protect, async (req, res) => {
    try {
        const notifications = await Notification.find({ recipient: req.user.id })
            .populate('sender', 'id name username avatarUrl')
            .sort({ createdAt: -1 });
        
        res.json(notifications);
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   PUT /api/notifications/read
// @desc    Mark all notifications as read
router.put('/read', protect, async (req, res) => {
    try {
        await Notification.updateMany({ recipient: req.user.id }, { $set: { read: true } });
        res.json({ message: 'Notifications marked as read' });
    } catch (error) {
        console.error('Error marking notifications as read:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});

export default router;
