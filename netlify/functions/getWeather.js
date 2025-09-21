// netlify/functions/getWeather.js
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import User from '../../src/models/User.js'; // Adjust path if needed
import { madhyaPradeshMarkets } from '../../src/data/locations.js'; // Adjust path if needed

const MONGO_URI = process.env.MONGO_URI;
const JWT_SECRET = process.env.GEMINI_API_KEY;
const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;

const connectToDB = async () => {
  if (mongoose.connection.readyState !== 1) {
    await mongoose.connect(MONGO_URI);
  }
};

export const handler = async (event) => {
  try {
    const token = event.headers['x-auth-token'];
    if (!token) {
      return { statusCode: 401, body: JSON.stringify({ msg: 'No token, authorization denied' }) };
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    await connectToDB();

    const user = await User.findById(decoded.user.id).select('-password');
    if (!user || !user.district) {
      return { statusCode: 404, body: JSON.stringify({ msg: 'User or user district not found' }) };
    }

    const locationData = madhyaPradeshMarkets[user.district];
    if (!locationData) {
      return { statusCode: 404, body: JSON.stringify({ msg: 'Location data not found for user district' }) };
    }

    const { lat, lon } = locationData;
    const URL = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric&lang=hi`;

    const weatherResponse = await fetch(URL);
    if (!weatherResponse.ok) {
      throw new Error('Failed to fetch weather from OpenWeatherMap');
    }

    const weatherData = await weatherResponse.json();

    return {
      statusCode: 200,
      body: JSON.stringify(weatherData),
    };

  } catch (error) {
    console.error("Error in getWeather function:", error);
    return { statusCode: 500, body: JSON.stringify({ error: 'Failed to get personalized weather' }) };
  }
};
