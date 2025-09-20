import React from 'react';
import { Camera, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom'; // Import Link

function ActionButtons() {
  return (
    <div className="grid grid-cols-2 gap-4">
      <button className="flex flex-col items-center justify-center p-4 bg-green-500 text-white rounded-xl shadow-lg hover:bg-green-600 transition-all active:scale-95">
        <Camera size={32} className="mb-2" />
        <span className="font-bold text-center">फसल की जांच</span>
      </button>
      
      {/* This is now a Link component */}
      <Link to="/chat" className="flex flex-col items-center justify-center p-4 bg-white text-gray-700 border border-gray-200 rounded-xl shadow-md hover:bg-gray-50 transition-all active:scale-95">
        <MessageSquare size={32} className="mb-2 text-green-600" />
        <span className="font-bold text-center">जेमिनी सलाहकार</span>
      </Link>
    </div>
  );
}
export default ActionButtons;