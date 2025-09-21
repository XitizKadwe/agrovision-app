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
