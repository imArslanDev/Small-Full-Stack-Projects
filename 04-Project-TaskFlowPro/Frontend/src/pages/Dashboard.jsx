import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Dashboard() {
    const [workspaces, setWorkspaces] = useState([]);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    const token = userInfo.token;

    const fetchWorkspaces = async () => {
        try {
            const res = await axios.get('http://localhost:3000/api/workspaces', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setWorkspaces(res.data);
        } catch (err) {
            setError('Failed to load workspaces');
        }
    };

    useEffect(() => {
        fetchWorkspaces();
    }, []);

    const handleCreateWorkspace = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:3000/api/workspaces', 
                { name, description },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setName('');
            setDescription('');
            setShowModal(false);
            fetchWorkspaces();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to create workspace');
        }
    };

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Your Workspaces 🏢</h1>
                    <p className="text-gray-500 text-sm">Manage your team projects and real-time boards</p>
                </div>
                <button 
                    onClick={() => setShowModal(true)}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition shadow-sm"
                >
                    + New Workspace
                </button>
            </div>

            {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">{error}</div>}

            {workspaces.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-gray-200 shadow-sm">
                    <p className="text-gray-500 mb-4">No workspaces found. Create your first workspace to get started!</p>
                    <button 
                        onClick={() => setShowModal(true)}
                        className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition"
                    >
                        Create Workspace
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {workspaces.map(ws => (
                        <div 
                            key={ws._id} 
                            onClick={() => navigate(`/workspace/${ws._id}`)}
                            className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition cursor-pointer flex flex-col justify-between"
                        >
                            <div>
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-lg font-bold text-gray-900 truncate">{ws.name}</h3>
                                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded font-medium">
                                        {ws.members.length} members
                                    </span>
                                </div>
                                <p className="text-gray-500 text-xs line-clamp-2 mb-4">{ws.description || 'No description provided.'}</p>
                            </div>

                            <div className="pt-4 border-t border-gray-100 flex justify-between items-center text-xs text-gray-400">
                                <span>Owner: {ws.owner?.username}</span>
                                <span className="text-indigo-600 font-semibold hover:underline">Open Board →</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create Workspace Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center px-4 z-50">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Create New Workspace</h3>
                        
                        <form onSubmit={handleCreateWorkspace} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Workspace Name</label>
                                <input 
                                    type="text" 
                                    value={name} 
                                    onChange={(e) => setName(e.target.value)} 
                                    required 
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm"
                                    placeholder="e.g. Engineering Team"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                                <textarea 
                                    rows="3"
                                    value={description} 
                                    onChange={(e) => setDescription(e.target.value)} 
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm"
                                    placeholder="What is this workspace about?"
                                />
                            </div>

                            <div className="flex justify-end space-x-3 pt-2">
                                <button 
                                    type="button" 
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium transition"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    className="px-5 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition"
                                >
                                    Create
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}