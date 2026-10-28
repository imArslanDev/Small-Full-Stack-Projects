import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Checkout() {
    const [address, setAddress] = useState('');
    const [city, setCity] = useState('');
    const [phone, setPhone] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    const token = userInfo.token;

    const handlePlaceOrder = async (e) => {
        e.preventDefault();
        setError('');

        try {
            await axios.post('http://localhost:3000/api/orders', 
                {
                    shippingAddress: { address, city, phone }
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            navigate('/my-orders');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to place order');
        }
    };

    return (
        <div className="max-w-lg mx-auto mt-10 px-4">
            <div className="bg-white rounded-xl shadow-md border border-gray-100 p-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Shipping Information 🚚</h2>

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4 font-medium">
                        {error}
                    </div>
                )}

                <form onSubmit={handlePlaceOrder} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                        <input 
                            type="text" 
                            value={address} 
                            onChange={(e) => setAddress(e.target.value)} 
                            required 
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                            placeholder="House # 123, Street # 4"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                        <input 
                            type="text" 
                            value={city} 
                            onChange={(e) => setCity(e.target.value)} 
                            required 
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                            placeholder="Lahore"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                        <input 
                            type="text" 
                            value={phone} 
                            onChange={(e) => setPhone(e.target.value)} 
                            required 
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                            placeholder="+92 300 1234567"
                        />
                    </div>

                    <button 
                        type="submit" 
                        className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition mt-4"
                    >
                        Place Order (Cash on Delivery)
                    </button>
                </form>
            </div>
        </div>
    );
}