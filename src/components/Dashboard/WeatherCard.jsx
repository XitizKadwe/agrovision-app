import React from 'react';
import { Link } from 'react-router-dom';
import { Loader2, Sun, Cloud, CloudRain } from 'lucide-react';

// Helper to get an icon based on weather description
const getWeatherIcon = (description = '', size = 40) => {
    if (description.includes('rain')) return <CloudRain size={size} className="text-blue-500" />;
    if (description.includes('cloud')) return <Cloud size={size} className="text-gray-500" />;
    return <Sun size={size} className="text-yellow-500" />;
};

function WeatherCard({ weatherData, loading }) {
  // Show a loading skeleton while data is being fetched by the parent
  if (loading || !weatherData) {
    return (
      <div className="bg-white p-4 rounded-xl shadow-md border border-gray-100 mb-6 h-[116px] animate-pulse">
        {/* Skeleton UI */}
      </div>
    );
  }

  // Once loaded, display the live data passed via props
  const { temp, weather, wind } = weatherData;

  return (
    <Link to="/weather-details" className="block hover:scale-[1.02] transition-transform duration-200">
      <div className="bg-white p-4 rounded-xl shadow-md border border-gray-100 mb-6">
        <h2 className="text-base font-semibold text-gray-500 mb-2">आज का मौसम</h2>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {getWeatherIcon(weather[0].description)}
            <div>
              <p className="text-3xl font-bold text-gray-800">{Math.round(temp)}°C</p>
              <p className="text-sm text-gray-500 capitalize">{weather[0].description}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-700 font-semibold">हवा: {Math.round(wind.speed * 3.6)} km/h</p>
            {/* This is now a span, which fixes the nested link error */}
            <span className="text-sm font-semibold text-green-600">
              पूरा पूर्वानुमान &gt;
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default WeatherCard;