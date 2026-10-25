import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Dashboard() {
    const [tasks, setTasks] = useState([]);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [error, setError] = useState('');
    
    const navigate = useNavigate();
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    const token = userInfo.token;

    // Fetch Tasks on Component Mount
    const fetchTasks = async () => {
        try {
            const response = await axios.get('http://localhost:3000/api/tasks', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTasks(response.data);
        } catch (err) {
            setError('Failed to fetch tasks');
            if (err.response?.status === 401) {
                handleLogout();
            }
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    // Add Task Handler
    const handleAddTask = async (e) => {
        e.preventDefault();
        if (!title.trim()) return;

        try {
            const response = await axios.post('http://localhost:3000/api/tasks', 
                { title, description },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setTasks([response.data, ...tasks]);
            setTitle('');
            setDescription('');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create task');
        }
    };

    // Delete Task Handler
    const handleDeleteTask = async (id) => {
        try {
            await axios.delete(`http://localhost:3000/api/tasks/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTasks(tasks.filter(task => task._id !== id));
        } catch (err) {
            setError('Failed to delete task');
        }
    };

    // Toggle Complete Handler
    const handleToggleComplete = async (task) => {
        try {
            const response = await axios.put(`http://localhost:3000/api/tasks/${task._id}`, 
                { completed: !task.completed },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setTasks(tasks.map(t => t._id === task._id ? response.data : t));
        } catch (err) {
            setError('Failed to update task');
        }
    };

    // Logout Handler
    const handleLogout = () => {
        localStorage.removeItem('userInfo');
        navigate('/login');
    };

    return (
        <div style={{ maxWidth: '700px', margin: '40px auto', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #ddd', paddingBottom: '15px', marginBottom: '20px' }}>
                <h2>Welcome, {userInfo.username || 'User'}! 👋</h2>
                <button onClick={handleLogout} style={{ padding: '8px 15px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                    Logout
                </button>
            </div>

            {error && <div style={{ background: '#ffe6e6', color: '#d9534f', padding: '10px', borderRadius: '4px', marginBottom: '15px' }}>{error}</div>}

            {/* Create Task Form */}
            <form onSubmit={handleAddTask} style={{ background: '#f9f9f9', padding: '20px', borderRadius: '8px', marginBottom: '30px', border: '1px solid #eee' }}>
                <h3>Add New Task</h3>
                <div style={{ marginBottom: '10px', marginTop: '10px' }}>
                    <input 
                        type="text" 
                        placeholder="Task Title..." 
                        value={title} 
                        onChange={(e) => setTitle(e.target.value)} 
                        required
                        style={{ width: '100%', padding: '10px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc' }}
                    />
                </div>
                <div style={{ marginBottom: '15px' }}>
                    <textarea 
                        placeholder="Task Description (Optional)..." 
                        value={description} 
                        onChange={(e) => setDescription(e.target.value)} 
                        style={{ width: '100%', padding: '10px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc', resize: 'vertical' }}
                    />
                </div>
                <button type="submit" style={{ padding: '10px 20px', background: '#007BFF', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                    Add Task
                </button>
            </form>

            {/* Task List */}
            <h3>Your Tasks</h3>
            {tasks.length === 0 ? (
                <p style={{ color: '#666' }}>No tasks found. Create one above!</p>
            ) : (
                <ul style={{ listStyle: 'none', padding: 0 }}>
                    {tasks.map(task => (
                        <li key={task._id} style={{ background: '#fff', border: '1px solid #ddd', padding: '15px', borderRadius: '6px', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <h4 style={{ margin: '0 0 5px 0', textDecoration: task.completed ? 'line-through' : 'none', color: task.completed ? '#888' : '#000' }}>
                                    {task.title}
                                </h4>
                                {task.description && <p style={{ margin: '0 0 10px 0', color: '#555', fontSize: '14px' }}>{task.description}</p>}
                                <button onClick={() => handleToggleComplete(task)} style={{ padding: '4px 8px', fontSize: '12px', background: task.completed ? '#ffc107' : '#28a745', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }}>
                                    {task.completed ? 'Mark Incomplete' : 'Mark Complete'}
                                </button>
                            </div>
                            <button onClick={() => handleDeleteTask(task._id)} style={{ padding: '6px 10px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>
                                Delete
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}