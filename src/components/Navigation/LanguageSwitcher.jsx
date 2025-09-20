import React from 'react';
import { useTranslation } from 'react-i18next';

function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="flex gap-2">
      <button 
        onClick={() => changeLanguage('en')} 
        className={`px-3 py-1 text-sm rounded-full ${i18n.language === 'en' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}
      >
        English
      </button>
      <button 
        onClick={() => changeLanguage('hi')} 
        className={`px-3 py-1 text-sm rounded-full ${i18n.language === 'hi' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}
      >
        हिन्दी
      </button>
    </div>
  );
}

export default LanguageSwitcher;