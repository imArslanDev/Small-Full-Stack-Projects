import axios from 'axios';

const API = axios.create({
    baseURL: 'http://localhost:3000/api', // Aapka backend port 3000 hai
});

// Automatically attach JWT token to every request if user is logged in
API.interceptors.request.use((req) => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
        const token = JSON.parse(userInfo).token;
        req.headers.Authorization = `Bearer ${token}`;
    }
    return req;
});

export default API;