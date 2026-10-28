import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function AdminDashboard() {
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    
    // Form state for creating product
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [category, setCategory] = useState('Technology');
    const [stock, setStock] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [successMsg, setSuccessMsg] = useState('');
    const [error, setError] = useState('');

    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    const token = userInfo.token;

    const fetchData = async () => {
        try {
            const prodRes = await axios.get('http://localhost:3000/api/products');
            setProducts(prodRes.data);

            const orderRes = await axios.get('http://localhost:3000/api/orders', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setOrders(orderRes.data);
        } catch (err) {
            setError('Failed to load admin data');
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleCreateProduct = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');

        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        formData.append('price', price);
        formData.append('category', category);
        formData.append('stock', stock);
        formData.append('image', imageFile);

        try {
            await axios.post('http://localhost:3000/api/products', formData, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            setSuccessMsg('Product added successfully! 🚀');
            setTitle('');
            setDescription('');
            setPrice('');
            setStock('');
            setImageFile(null);
            fetchData();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create product');
        }
    };

    const handleDeleteProduct = async (id) => {
        if (!window.confirm('Are you sure you want to delete this product?')) return;
        try {
            await axios.delete(`http://localhost:3000/api/products/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchData();
        } catch (err) {
            alert('Failed to delete product');
        }
    };

    return (
        <div className="max-w-6xl mx-auto px-4 py-8 space-y-12">
            <div>
                <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Admin Dashboard ⚡</h1>
                <p className="text-gray-600 text-sm">Manage products inventory and monitor customer orders.</p>
            </div>

            {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-medium">{error}</div>}
            {successMsg && <div className="bg-green-50 text-green-700 p-3 rounded-lg text-sm font-medium">{successMsg}</div>}

            {/* Create Product Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Add New Product</h2>
                <form onSubmit={handleCreateProduct} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Product Title</label>
                        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
                        <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                        <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white">
                            <option value="Technology">Technology</option>
                            <option value="Lifestyle">Lifestyle</option>
                            <option value="Accessories">Accessories</option>
                            <option value="General">General</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity</label>
                        <input type="number" value={stock} onChange={(e) => setStock(e.target.value)} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
                    </div>
                    <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Product Image</label>
                        <input type="file" onChange={(e) => setImageFile(e.target.files[0])} required className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
                    </div>
                    <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea rows="3" value={description} onChange={(e) => setDescription(e.target.value)} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
                    </div>
                    <div className="sm:col-span-2">
                        <button type="submit" className="px-6 py-2.5 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition">Publish Product</button>
                    </div>
                </form>
            </div>

            {/* Products Management Grid */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Manage Products ({products.length})</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {products.map(p => (
                        <div key={p._id} className="border border-gray-200 rounded-lg p-4 flex items-center justify-between">
                            <div className="flex items-center space-x-3 truncate">
                                <img src={`http://localhost:3000${p.image}`} alt={p.title} className="w-12 h-12 object-cover rounded-md shrink-0" />
                                <div className="truncate">
                                    <h4 className="font-semibold text-sm truncate text-gray-900">{p.title}</h4>
                                    <p className="text-xs text-indigo-600">${p.price.toFixed(2)}</p>
                                </div>
                            </div>
                            <button onClick={() => handleDeleteProduct(p._id)} className="text-red-500 hover:text-red-700 text-xs font-medium px-2 py-1 bg-red-50 rounded transition shrink-0">Delete</button>
                        </div>
                    ))}
                </div>
            </div>

            {/* All Customer Orders */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Customer Orders ({orders.length})</h2>
                <div className="space-y-4">
                    {orders.map(o => (
                        <div key={o._id} className="border border-gray-200 rounded-lg p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                            <div>
                                <span className="text-xs font-semibold text-indigo-600 block">User: {o.user?.username} ({o.user?.email})</span>
                                <span className="text-xs text-gray-500">Order ID: {o._id} | Total: <strong>${o.totalAmount.toFixed(2)}</strong></span>
                            </div>
                            <span className="px-3 py-1 bg-amber-50 text-amber-700 text-xs font-semibold rounded-full border border-amber-200">{o.status}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}