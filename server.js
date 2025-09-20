import express from 'express';
import cors from 'cors';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from './src/models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import auth from './src/middleware/auth.js';
import { madhyaPradeshMarkets } from './src/data/locations.js';
import Log from './src/models/Log.js';

dotenv.config({ path: './.env.local' });

// --- Robustness Check: Ensure all API keys are loaded on startup ---
if (!process.env.GEMINI_API_KEY || !process.env.OPENWEATHER_API_KEY || !process.env.AGMARKNET_API_KEY) {
    throw new Error("One or more required API keys are missing from your .env.local file.");
}

const app = express();
const port = 8000;

app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post('/gemini', async (req, res) => {
  const { prompt, language } = req.body;
  console.log(`Received prompt: "${prompt}" for language: "${language}"`);

  let systemInstruction = '';
  if (language && language.startsWith('hi')) {
    systemInstruction = `आप एक अनुभवी भारतीय कृषि सलाहकार हैं। आपका नाम 'कृषि मित्र' है। आपको केवल हिंदी में जवाब देना है। किसान के प्रश्न का सरल और सटीक उत्तर दें। प्रश्न: ${prompt}`;
  } else {
    systemInstruction = `You are an expert Indian agricultural advisor. Your name is 'Krishi Mitra'. You must answer only in English. Provide a simple and accurate answer to the farmer's question. Question: ${prompt}`;
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest"});
    const result = await model.generateContent(systemInstruction);
    const response = await result.response;
    const text = response.text();
    res.send({ response: text });
  } catch (error) {
    console.error("❌ Error during Gemini API call:", error);
    res.status(500).send({ error: 'Failed to get response from Gemini' });
  }
});

app.get('/mandi-prices', async (req, res) => {
    const API_KEY = process.env.AGMARKNET_API_KEY;
    const URL = `https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?api-key=${API_KEY}&format=json&filters[state]=Madhya%20Pradesh&filters[district]=Chhindwara&filters[market]=Chhindwara`;

    try {
        const response = await fetch(URL);
        const data = await response.json();
        const records = data.records;
        const prices = { maize: null, soyabean: null };
        const maizeRecord = records.find(record => record.commodity.toLowerCase().includes('maize'));
        const soyabeanRecord = records.find(record => record.commodity.toLowerCase().includes('soyabean'));
        if (maizeRecord) { prices.maize = maizeRecord.modal_price; }
        if (soyabeanRecord) { prices.soyabean = soyabeanRecord.modal_price; }
        console.log('✅ Found Mandi Prices:', prices);
        res.json(prices);
    } catch (error) {
        console.error("❌ Error fetching Mandi data:", error);
        res.status(500).send({ error: 'Failed to fetch Mandi data' });
    }
});

app.get('/mandi-details', async (req, res) => {
   const { district = 'Chhindwara', market = 'Chhindwara' } = req.query;
   console.log(`Fetching Mandi data for District: ${district}, Market: ${market}`);
   const API_KEY = process.env.AGMARKNET_API_KEY;
   const URL = `https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?api-key=${API_KEY}&format=json&filters[state]=Madhya%20Pradesh&filters[district]=${district}&filters[market]=${market}&limit=50`;

   try {
       const response = await fetch(URL);
       const data = await response.json();
       console.log(`✅ Found ${data.records.length} records for Mandi Details`);
       res.json(data.records);
   } catch (error) {
       console.error("❌ Error fetching detailed Mandi data:", error);
       res.status(500).send({ error: 'Failed to fetch detailed Mandi data' });
   }
});

const getMimeType = (url) => {
    if (url.endsWith('.png')) return 'image/png';
    if (url.endsWith('.webp')) return 'image/webp';
    if (url.endsWith('.gif')) return 'image/gif';
    return 'image/jpeg';
};

