// models/Notification.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth'); // Your authentication middleware
const Notification = require('../models/Notification');
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    title: { 
        type: String, 
        required: true 
    },
    summary: { 
        type: String, 
        required: true 
    },
    sourceUrl: { // This will be the unique link to the scheme
        type: String, 
        required: true,
        unique: true // Prevents duplicate notifications
    },
    publishDate: { 
        type: Date, 
        required: true 
    },
    // The recipient field tells us who the notification is for.
    // If it's null, it's a broadcast message for everyone.
    recipient: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        default: null
    },
    isRead: { // This will be specific to a user, we'll handle this logic later
        type: Boolean, 
        default: false 
    }
}, { 
    // Automatically adds createdAt and updatedAt fields
    timestamps: true 
});

// --- 1. GET /api/notifications ---
// @desc    Get all notifications for the logged-in user
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        // Find notifications that are either broadcast (recipient is null)
        // or specifically for the logged-in user (recipient matches user.id).
        // We sort by publishDate to show the newest ones first.
        const notifications = await Notification.find({
            $or: [
                { recipient: null },
                { recipient: req.user.id }
            ]
        }).sort({ publishDate: -1 });

        res.json(notifications);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// --- 2. GET /api/notifications/unread-count ---
// @desc    Get the count of unread notifications
// @access  Private
router.get('/unread-count', auth, async (req, res) => {
    try {
        // This is a more complex query. We need a way to track 'read' status per user.
        // For now, we will count all recent notifications as a placeholder.
        // A full implementation would require a separate "UserNotificationStatus" model.
        // Let's count all notifications created in the last 30 days for simplicity.
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const count = await Notification.countDocuments({
            $or: [
                { recipient: null },
                { recipient: req.user.id }
            ],
            publishDate: { $gte: thirtyDaysAgo } // A simplified "unread" logic
        });
        
        res.json({ count });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// --- 3. POST /api/notifications/:id/mark-as-read ---
// @desc    Mark a notification as read for a user
// @access  Private
router.post('/:id/mark-as-read', auth, async (req, res) => {
    try {
        // In a full system, this would not change the notification itself.
        // It would update a record in a joining table like:
        // UserNotificationStatus.findOneAndUpdate({ user: req.user.id, notification: req.params.id }, { isRead: true });
        // For our simplified model, this endpoint will just return success.
        
        console.log(`User ${req.user.id} read notification ${req.params.id}`);
        res.json({ msg: 'Notification marked as read' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
module.exports = mongoose.model('Notification', notificationSchema);