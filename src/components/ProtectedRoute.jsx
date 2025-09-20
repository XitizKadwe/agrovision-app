import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function ProtectedRoute() {
    const { token } = useAuth();

    if (!token) {
        // If there's no token, redirect to the /login page
        return <Navigate to="/login" replace />;
    }

    // If there is a token, show the page the user wanted to access
    return <Outlet />;
}

export default ProtectedRoute;