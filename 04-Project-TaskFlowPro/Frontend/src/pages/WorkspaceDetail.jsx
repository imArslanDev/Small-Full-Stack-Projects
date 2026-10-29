import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { useSocket } from '../context/SocketContext';

const COLUMNS = ['To Do', 'In Progress', 'Under Review', 'Completed'];

export default function WorkspaceDetail() {
    const { id: workspaceId } = useParams();
    const socket = useSocket();

    const [workspace, setWorkspace] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    
    // Task creation form state
    const [showTaskModal, setShowTaskModal] = useState(false);
    const [taskTitle, setTaskTitle] = useState('');
    const [taskDesc, setTaskDesc] = useState('');
    const [taskPriority, setTaskPriority] = useState('Medium');
    const [taskStatus, setTaskStatus] = useState('To Do');

    // Invite member modal state
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteRole, setInviteRole] = useState('Developer');

    const chatEndRef = useRef(null);
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    const token = userInfo.token;

    // Fetch Workspace, Tasks, and Messages
    const fetchData = async () => {
        try {
            const wsRes = await axios.get(`http://localhost:3000/api/workspaces/${workspaceId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setWorkspace(wsRes.data);

            const taskRes = await axios.get(`http://localhost:3000/api/tasks/${workspaceId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTasks(taskRes.data);
        } catch (err) {
            console.error('Failed to load workspace data');
        }
    };

    useEffect(() => {
        fetchData();
    }, [workspaceId]);

    // Socket.io Room Joining & Listeners
    useEffect(() => {
        if (!socket) return;

        socket.emit('join_workspace', workspaceId);

        // Listen for real-time task movement updates
        socket.on('receive_task_update', (updatedTask) => {
            setTasks(prev => prev.map(t => t._id === updatedTask._id ? updatedTask : t));
        });

        // Listen for real-time chat messages
        socket.on('receive_message', (msg) => {
            setMessages(prev => [...prev, msg]);
        });

        return () => {
            socket.off('receive_task_update');
            socket.off('receive_message');
        };
    }, [socket, workspaceId]);

    // Scroll chat to bottom
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Handle Drag & Drop Kanban Update
    const onDragEnd = async (result) => {
        const { destination, source, draggableId } = result;

        if (!destination) return;
        if (destination.droppableId === source.droppableId && destination.index === source.index) return;

        const newStatus = destination.droppableId;
        
        // Optimistic UI update
        setTasks(prev => prev.map(t => t._id === draggableId ? { ...t, status: newStatus } : t));

        try {
            const res = await axios.patch(`http://localhost:3000/api/tasks/${draggableId}/status`, 
                { status: newStatus, order: destination.index },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // Broadcast update via socket
            socket.emit('task_updated', { workspaceId, ...res.data });
        } catch (err) {
            console.error('Failed to update task status');
            fetchData(); // Rollback on failure
        }
    };

    // Create New Task
    const handleCreateTask = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(`http://localhost:3000/api/tasks/${workspaceId}`, {
                title: taskTitle,
                description: taskDesc,
                priority: taskPriority,
                status: taskStatus
            }, { headers: { Authorization: `Bearer ${token}` } });

            setTasks(prev => [...prev, res.data]);
            socket.emit('task_updated', { workspaceId, ...res.data });

            setTaskTitle('');
            setTaskDesc('');
            setShowTaskModal(false);
        } catch (err) {
            alert('Failed to create task');
        }
    };

    // Send Chat Message
    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        socket.emit('send_message', {
            workspaceId,
            senderId: userInfo._id,
            text: newMessage
        });

        // Optimistically add message to local state
        setMessages(prev => [...prev, {
            _id: Date.now(),
            sender: { _id: userInfo._id, username: userInfo.username },
            text: newMessage,
            createdAt: new Date()
        }]);

        setNewMessage('');
    };

    // Invite Member
    const handleInvite = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(`http://localhost:3000/api/workspaces/${workspaceId}/members`, {
                email: inviteEmail,
                role: inviteRole
            }, { headers: { Authorization: `Bearer ${token}` } });

            setWorkspace(res.data);
            setInviteEmail('');
            setShowInviteModal(false);
            alert('Member added successfully! 🎉');
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to add member');
        }
    };

    if (!workspace) return <div className="text-center py-20 text-gray-500">Loading workspace...</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-2xl border border-gray-200 shadow-sm gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{workspace.name}</h1>
                    <p className="text-gray-500 text-sm">{workspace.description || 'No description'}</p>
                </div>
                <div className="flex items-center space-x-3">
                    <button 
                        onClick={() => setShowInviteModal(true)}
                        className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-200 transition"
                    >
                        + Invite Member
                    </button>
                    <button 
                        onClick={() => setShowTaskModal(true)}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition shadow-sm"
                    >
                        + Add Task
                    </button>
                </div>
            </div>

            {/* Kanban Board */}
            <DragDropContext onDragEnd={onDragEnd}>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {COLUMNS.map(col => (
                        <Droppable key={col} droppableId={col}>
                            {(provided) => (
                                <div 
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}
                                    className="bg-gray-50 rounded-2xl p-4 border border-gray-200 flex flex-col min-h-125"
                                >
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="font-bold text-gray-800 text-sm">{col}</h3>
                                        <span className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full font-semibold">
                                            {tasks.filter(t => t.status === col).length}
                                        </span>
                                    </div>

                                    <div className="space-y-3 flex-1">
                                        {tasks.filter(t => t.status === col).map((task, index) => (
                                            <Draggable key={task._id} draggableId={task._id} index={index}>
                                                {(provided) => (
                                                    <div 
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                        className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition space-y-2"
                                                    >
                                                        <div className="flex justify-between items-start">
                                                            <h4 className="font-semibold text-gray-900 text-sm">{task.title}</h4>
                                                            <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                                                                task.priority === 'High' ? 'bg-red-50 text-red-600' :
                                                                task.priority === 'Medium' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'
                                                            }`}>
                                                                {task.priority}
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-gray-500 line-clamp-2">{task.description}</p>
                                                    </div>
                                                )}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}
                                    </div>
                                </div>
                            )}
                        </Droppable>
                    ))}
                </div>
            </DragDropContext>

            {/* Real-Time Chat Section */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">Workspace Live Chat 💬</h3>
                
                <div className="h-64 overflow-y-auto space-y-3 mb-4 pr-2">
                    {messages.length === 0 ? (
                        <p className="text-center text-gray-400 text-sm py-10">No messages yet. Start the conversation!</p>
                    ) : (
                        messages.map((msg, idx) => {
                            const isMe = msg.sender?._id === userInfo._id;
                            return (
                                <div key={msg._id || idx} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                    <span className="text-[10px] text-gray-400 mb-0.5">{msg.sender?.username || 'User'}</span>
                                    <div className={`px-4 py-2 rounded-xl text-sm max-w-md ${isMe ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-800'}`}>
                                        {msg.text}
                                    </div>
                                </div>
                            );
                        })
                    )}
                    <div ref={chatEndRef} />
                </div>

                <form onSubmit={handleSendMessage} className="flex gap-2">
                    <input 
                        type="text" 
                        value={newMessage} 
                        onChange={(e) => setNewMessage(e.target.value)} 
                        placeholder="Type a message to your team..." 
                        className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm"
                    />
                    <button 
                        type="submit" 
                        className="px-6 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition text-sm"
                    >
                        Send
                    </button>
                </form>
            </div>

            {/* Add Task Modal */}
            {showTaskModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center px-4 z-50">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Create New Task</h3>
                        <form onSubmit={handleCreateTask} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Task Title</label>
                                <input type="text" value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} required className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea rows="2" value={taskDesc} onChange={(e) => setTaskDesc(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                                    <select value={taskPriority} onChange={(e) => setTaskPriority(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white">
                                        <option value="Low">Low</option>
                                        <option value="Medium">Medium</option>
                                        <option value="High">High</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Column</label>
                                    <select value={taskStatus} onChange={(e) => setTaskStatus(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white">
                                        {COLUMNS.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="flex justify-end space-x-3 pt-2">
                                <button type="button" onClick={() => setShowTaskModal(false)} className="px-4 py-2 text-gray-600 text-sm font-medium">Cancel</button>
                                <button type="submit" className="px-5 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold">Create Task</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Invite Member Modal */}
            {showInviteModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center px-4 z-50">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Invite Team Member</h3>
                        <form onSubmit={handleInvite} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Member Email</label>
                                <input type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} required className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm" placeholder="colleague@example.com" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                                <select value={inviteRole} onChange={(e) => setInviteRole(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white">
                                    <option value="Admin">Admin</option>
                                    <option value="Project Manager">Project Manager</option>
                                    <option value="Developer">Developer</option>
                                </select>
                            </div>
                            <div className="flex justify-end space-x-3 pt-2">
                                <button type="button" onClick={() => setShowInviteModal(false)} className="px-4 py-2 text-gray-600 text-sm font-medium">Cancel</button>
                                <button type="submit" className="px-5 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold">Send Invite</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}