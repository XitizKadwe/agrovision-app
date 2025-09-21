// netlify/functions/register.js

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../../src/models/User.js'; // Adjust path if needed

const MONGO_URI = process.env.MONGO_URI;

// Helper to connect to the database
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

    const { name, phone, password, district } = JSON.parse(event.body);

    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return { statusCode: 400, body: JSON.stringify({ msg: 'User already exists' }) };
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({ name, phone, password: hashedPassword, district });
    await newUser.save();

    return {
      statusCode: 201,
      body: JSON.stringify({ msg: 'User registered successfully' }),
    };

  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
