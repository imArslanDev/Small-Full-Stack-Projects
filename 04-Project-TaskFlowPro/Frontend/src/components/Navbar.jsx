import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Navbar() {
    const navigate = useNavigate();
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || 'null');

    const handleLogout = () => {
        localStorage.removeItem('userInfo');
        window.location.href = '/login';
    };

    return (
        <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
                <Link to="/" className="text-xl font-bold text-indigo-600 tracking-wide flex items-center gap-2">
                    <span>TaskFlow Pro</span>
                    <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-semibold border border-indigo-100">Live ⚡</span>
                </Link>

                <div className="flex items-center space-x-4">
                    {userInfo ? (
                        <>
                            <div className="flex items-center space-x-3 pl-4 border-l border-gray-200">
                                <div className="text-right">
                                    <span className="block text-sm font-semibold text-gray-800">{userInfo.username}</span>
                                    <span className="text-xs text-gray-400">{userInfo.email}</span>
                                </div>
                                <button 
                                    onClick={handleLogout} 
                                    className="bg-red-50 text-red-600 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-red-100 transition"
                                >
                                    Logout
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="text-gray-600 hover:text-indigo-600 font-medium text-sm">Login</Link>
                            <Link to="/register" className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition">
                                Register
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}