import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function ShopFeed() {
    const [products, setProducts] = useState([]);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('All');
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    const token = userInfo.token;

    const fetchProducts = async () => {
        try {
            const res = await axios.get(`http://localhost:3000/api/products?search=${search}&category=${category}`);
            setProducts(res.data);
        } catch (err) {
            setError('Failed to load products');
        }
    };

    useEffect(() => {
        fetchProducts();
    }, [search, category]);

    const handleAddToCart = async (productId) => {
        try {
            await axios.post('http://localhost:3000/api/cart', 
                { productId, quantity: 1 },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setSuccessMsg('Product added to cart successfully! 🛒');
            setTimeout(() => setSuccessMsg(''), 3000);
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to add to cart');
        }
    };

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            {/* Header & Alerts */}
            <div className="mb-8">
                <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Explore ShopWave 🛍️</h1>
                <p className="text-gray-600 text-sm">Discover top-quality tech gear, lifestyle essentials, and more.</p>
            </div>

            {successMsg && (
                <div className="bg-green-50 text-green-700 p-4 rounded-lg mb-6 text-sm font-medium border border-green-200">
                    {successMsg}
                </div>
            )}

            {/* Search & Category Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8 justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                <input 
                    type="text" 
                    placeholder="Search products by title..." 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full sm:w-1/2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />

                <select 
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full sm:w-1/4 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
                >
                    <option value="All">All Categories</option>
                    <option value="Technology">Technology</option>
                    <option value="Lifestyle">Lifestyle</option>
                    <option value="Accessories">Accessories</option>
                    <option value="General">General</option>
                </select>
            </div>

            {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">{error}</div>}

            {/* Products Grid */}
            {products.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-xl border border-gray-100 shadow-sm">
                    <p className="text-gray-500 text-lg">No products found matching your search.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {products.map(product => (
                        <div key={product._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col justify-between hover:shadow-md transition">
                            <div>
                                <div className="h-48 bg-gray-100 overflow-hidden relative">
                                    <img 
                                        src={`http://localhost:3000${product.image}`} 
                                        alt={product.title} 
                                        className="w-full h-full object-cover"
                                    />
                                    <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-xs font-semibold px-2.5 py-1 rounded-full text-indigo-600 shadow-sm">
                                        {product.category}
                                    </span>
                                </div>
                                <div className="p-4">
                                    <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-1">{product.title}</h3>
                                    <p className="text-gray-600 text-xs mb-3 line-clamp-2">{product.description}</p>
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="text-xl font-bold text-indigo-600">${product.price.toFixed(2)}</span>
                                        <span className={`text-xs font-medium px-2 py-0.5 rounded ${product.stock > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                                            {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 pt-0">
                                <button 
                                    onClick={() => handleAddToCart(product._id)}
                                    disabled={product.stock === 0}
                                    className={`w-full py-2.5 rounded-lg text-sm font-semibold transition ${
                                        product.stock > 0 
                                            ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
                                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                    }`}
                                >
                                    {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}