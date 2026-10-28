import React from 'react';
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children }) {
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || 'null');
    
    if (!userInfo) {
        return <Navigate to="/login" replace />;
    }

    return children;
}