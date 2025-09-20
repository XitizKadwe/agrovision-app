import React from 'react';
import Logo from './Logo';
import LanguageSwitcher from '../Navigation/LanguageSwitcher';
import NotificationBell from '../layout/NotificationBell'; // The only bell import you need

function Header() {
  return (
    <header className="flex justify-between items-center p-4">
      <Logo />
      <div className="flex items-center gap-4">
        <LanguageSwitcher />
        <NotificationBell /> {/* Use our complete component directly here */}
      </div>
    </header>
  );
}

export default Header;