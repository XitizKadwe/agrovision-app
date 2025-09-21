// netlify/functions/getLogs.js
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import Log from '../../src/models/Log.js'; // Adjust path if needed

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
    if (!token) return { statusCode: 401, body: JSON.stringify({ msg: 'No token, authorization denied' }) };

    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.user.id;

    await connectToDB();
    const logs = await Log.find({ user: userId }).sort({ date: -1 });

    return {
      statusCode: 200,
      body: JSON.stringify(logs),
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Server Error' }) };
  }
};
