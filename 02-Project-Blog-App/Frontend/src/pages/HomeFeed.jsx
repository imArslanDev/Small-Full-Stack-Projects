import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

export default function HomeFeed() {
    const [posts, setPosts] = useState([]);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('All');
    const [error, setError] = useState('');

    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    const token = userInfo.token;

    const fetchPosts = async () => {
        try {
            const res = await axios.get(`http://localhost:3000/api/posts?search=${search}&category=${category}`);
            setPosts(res.data);
        } catch (err) {
            setError('Failed to load posts');
        }
    };

    useEffect(() => {
        fetchPosts();
    }, [search, category]);

    const handleDelete = async (postId) => {
        if (!window.confirm('Are you sure you want to delete this post?')) return;

        try {
            await axios.delete(`http://localhost:3000/api/posts/${postId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPosts(posts.filter(p => p._id !== postId));
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to delete post');
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            {/* Search & Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8 justify-between items-center">
                <input 
                    type="text" 
                    placeholder="Search posts by title..." 
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
                    <option value="Web Development">Web Development</option>
                    <option value="Lifestyle">Lifestyle</option>
                    <option value="General">General</option>
                </select>
            </div>

            {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">{error}</div>}

            {/* Posts List */}
            {posts.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-gray-100 shadow-sm">
                    <p className="text-gray-500 text-lg">No posts found.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {posts.map(post => (
                        <div key={post._id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 transition hover:shadow-md">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <span className="text-xs font-semibold px-2.5 py-1 bg-indigo-50 text-indigo-600 rounded-full">
                                        {post.category}
                                    </span>
                                    <h3 className="text-xl font-bold text-gray-900 mt-2">{post.title}</h3>
                                </div>

                                {/* Author Ownership Check: Show delete only if logged-in user is the author */}
                                {post.author?._id === userInfo._id && (
                                    <button 
                                        onClick={() => handleDelete(post._id)}
                                        className="text-red-500 hover:text-red-700 text-sm font-medium px-3 py-1 bg-red-50 rounded-md transition"
                                    >
                                        Delete
                                    </button>
                                )}
                            </div>

                            <p className="text-gray-700 whitespace-pre-line mb-4 text-sm leading-relaxed">
                                {post.content}
                            </p>

                            <div className="flex justify-between items-center pt-4 border-t border-gray-100 text-xs text-gray-500">
                                <span>Author: <strong className="text-gray-700">{post.author?.username || 'Unknown'}</strong></span>
                                <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}