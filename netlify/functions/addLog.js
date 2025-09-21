// netlify/functions/addLog.js
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import Log from '../../src/models/Log.js';

const MONGO_URI = process.env.MONGO_URI;
const JWT_SECRET = process.env.GEMINI_API_KEY;

const connectToDB = async () => {
  if (mongoose.connection.readyState !== 1) {
    await mongoose.connect(MONGO_URI);
  }
};

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }
  try {
    const token = event.headers['x-auth-token'];
    if (!token) return { statusCode: 401, body: JSON.stringify({ msg: 'No token' }) };
    
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.user.id;
    
    await connectToDB();

    const { date, crop, activityType, activity, expense, yieldAmount } = JSON.parse(event.body);
    const newLog = new Log({ user: userId, date, crop, activityType, activity, expense, yield: yieldAmount });
    const log = await newLog.save();

    return {
      statusCode: 200,
      body: JSON.stringify(log),
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Server Error' }) };
  }
};
