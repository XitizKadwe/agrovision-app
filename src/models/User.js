import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    district: { type: String, required: true }, // <-- ADD THIS LINE
});

export default mongoose.model('User', UserSchema);