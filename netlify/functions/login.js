// netlify/functions/login.js

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../../src/models/User.js'; // Make sure this path is correct

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
    await connectToDB();
    const { phone, password } = JSON.parse(event.body);

    const user = await User.findOne({ phone });
    if (!user) {
      return { statusCode: 400, body: JSON.stringify({ msg: 'Invalid credentials' }) };
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return { statusCode: 400, body: JSON.stringify({ msg: 'Invalid credentials' }) };
    }

    const payload = { user: { id: user.id } };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

    return {
      statusCode: 200,
      body: JSON.stringify({ token, user: { name: user.name, phone: user.phone } }),
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
