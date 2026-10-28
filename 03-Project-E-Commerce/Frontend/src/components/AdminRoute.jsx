import React from 'react';
import { Navigate } from 'react-router-dom';

export default function AdminRoute({ children }) {
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || 'null');
    
    if (!userInfo || userInfo.role !== 'admin') {
        return <Navigate to="/" replace />;
    }

    return children;
}