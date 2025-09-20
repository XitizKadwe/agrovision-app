import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion'; // 1. Import motion for animation
import { LayoutGrid, BookOpen, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';

function BottomNav() {
  const { t } = useTranslation();
  const location = useLocation();

  const navItems = [
    { path: '/', icon: LayoutGrid, label: t('dashboard_nav') },
    { path: '/krishi-log', icon: BookOpen, label: t('log_nav') },
    { path: '/profile', icon: User, label: t('profile_nav') },
  ];

  return (
    // 2. Main container to position the floating nav at the bottom
    <div className="fixed bottom-4 left-0 right-0 flex justify-center z-50">
      {/* 3. The floating nav bar itself with shadow and rounded corners */}
      <nav className="bg-white/70 backdrop-blur-lg shadow-lg rounded-full flex items-center gap-2 p-2">
        {navItems.map(item => {
          const isActive = location.pathname === item.path;
          return (
            // 4. Each link item is a relative container for the sliding pill
            <Link
              key={item.path}
              to={item.path}
              className={`relative flex flex-col items-center justify-center w-20 h-12 rounded-full transition-colors z-10 ${
                isActive ? 'text-white' : 'text-gray-500 hover:text-green-600'
              }`}
            >
              <item.icon size={24} />
              <span className="text-xs font-semibold">{item.label}</span>

              {/* 5. The magic sliding pill! It only renders for the active item. */}
              {/* Framer Motion animates its layout change when `isActive` changes. */}
              {isActive && (
                <motion.div
                  layoutId="active-pill"
                  className="absolute inset-0 bg-green-600 rounded-full"
                  style={{ zIndex: -1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

export default BottomNav;