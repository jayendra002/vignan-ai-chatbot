import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TextField, Button, Typography, Paper, CircularProgress, Alert } from '@mui/material';
import api from '../services/api';

const Login = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ identifier: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

   const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await api.post('/auth/login', {
                identifier: formData.identifier, // <--- CHANGED THIS LINE!
                password: formData.password
            });

            localStorage.setItem('token', response.data.token);
            localStorage.setItem('role', response.data.role);
            navigate('/chat');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        // Tailwind used here for a perfect centered, responsive layout with the Vignan light blue background
        <div className="min-h-screen flex items-center justify-center bg-vignan-light p-4">
            
            <Paper elevation={4} className="p-8 max-w-md w-full rounded-2xl">
                <div className="text-center mb-6">
                    {/* Add your college logo here later */}
                    <Typography variant="h4" fontWeight="bold" className="text-vignan-dark mb-2">
                        Vignan AI
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                        Sign in to access your campus assistant
                    </Typography>
                </div>

                {error && <Alert severity="error" className="mb-4">{error}</Alert>}

                <form onSubmit={handleLogin} className="flex flex-col gap-4">
                    <TextField
                        label="Register Number / Email"
                        variant="outlined"
                        name="identifier"
                        value={formData.identifier}
                        onChange={handleChange}
                        fullWidth
                        required
                    />
                    
                    <TextField
                        label="Password"
                        type="password"
                        variant="outlined"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        fullWidth
                        required
                    />

                    <Button 
                        type="submit" 
                        variant="contained" 
                        size="large"
                        disabled={loading}
                        sx={{ backgroundColor: '#1a56db', '&:hover': { backgroundColor: '#1e3a8a' } }}
                        className="mt-2 py-3"
                    >
                        {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
                    </Button>
                </form>

                <div className="mt-6 text-center">
                    <Typography variant="body2" color="textSecondary">
                        Don't have an account?{' '}
                        <span 
                            className="text-vignan-main font-semibold cursor-pointer hover:underline"
                            onClick={() => navigate('/register')}
                        >
                            Register here
                        </span>
                    </Typography>
                </div>
            </Paper>
        </div>
    );
};

export default Login;