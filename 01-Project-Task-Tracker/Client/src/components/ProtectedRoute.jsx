import React from 'react';
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children }) {
    const userInfo = localStorage.getItem('userInfo');
    
    // If user is not logged in, redirect to login page
    if (!userInfo) {
        return <Navigate to="/login" replace />;
    }

    return children;
}