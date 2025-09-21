import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    summary: {
        type: String,
        required: true
    },
    sourceUrl: {
        type: String,
        required: true,
        unique: true
    },
    publishDate: {
        type: Date,
        required: true
    },
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    isRead: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

export default mongoose.model('Notification', notificationSchema);
