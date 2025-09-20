import React from 'react';
import { Leaf } from 'lucide-react';

function Logo() {
  return (
    <div className="flex items-center gap-2">
      {/* The green background is now handled by the Header */}
      <div className="p-2 bg-green-600 rounded-full">
        <Leaf className="text-white" size={20} />
      </div>
      <h1 className="text-xl font-bold text-gray-800 hidden sm:block">AgroVision</h1>
    </div>
  );
}

export default Logo;