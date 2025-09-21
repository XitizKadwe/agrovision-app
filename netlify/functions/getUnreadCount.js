// netlify/functions/getUnreadCount.js
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import Notification from '../../src/models/Notification.js'; // Adjust path if needed

const MONGO_URI = process.env.MONGO_URI;
const JWT_SECRET = process.env.GEMINI_API_KEY;

// Helper to connect to the database
const connectToDB = async () => {
  if (mongoose.connection.readyState !== 1) {
    await mongoose.connect(MONGO_URI);
  }
};

export const handler = async (event) => {
  try {
    const token = event.headers['x-auth-token'];
    if (!token) {
      // If no user, there are 0 unread notifications for them
      return { statusCode: 200, body: JSON.stringify({ count: 0 }) };
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.user.id;

    await connectToDB();

    // Count documents that are for everyone OR for this specific user, and are not yet read.
    // NOTE: Our simple model doesn't track isRead per-user, so this is a simplified count.
    const count = await Notification.countDocuments({
        $or: [{ recipient: null }, { recipient: userId }]
        // In a more complex app, you'd add a filter for isRead: false here.
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ count }),
    };

  } catch (err) {
    console.error("Error in getUnreadCount:", err);
    // Don't crash the app, just return 0 if there's an error.
    return { statusCode: 200, body: JSON.stringify({ count: 0 }) };
  }
};
