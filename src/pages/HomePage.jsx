import React, { useState, useEffect } from 'react'; // <--- THIS LINE IS NOW FIXED
import { motion } from 'framer-motion';
import WeatherCard from '../components/Dashboard/WeatherCard';
import MandiPriceCard from '../components/Dashboard/MandiPriceCard';
import QuickLinks from '../components/Dashboard/QuickLinks';
import ActionButtons from '../components/Dashboard/ActionButtons';
import { useTranslation } from 'react-i18next';
import { Mic } from 'lucide-react';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useAuth } from '../context/AuthContext';

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const itemVariants = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } };

function HomePage() {
    const { t } = useTranslation();
  const farmerName = "शुभ";
  const { isListening, transcript, startListening } = useSpeechRecognition();

  const { token } = useAuth();
  const [currentWeather, setCurrentWeather] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(true);

 // Inside HomePage.jsx
useEffect(() => {
        const fetchCurrentWeather = async () => {
            if (!token) return; // Don't fetch if there's no token

            try {
                setWeatherLoading(true);
                const response = await fetch('http://localhost:8000/api/weather', {
                    headers: {
                        'x-auth-token': token, // Send the token for authentication
                    },
                });
                const data = await response.json();
                setCurrentWeather(data);
            } catch (error) {
                console.error("Failed to fetch homepage weather:", error);
            } finally {
                setWeatherLoading(false);
            }
        };
        fetchCurrentWeather();
    }, [token]);
  React.useEffect(() => {
    if (transcript) {
      console.log("Farmer said:", transcript);
      handleCommand(transcript.toLowerCase());
    }
  }, [transcript]);

  const handleCommand = (command) => {
    if (command.includes("मौसम") || command.includes("weather")) {
      alert("Weather command detected! Opening weather details...");
    } else if (command.includes("मंडी") || command.includes("bhav")) {
      alert("Mandi command detected! Opening Mandi price details...");
    } else if (command.includes("फसल") || command.includes("doctor")) {
      alert("Crop Doctor command detected! Opening camera...");
    }
  };

  return (
    <> 
      {/* 3. The <Header /> component is no longer here */}
      <motion.h1 
        className="text-2xl font-bold text-gray-800 mb-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {t('greeting', { name: farmerName })}
      </motion.h1>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants}>
          <WeatherCard weatherData={currentWeather} loading={weatherLoading} />
        </motion.div>
        
        <motion.div variants={itemVariants}><MandiPriceCard /></motion.div>
        
        <motion.div variants={itemVariants}>
          <h2 className="text-base font-semibold text-gray-500 mt-8 mb-3">
            {t('services_title')} 
          </h2>
          <QuickLinks /> 
        </motion.div>
      </motion.div>
      
      {/* Voice command button remains part of the page */}
      <div className="fixed bottom-24 right-6">
        <button
          onClick={startListening}
          className={`w-16 h-16 text-white rounded-full flex items-center justify-center shadow-xl transition-all duration-300 ${
            isListening ? 'bg-red-500 animate-pulse' : 'bg-green-600 hover:bg-green-700'
          }`}
          disabled={isListening}
        >
          <Mic size={30} />
        </button>
      </div>
    </>
  );
}

export default HomePage;