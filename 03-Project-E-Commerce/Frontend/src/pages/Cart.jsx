import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Cart() {
    const [cart, setCart] = useState(null);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    const token = userInfo.token;

    const fetchCart = async () => {
        try {
            const res = await axios.get('http://localhost:3000/api/cart', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCart(res.data);
        } catch (err) {
            setError('Failed to load cart');
        }
    };

    useEffect(() => {
        fetchCart();
    }, []);

    const handleQuantityChange = async (productId, qty) => {
        if (qty < 1) return;
        try {
            const res = await axios.post('http://localhost:3000/api/cart', 
                { productId, quantity: qty },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setCart(res.data);
        } catch (err) {
            alert('Failed to update quantity');
        }
    };

    const handleRemoveItem = async (productId) => {
        try {
            const res = await axios.delete(`http://localhost:3000/api/cart/${productId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCart(res.data);
        } catch (err) {
            alert('Failed to remove item');
        }
    };

    if (!cart) return <div className="text-center py-20 text-gray-500">Loading cart...</div>;

    const totalCartAmount = cart.items.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-6">Shopping Cart 🛒</h1>

            {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">{error}</div>}

            {cart.items.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-xl border border-gray-100 shadow-sm">
                    <p className="text-gray-500 text-lg mb-4">Your cart is empty.</p>
                    <button 
                        onClick={() => navigate('/')} 
                        className="px-6 py-2.5 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition"
                    >
                        Start Shopping
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Cart Items List */}
                    <div className="md:col-span-2 space-y-4">
                        {cart.items.map(item => (
                            <div key={item.product._id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex items-center justify-between gap-4">
                                <img 
                                    src={`http://localhost:3000${item.product.image}`} 
                                    alt={item.product.title} 
                                    className="w-20 h-20 object-cover rounded-lg border border-gray-100 shrink-0"
                                />

                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-gray-900 text-base truncate">{item.product.title}</h3>
                                    <p className="text-indigo-600 font-semibold text-sm">${item.product.price.toFixed(2)}</p>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <button 
                                        onClick={() => handleQuantityChange(item.product._id, item.quantity - 1)}
                                        className="w-8 h-8 bg-gray-100 rounded-md font-bold text-gray-700 hover:bg-gray-200 transition"
                                    >
                                        -
                                    </button>
                                    <span className="w-8 text-center font-medium text-sm">{item.quantity}</span>
                                    <button 
                                        onClick={() => handleQuantityChange(item.product._id, item.quantity + 1)}
                                        className="w-8 h-8 bg-gray-100 rounded-md font-bold text-gray-700 hover:bg-gray-200 transition"
                                    >
                                        +
                                    </button>
                                </div>

                                <button 
                                    onClick={() => handleRemoveItem(item.product._id)}
                                    className="text-red-500 hover:text-red-700 text-sm font-medium px-2 py-1 bg-red-50 rounded-md transition"
                                >
                                    Remove
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Order Summary Box */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-fit">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 pb-3 border-b border-gray-100">Order Summary</h3>
                        
                        <div className="flex justify-between items-center mb-6 text-base">
                            <span className="text-gray-600">Total Amount:</span>
                            <span className="font-extrabold text-xl text-indigo-600">${totalCartAmount.toFixed(2)}</span>
                        </div>

                        <button 
                            onClick={() => navigate('/checkout')}
                            className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition shadow-sm"
                        >
                            Proceed to Checkout
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}