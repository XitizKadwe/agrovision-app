import React from 'react';
import { Link } from 'react-router-dom';
import { Newspaper, Bot, Camera, BookText } from 'lucide-react';
import { useTranslation } from 'react-i18next'; // 1. Import the hook

function QuickLinks() {
  const { t } = useTranslation(); // 2. Use the hook

  // 3. Move the features array inside the component
  // We now use a 'titleKey' to look up the translation
  const features = [
    {
      titleKey: 'quick_links_mandi',
      path: '/mandi-details',
      Icon: Newspaper,
      color: 'text-blue-500',
    },
    {
      titleKey: 'quick_links_advisor',
      path: '/chat',
      Icon: Bot,
      color: 'text-indigo-500',
    },
    {
      titleKey: 'quick_links_doctor',
      path: '/crop-doctor',
      Icon: Camera,
      color: 'text-green-500',
    },
    {
      titleKey: 'quick_links_log',
      path: '/krishi-log',
      Icon: BookText,
      color: 'text-orange-500',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4">
      {features.map((feature, index) => (
        <Link
          key={index}
          to={feature.path}
          className="bg-white p-4 rounded-xl shadow-md border border-gray-100 flex flex-col items-center justify-center text-center hover:bg-gray-50 hover:scale-105 transition-all duration-200"
        >
          <feature.Icon size={32} className={feature.color} />
          {/* 4. Use the t() function to display the title */}
          <span className="font-semibold text-gray-700 mt-2 text-sm">{t(feature.titleKey)}</span>
        </Link>
      ))}
    </div>
  );
}

export default QuickLinks;