app.post('/diagnose', async (req, res) => {
    const { imageUrl } = req.body;
    if (!imageUrl) {
        return res.status(400).send({ error: "No image URL provided." });
    }
    console.log('✅ Received image for direct Gemini analysis:', imageUrl);

    try {
        const imageResponse = await fetch(imageUrl);
        if (!imageResponse.ok) {
            throw new Error(`Failed to fetch image. Status: ${imageResponse.status}`);
        }
        const imageBuffer = await imageResponse.arrayBuffer();
        const imageBase64 = Buffer.from(imageBuffer).toString('base64');
        const imagePart = { inline_data: { data: imageBase64, mime_type: getMimeType(imageUrl) } };

        const prompt = `
        You are an expert plant pathologist for Indian agriculture, specifically for crops found in Madhya Pradesh. Analyze the attached crop leaf image.
        Provide your response as a valid JSON object with this exact structure:
        {
          "diseaseName": "Name of the disease in Hindi and English",
          "confidence": "Your confidence percentage as a string (e.g., '95.2%')",
          "remedy": [
            "A simple, actionable step for the farmer in Hindi.",
            "Another simple step in Hindi.",
            "A third simple step in Hindi."
          ]
        }
        If the image is not a crop leaf or the disease is unclear, set diseaseName to 'रोग की पहचान नहीं हो सकी (Disease Not Recognized)'.
        `;

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
        const result = await model.generateContent([prompt, imagePart]);
        const response = await result.response;
        const cleanedJson = response.text().replace(/```json/g, '').replace(/```/g, '').trim();
        const diagnosis = JSON.parse(cleanedJson);
        console.log('✅ Gemini Diagnosis:', diagnosis.diseaseName);
        res.json(diagnosis);
    } catch (error) {
        console.error("❌ Error during direct Gemini analysis:", error);
        res.status(500).send({ error: "Failed to get diagnosis from Gemini." });
    }
});

// --- THIS ROUTE IS NOW FIXED ---
// --- THIS ROUTE IS NOW FIXED AND CLEANED UP ---
app.get('/weather-details', async (req, res) => {
    const API_KEY = process.env.OPENWEATHER_API_KEY; 
    const LAT = '22.7196'; // Indore's Latitude
    const LON = '75.8577'; // Indore's Longitude
    
    const FORECAST_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${LAT}&lon=${LON}&appid=${API_KEY}&units=metric&lang=hi`;
    const CURRENT_URL = `https://api.openweathermap.org/data/2.5/weather?lat=${LAT}&lon=${LON}&appid=${API_KEY}&units=metric&lang=hi`;

    try {
        // Step 1: Fetch both current and forecast data at the same time
        console.log('Fetching forecast from free tier API...');
        const [forecastResponse, currentResponse] = await Promise.all([
            fetch(FORECAST_URL),
            fetch(CURRENT_URL)
        ]);

        if (!forecastResponse.ok || !currentResponse.ok) {
            throw new Error(`OpenWeatherMap API Error`);
        }
        
        // This is now the only place forecastData is declared
        const forecastData = await forecastResponse.json(); 
        const currentData = await currentResponse.json();
        console.log('✅ Forecast data received.');

        // Step 2: Process the 3-hour forecast data to create a simple daily summary
        const dailySummary = {};
        forecastData.list.forEach(item => {
            const date = new Date(item.dt * 1000).toISOString().split('T')[0];
            if (!dailySummary[date]) {
                dailySummary[date] = { temps: [], weather: [], dt: item.dt };
            }
            dailySummary[date].temps.push(item.main.temp);
            dailySummary[date].weather.push(item.weather[0]);
        });

        const processedDaily = Object.values(dailySummary).map(day => {
            const temp_min = Math.min(...day.temps);
            const temp_max = Math.max(...day.temps);
            const representativeWeather = day.weather[Math.floor(day.weather.length / 2)];
            return { temp: { min: temp_min, max: temp_max }, weather: [representativeWeather], dt: day.dt };
        });

        // Step 3: Send processed data to Gemini for analysis
        console.log('Sending processed forecast to Gemini...');
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
        const prompt = `Analyze this 5-day weather forecast for a farmer in Indore, MP. Provide a 2-3 line summary in simple Hindi. Highlight risks like rain, high winds, or heat. Weather Data: ${JSON.stringify(processedDaily)}`;
        const result = await model.generateContent(prompt);
        const aiSummary = (await result.response).text();
        console.log('✅ AI summary received.');
        
        // Step 4: Send the combined, processed data to the frontend
        res.json({
            current: currentData,
            hourly: forecastData.list,
            daily: processedDaily,
            aiSummary
        });

    } catch (error) {
        console.error("❌ Error in weather-details route:", error);
        res.status(500).send({ error: 'Failed to get detailed weather data' });
    }
});

