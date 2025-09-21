// netlify/functions/deleteLog.js
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
  if (event.httpMethod !== 'DELETE') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }
  try {
    const token = event.headers['x-auth-token'];
    if (!token) return { statusCode: 401, body: JSON.stringify({ msg: 'No token' }) };

    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.user.id;

    // In Netlify, the ID comes from a query parameter, not a path parameter
    const logIdToDelete = event.queryStringParameters.id;

    await connectToDB();

    const log = await Log.findById(logIdToDelete);
    if (!log) return { statusCode: 404, body: JSON.stringify({ msg: 'Log not found' }) };
    if (log.user.toString() !== userId) return { statusCode: 401, body: JSON.stringify({ msg: 'Not authorized' }) };

    await Log.findByIdAndDelete(logIdToDelete);

    return {
      statusCode: 200,
      body: JSON.stringify({ msg: 'Log removed' }),
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Server Error' }) };
  }
};
