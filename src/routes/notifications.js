import express from 'express';
import auth from '../middleware/auth.js';
import Notification from '../models/Notification.js'; // Import the model

const router = express.Router();

// --- GET /api/notifications ---
router.get('/', auth, async (req, res) => {
    try {
        const notifications = await Notification.find({
            $or: [{ recipient: null }, { recipient: req.user.id }]
        }).sort({ publishDate: -1 });
        res.json(notifications);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// --- GET /api/notifications/unread-count ---
router.get('/unread-count', auth, async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ msg: 'User not authorized' });
        }
        const count = await Notification.countDocuments({
            $or: [{ recipient: null }, { recipient: req.user.id }]
            // Simplified unread logic
        });
        res.json({ count });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// --- POST /api/notifications/:id/mark-as-read ---
router.post('/:id/mark-as-read', auth, async (req, res) => {
    // This is simplified logic. A full implementation would be different.
    try {
        console.log(`User ${req.user.id} read notification ${req.params.id}`);
        res.json({ msg: 'Notification marked as read' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

export default router;