// --- NEW KRISHI LOG ANALYSIS ROUTE ---
app.post('/analyze-logs', async (req, res) => {
    const { logs } = req.body;

    // Check if we received any logs
    if (!logs || logs.length === 0) {
        return res.status(400).send({ error: "No log data provided." });
    }

    console.log(`✅ Received ${logs.length} log entries for analysis.`);

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

        // This is a detailed instruction telling Gemini how to behave
        const prompt = `
            You are an expert farm finance advisor named 'कृषि-विश्लेषक'. Your task is to analyze a farmer's activity log and provide a summary and one piece of actionable advice in simple Hindi.

            Here is the farmer's log data:
            ${JSON.stringify(logs)}

            Based on this data, provide a response as a single string. The response should have:
            1. A title: "कृषि लॉग विश्लेषण रिपोर्ट".
            2. Total calculated expenses (कुल खर्च).
            3. The activity with the highest expense (सबसे महंगा काम).
            4. One simple, encouraging, and actionable piece of advice for the farmer based on their spending or activities.
            
            Format the entire response clearly in Hindi.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const analysisText = response.text();
        
        console.log('✅ Gemini analysis complete.');
        res.send({ analysis: analysisText });

    } catch (error) {
        console.error("❌ Error during log analysis:", error);
        res.status(500).send({ error: 'Failed to get analysis from Gemini' });
    }
});

// --- AUTH ROUTES ---
// REGISTER a new user
app.post('/api/auth/register', async (req, res) => {
    const { name, phone, password, district } = req.body; // <-- Add district
    try {
        const existingUser = await User.findOne({ phone });
        if (existingUser) return res.status(400).json({ msg: 'User already exists' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Add district when creating the new user
        const newUser = new User({ name, phone, password: hashedPassword, district }); 
        await newUser.save();
        res.status(201).json({ msg: 'User registered successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// LOGIN a user
app.post('/api/auth/login', async (req, res) => {
    const { phone, password } = req.body;
    try {
        const user = await User.findOne({ phone });
        if (!user) return res.status(400).json({ msg: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

        const payload = { user: { id: user.id } };
        const token = jwt.sign(payload, process.env.GEMINI_API_KEY, { expiresIn: '7d' }); // Using Gemini key as a secret for simplicity

        res.json({ token, user: { name: user.name, phone: user.phone } });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
app.get('/api/weather', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) return res.status(404).json({ msg: 'User not found' });
        
        const district = user.district;
        const locationData = madhyaPradeshMarkets[district];
        if (!locationData) return res.status(404).json({ msg: 'Location data not found for user district' });

        const { lat, lon } = locationData;
        const API_KEY = process.env.OPENWEATHER_API_KEY;
        
        const CURRENT_URL = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=hi`;
        const weatherResponse = await fetch(CURRENT_URL);
        if (!weatherResponse.ok) throw new Error('Failed to fetch weather');
        
        const weatherData = await weatherResponse.json();
        res.json(weatherData);

    } catch (error) {
        console.error("❌ Error in personalized weather route:", error);
        res.status(500).send({ error: 'Failed to get personalized weather' });
    }
});

// GET all logs for the logged-in user
app.get('/api/logs', auth, async (req, res) => {
    try {
        const logs = await Log.find({ user: req.user.id }).sort({ date: -1 });
        res.json(logs);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// ADD a new log entry
app.post('/api/logs', auth, async (req, res) => {
    const { date, crop, activityType, activity, expense, yieldAmount } = req.body;
    try {
        const newLog = new Log({
            user: req.user.id,
            date,
            crop,
            activityType,
            activity,
            expense,
            yield: yieldAmount,
        });
        const log = await newLog.save();
        res.json(log);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// DELETE a log entry
app.delete('/api/logs/:id', auth, async (req, res) => {
    try {
        let log = await Log.findById(req.params.id);
        if (!log) return res.status(404).json({ msg: 'Log not found' });

        // Make sure user owns the log
        if (log.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        await Log.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Log removed' });
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ MongoDB Connected'))
    .catch(err => console.error('❌ MongoDB Connection Error:', err));

    
app.listen(port, () => {
  console.log(`✅ Server is running on http://localhost:${port}`);
});