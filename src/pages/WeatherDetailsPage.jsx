import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, Loader2, Sun, Cloud, CloudRain } from 'lucide-react';
import { motion } from 'framer-motion';

// Helper functions (keep these as they are)
const getWeatherIcon = (description = '', size = 24) => {
    if (description.includes('rain')) return <CloudRain size={size} className="text-blue-500" />;
    if (description.includes('cloud')) return <Cloud size={size} className="text-gray-500" />;
    return <Sun size={size} className="text-yellow-500" />;
};
const formatTime = (timestamp) => new Date(timestamp * 1000).toLocaleTimeString('en-IN', { hour: 'numeric', hour12: true });
const formatDay = (timestamp) => new Date(timestamp * 1000).toLocaleDateString('hi-IN', { weekday: 'long' });

function WeatherDetailsPage() {
    const [details, setDetails] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchWeatherDetails = async () => {
            try {
                // We start by setting loading to true
                setIsLoading(true);
                const response = await fetch('/.netlify/functions/getWeatherDetails');
                if (!response.ok) { throw new Error("Backend request failed"); }
                const data = await response.json();
                setDetails(data);
            } catch (error) {
                console.error("Failed to fetch weather details:", error);
                setDetails(null); // On error, ensure details is null
            } finally {
                // We finish by setting loading to false
                setIsLoading(false);
            }
        };
        fetchWeatherDetails();
    }, []);

    // --- THIS IS THE CRITICAL FIX ---

    // Guard Clause 1: If the API call is in progress, show a loading screen and stop.
    if (isLoading) {
        return <div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin text-green-500" size={48} /></div>;
    }

    // Guard Clause 2: If loading is finished but the data is still missing (due to an error), show an error message and stop.
    if (!details || !details.current) {
        return (
            <div className="p-4 text-center">
                <p className="font-semibold text-red-500">मौसम डेटा लोड करने में विफल।</p>
                <p className="text-sm text-gray-500">कृपया अपनी इंटरनेट जाँच करें और पुनः प्रयास करें।</p>
                <Link to="/" className="text-blue-500 mt-4 inline-block">होमपेज पर वापस जाएं</Link>
            </div>
        );
    }
    
    // --- END OF FIX ---
    
    // Only if the checks above pass is it safe to use the data.
    const { current, hourly, daily, aiSummary } = details;

    return (
        <div className="p-4">
            <div className="flex items-center gap-2 mb-4">
                <Link to="/"><ChevronLeft /></Link>
                <h1 className="text-xl font-bold">मौसम का विवरण</h1>
            </div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white p-4 rounded-xl shadow-lg mb-6">
                <h2 className="font-bold mb-2">💡 कृषि मित्र की सलाह</h2>
                <p className="text-sm">{aiSummary}</p>
            </motion.div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                 <div className="bg-white p-4 rounded-xl shadow-md text-center">
                    <p className="text-sm text-gray-500">तापमान</p>
                    <p className="text-3xl font-bold">{Math.round(current.main.temp)}°C</p>
                </div>
                 <div className="bg-white p-4 rounded-xl shadow-md text-center">
                    <p className="text-sm text-gray-500">हवा</p>
                    <p className="text-3xl font-bold">{Math.round(current.wind.speed * 3.6)}<span className="text-lg"> km/h</span></p>
                </div>
                 <div className="bg-white p-4 rounded-xl shadow-md text-center">
                    <p className="text-sm text-gray-500">आर्द्रता</p>
                    <p className="text-3xl font-bold">{current.main.humidity}%</p>
                </div>
                 <div className="bg-white p-4 rounded-xl shadow-md text-center">
                    <p className="text-sm text-gray-500">अधिकतम / न्यूनतम</p>
                    <p className="text-3xl font-bold">{Math.round(daily[0].temp.max)}°/{Math.round(daily[0].temp.min)}°</p>
                </div>
            </div>
            <h2 className="font-bold text-gray-800 mb-3">अगले कुछ घंटे</h2>
            <div className="flex overflow-x-auto gap-3 pb-4">
                {hourly.slice(0, 8).map((hour, index) => (
                    <div key={index} className="flex-shrink-0 bg-white p-3 rounded-xl shadow-md text-center w-20">
                        <p className="text-sm font-semibold">{formatTime(hour.dt)}</p>
                        {getWeatherIcon(hour.weather[0].description, 32)}
                        <p className="font-bold mt-2">{Math.round(hour.main.temp)}°C</p>
                    </div>
                ))}
            </div>
            <h2 className="font-bold text-gray-800 mt-6 mb-3">अगले 5 दिन</h2>
            <div className="space-y-2">
                {daily.map((day, index) => (
                     <div key={index} className="bg-white p-3 rounded-xl shadow-md flex items-center justify-between">
                        <p className="font-bold w-1/4">{index === 0 ? 'आज' : formatDay(day.dt)}</p>
                        <div className="w-1/4 flex justify-center">{getWeatherIcon(day.weather[0].description)}</div>
                        <p className="text-sm text-gray-600 w-1/2 text-right">{day.weather[0].description}</p>
                        <p className="font-bold w-1/4 text-right">{Math.round(day.temp.max)}°/{Math.round(day.temp.min)}°</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
export default WeatherDetailsPage;
