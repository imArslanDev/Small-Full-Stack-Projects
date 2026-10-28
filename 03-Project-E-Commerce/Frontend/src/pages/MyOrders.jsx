import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function MyOrders() {
    const [orders, setOrders] = useState([]);
    const [error, setError] = useState('');

    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    const token = userInfo.token;

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await axios.get('http://localhost:3000/api/orders/myorders', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setOrders(res.data);
            } catch (err) {
                setError('Failed to load your orders');
            }
        };
        fetchOrders();
    }, [token]);

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-6">My Orders 📦</h1>

            {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">{error}</div>}

            {orders.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-xl border border-gray-100 shadow-sm">
                    <p className="text-gray-500 text-lg">You haven't placed any orders yet.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {orders.map(order => (
                        <div key={order._id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 mb-4 border-b border-gray-100 gap-2">
                                <div>
                                    <span className="text-xs text-gray-500 block">Order ID: {order._id}</span>
                                    <span className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleString()}</span>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <span className="px-3 py-1 bg-amber-50 text-amber-700 text-xs font-semibold rounded-full border border-amber-200">
                                        {order.status}
                                    </span>
                                    <span className="text-lg font-bold text-indigo-600">${order.totalAmount.toFixed(2)}</span>
                                </div>
                            </div>

                            {/* Order Items */}
                            <div className="space-y-3 mb-4">
                                {order.orderItems.map((item, idx) => (
                                    <div key={idx} className="flex justify-between items-center text-sm">
                                        <div className="flex items-center space-x-3">
                                            <span className="font-semibold text-gray-800">{item.product?.title || 'Product'}</span>
                                            <span className="text-gray-500 text-xs">x {item.quantity}</span>
                                        </div>
                                        <span className="font-medium text-gray-700">${(item.price * item.quantity).toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="pt-3 border-t border-gray-100 text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
                                <span className="font-semibold text-gray-700">Shipping Address: </span>
                                {order.shippingAddress.address}, {order.shippingAddress.city} | Phone: {order.shippingAddress.phone}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}