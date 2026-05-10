import axios from 'axios';

const api = axios.create({
    baseURL: 'https://vignan-backend.onrender.com/api', // Point this to your backend
});

// Automatically attach the JWT token to every request if it exists
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;