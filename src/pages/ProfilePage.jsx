import React from 'react';
import { useAuth } from '../context/AuthContext';
import { User, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';

function ProfilePage() {
    const { user, logout } = useAuth();

    if (!user) {
        return <div>Loading...</div>;
    }

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-6">मेरी प्रोफाइल</h1>
            <div className="bg-white p-6 rounded-xl shadow-md border text-center">
                <div className="w-24 h-24 bg-gray-100 rounded-full mx-auto flex items-center justify-center mb-4">
                    <User size={48} className="text-gray-500" />
                </div>
                <h2 className="text-xl font-bold">{user.name}</h2>
                <p className="text-gray-500">{user.phone}</p>
                <p className="text-gray-500 capitalize">{user.district}</p>
            </div>
            
            <button 
                onClick={logout} 
                className="w-full mt-8 p-3 bg-red-500 text-white font-bold rounded-lg flex items-center justify-center gap-2 hover:bg-red-600"
            >
                <LogOut size={20} />
                लॉग आउट
            </button>
        </div>
    );
}

export default ProfilePage;