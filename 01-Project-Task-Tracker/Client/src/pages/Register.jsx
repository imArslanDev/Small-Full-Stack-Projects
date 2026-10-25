import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

export default function Register() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');

        try {
            // Backend API call for registration
            const response = await axios.post('http://localhost:3000/api/auth/register', {
                username,
                email,
                password
            });

            // Save returned user info & token in localStorage
            localStorage.setItem('userInfo', JSON.stringify(response.data));

            // Redirect to dashboard/home page
            navigate('/');
        } catch (err) {
            // Catch backend validation or duplicate email error
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '80px auto', padding: '30px', border: '1px solid #ddd', borderRadius: '8px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Create Account</h2>
            
            {error && <div style={{ background: '#ffe6e6', color: '#d9534f', padding: '10px', borderRadius: '4px', marginBottom: '15px', textAlign: 'center' }}>{error}</div>}

            <form onSubmit={handleRegister}>
                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Username</label>
                    <input 
                        type="text" 
                        value={username} 
                        onChange={(e) => setUsername(e.target.value)} 
                        required 
                        style={{ width: '100%', padding: '10px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc' }}
                    />
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Email Address</label>
                    <input 
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        required 
                        style={{ width: '100%', padding: '10px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc' }}
                    />
                </div>

                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Password</label>
                    <input 
                        type="password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        required 
                        style={{ width: '100%', padding: '10px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc' }}
                    />
                </div>

                <button type="submit" style={{ width: '100%', padding: '12px', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>
                    Register
                </button>
            </form>

            <p style={{ marginTop: '20px', textAlign: 'center' }}>
                Already have an account? <Link to="/login" style={{ color: '#007BFF', textDecoration: 'none' }}>Login here</Link>
            </p>
        </div>
    );
}