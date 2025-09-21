// netlify/functions/getRecentNotifications.js
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import Notification from '../../src/models/Notification.js';

const MONGO_URI = process.env.MONGO_URI;
const JWT_SECRET = process.env.GEMINI_API_KEY;

const connectToDB = async () => {
  if (mongoose.connection.readyState !== 1) {
    await mongoose.connect(MONGO_URI);
  }
};

export const handler = async (event) => {
  try {
    const token = event.headers['x-auth-token'];
    if (!token) return { statusCode: 401, body: JSON.stringify([]) }; // Return empty array if no token

    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.user.id;

    await connectToDB();

    const notifications = await Notification.find({
        $or: [{ recipient: null }, { recipient: userId }]
    }).sort({ publishDate: -1 }).limit(5); // Get the 5 newest

    return {
      statusCode: 200,
      body: JSON.stringify(notifications),
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Server Error' }) };
  }
};
