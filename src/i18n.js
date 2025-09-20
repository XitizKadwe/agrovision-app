import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    debug: false, // Set to false for production
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, 
    },
    resources: {
      en: {
        translation: {
          // General
          greeting: 'Hello, {{name}}!',
          services_title: 'All Services', // Updated from help_title
          
          // Navigation
          dashboard_nav: 'Dashboard',
          log_nav: 'Krishi Log',
          profile_nav: 'Profile',

          // Dashboard Cards
          weather_title: 'Today\'s Weather',
          mandi_title: 'Today\'s Mandi Prices',
          maize: 'Maize',
          soyabean: 'Soyabean',
          
          // Quick Links
          quick_links_mandi: 'Detailed Prices',
          quick_links_advisor: 'Gemini Advisor',
          quick_links_doctor: 'AI Crop Doctor',
          quick_links_log: 'My Krishi Log'
        }
      },
      hi: {
        translation: {
          // General
          greeting: 'राम राम, {{name}}!',
          services_title: 'सभी सेवाएं', // Updated from help_title
          
          // Navigation
          dashboard_nav: 'डैशबोर्ड',
          log_nav: 'कृषि लॉग',
          profile_nav: 'प्रोफ़ाइल',

          // Dashboard Cards
          weather_title: 'आज का मौसम',
          mandi_title: 'आज का मंडी भाव',
          maize: 'मक्का',
          soyabean: 'सोयाबीन',
          
          // Quick Links
          quick_links_mandi: 'विस्तृत मंडी भाव',
          quick_links_advisor: 'जेमिनी सलाहकार',
          quick_links_doctor: 'AI फसल डॉक्टर',
          quick_links_log: 'मेरी कृषि लॉग'
        }
      }
    }
  });

export default i18n;