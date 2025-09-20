import React from 'react';
import { Outlet } from 'react-router-dom';
import BottomNav from './Navigation/BottomNav';
import Header from './Dashboard/Header'; // 1. Import Header

function Layout() {
  return (
    // 2. Add main app styling here
    <div className="font-sans bg-gray-50 min-h-screen pb-24"> 
      <Header /> {/* 3. Render Header here, above the page content */}
      <main className="p-4">
        <Outlet /> {/* 4. Page content will be rendered here */}
      </main>
      {/* The BottomNav is now outside the main content area */}
      <BottomNav />
    </div>
  );
}

export default Layout;