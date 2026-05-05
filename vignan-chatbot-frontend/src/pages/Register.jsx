import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TextField, Button, Typography, Paper, CircularProgress, Alert, ToggleButton, ToggleButtonGroup } from '@mui/material';
import api from '../services/api';

const Register = () => {
    const navigate = useNavigate();
    const [userType, setUserType] = useState('student');
    const [formData, setFormData] = useState({ name: '', identifier: '', password: '', program: '', phone: '', otp: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    // OTP States
    const [otpSent, setOtpSent] = useState(false);
    const [phoneVerified, setPhoneVerified] = useState(false);

    const handleTypeChange = (e, newType) => { if (newType) { setUserType(newType); setError(''); } };
    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    // --- OTP FUNCTIONS ---
    const handleSendOtp = async () => {
        if (!formData.phone || formData.phone.length < 10) return setError("Enter a valid 10-digit phone number.");
        try {
            setLoading(true);
            await api.post('/auth/send-otp', { phone: formData.phone });
            setOtpSent(true);
            setError('');
            alert("For this demo, check your VS Code Backend Terminal for the 6-digit OTP!");
        } catch (err) { setError("Failed to send OTP."); } finally { setLoading(false); }
    };

    const handleVerifyOtp = async () => {
        try {
            setLoading(true);
            await api.post('/auth/verify-otp', { phone: formData.phone, otp: formData.otp });
            setPhoneVerified(true);
            setError('');
        } catch (err) { setError("Invalid OTP. Try again."); } finally { setLoading(false); }
    };

    // --- REGISTRATION FUNCTION ---
    const handleRegister = async (e) => {
        e.preventDefault();
        if (userType === 'prospect' && !phoneVerified) return setError("Please verify your phone number first.");
        
        setLoading(true);
        try {
            const endpoint = userType === 'student' ? '/auth/register-student' : '/auth/register-prospect';
            const payload = userType === 'student' 
                ? { registerNumber: formData.identifier, name: formData.name, password: formData.password }
                : { email: formData.identifier, name: formData.name, password: formData.password, interestedProgram: formData.program, phone: formData.phone };

            const response = await api.post(endpoint, payload);
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('role', response.data.role);
            navigate('/chat');
        } catch (err) { setError(err.response?.data?.message || 'Registration failed.'); } finally { setLoading(false); }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-vignan-light p-4">
            <Paper elevation={4} className="p-8 max-w-md w-full rounded-2xl">
                <div className="text-center mb-6">
                    <Typography variant="h4" fontWeight="bold" className="text-vignan-dark mb-2">Join Vignan AI</Typography>
                </div>

                {error && <Alert severity="error" className="mb-4">{error}</Alert>}
                {phoneVerified && <Alert severity="success" className="mb-4">Phone verified successfully!</Alert>}

                <form onSubmit={handleRegister} className="flex flex-col gap-4">
                    <ToggleButtonGroup color="primary" value={userType} exclusive onChange={handleTypeChange} fullWidth>
                        <ToggleButton value="student">Existing Student</ToggleButton>
                        <ToggleButton value="prospect">New Applicant</ToggleButton>
                    </ToggleButtonGroup>

                    <TextField label="Full Name" name="name" onChange={handleChange} fullWidth required />
                    
                    <TextField 
                        label={userType === 'student' ? "Register Number" : "Email Address"} 
                        name="identifier" onChange={handleChange} fullWidth required 
                    />

                    {/* NEW APPLICANT ONLY FIELDS */}
                    {userType === 'prospect' && (
                        <>
                            <TextField label="Interested Program" name="program" onChange={handleChange} fullWidth required />
                            <div className="flex gap-2">
                                <TextField label="Phone Number" name="phone" onChange={handleChange} fullWidth required disabled={phoneVerified} />
                                {!phoneVerified && (
                                    <Button variant="outlined" onClick={handleSendOtp} disabled={loading || otpSent}>
                                        {otpSent ? "Sent" : "Send OTP"}
                                    </Button>
                                )}
                            </div>
                            
                            {/* SHOW OTP INPUT IF SENT BUT NOT VERIFIED */}
                            {otpSent && !phoneVerified && (
                                <div className="flex gap-2">
                                    <TextField label="Enter 6-digit OTP" name="otp" onChange={handleChange} fullWidth />
                                    <Button variant="contained" color="success" onClick={handleVerifyOtp} disabled={loading}>
                                        Verify
                                    </Button>
                                </div>
                            )}
                        </>
                    )}

                    <TextField label="Password" type="password" name="password" onChange={handleChange} fullWidth required />
                    <Button type="submit" variant="contained" disabled={loading} sx={{ backgroundColor: '#1a56db' }} className="mt-2 py-3">
                        {loading ? <CircularProgress size={24} color="inherit" /> : 'Create Account'}
                    </Button>
                </form>
            </Paper>
        </div>
    );
};

export default Register;