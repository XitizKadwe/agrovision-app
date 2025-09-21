import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize outside the handler for performance
const API_KEY = process.env.OPENWEATHER_API_KEY;
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const LAT = '22.7196'; // Indore's Latitude
const LON = '75.8577'; // Indore's Longitude

export const handler = async (event) => {
    // This is the main function Netlify will run
    const FORECAST_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${LAT}&lon=${LON}&appid=${API_KEY}&units=metric&lang=hi`;
    const CURRENT_URL = `https://api.openweathermap.org/data/2.5/weather?lat=${LAT}&lon=${LON}&appid=${API_KEY}&units=metric&lang=hi`;

    try {
        const [forecastResponse, currentResponse] = await Promise.all([
            fetch(FORECAST_URL),
            fetch(CURRENT_URL)
        ]);

        if (!forecastResponse.ok || !currentResponse.ok) {
            throw new Error(`OpenWeatherMap API Error`);
        }

        const forecastData = await forecastResponse.json();
        const currentData = await currentResponse.json();

        // Process the 3-hour forecast data to create a simple daily summary
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

        // Send processed data to Gemini for analysis
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
        const prompt = `Analyze this 5-day weather forecast for a farmer in Indore, MP. Provide a 2-3 line summary in simple Hindi. Highlight risks like rain, high winds, or heat. Weather Data: ${JSON.stringify(processedDaily)}`;
        const result = await model.generateContent(prompt);
        const aiSummary = (await result.response).text();

        // Return the final data in the correct format for a Netlify Function
        return {
            statusCode: 200,
            body: JSON.stringify({
                current: currentData,
                hourly: forecastData.list,
                daily: processedDaily,
                aiSummary
            })
        };

    } catch (error) {
        console.error("Error in weather-details function:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to get detailed weather data' })
        };
    }
};
