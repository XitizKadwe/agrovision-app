import mongoose from 'mongoose';

const LogSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true },
    crop: { type: String, required: true },
    activityType: { type: String, required: true },
    activity: { type: String, required: true },
    expense: { type: Number, default: 0 },
    yield: { type: Number, default: 0 },
});

export default mongoose.model('Log', LogSchema);