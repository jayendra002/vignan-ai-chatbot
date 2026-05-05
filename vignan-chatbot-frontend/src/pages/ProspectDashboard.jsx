import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Typography, Paper, TextField, Button, CircularProgress, Grid, Alert, Select, MenuItem, FormControl, InputLabel, Card, CardContent, Checkbox, FormControlLabel, Divider } from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import api from '../services/api';

const ProspectDashboard = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [isStudent, setIsStudent] = useState(false);
    const [report, setReport] = useState(null);

    const [formData, setFormData] = useState({
        tenth: '', twelfth: '', rank: '', interests: '', course: 'CSE', hostelRequired: false
    });

    useEffect(() => {
        if (localStorage.getItem('role') === 'student') setIsStudent(true);
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleAnalyze = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = {
                ...formData,
                tenth: Number(formData.tenth), twelfth: Number(formData.twelfth), rank: Number(formData.rank)
            };
            const response = await api.post('/prospect/analyze', payload);
            setReport(response.data.report);
        } catch (error) {
            console.error(error);
            alert("Failed to analyze profile.");
        } finally {
            setLoading(false);
        }
    };

    if (isStudent) return <div className="p-8"><Alert severity="info">This dashboard is for new applicants. Please use the Marks Calculator.</Alert></div>;

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-8 animate-fade-in flex flex-col md:flex-row gap-8">
            
            {/* LEFT SIDE: INPUT FORM */}
            <div className="w-full md:w-1/3">
                <Paper elevation={2} className="p-6 rounded-2xl sticky top-8">
                    <Typography variant="h5" fontWeight="bold" className="mb-6 text-vignan-dark flex items-center gap-2">
                        <SchoolIcon /> Admission Analyzer
                    </Typography>
                    
                    <form onSubmit={handleAnalyze} className="space-y-4">
                        <TextField fullWidth size="small" label="10th Percentage" name="tenth" type="number" value={formData.tenth} onChange={handleChange} required />
                        <TextField fullWidth size="small" label="12th/Diploma Percentage" name="twelfth" type="number" value={formData.twelfth} onChange={handleChange} required />
                        <TextField fullWidth size="small" label="Entrance Exam Rank" name="rank" type="number" value={formData.rank} onChange={handleChange} />
                        <TextField fullWidth size="small" label="Your Interests (e.g. Coding, Robotics)" name="interests" value={formData.interests} onChange={handleChange} />
                        
                        <FormControl fullWidth size="small">
                            <InputLabel>Target Course (For Fee Estimate)</InputLabel>
                            <Select name="course" value={formData.course} label="Target Course" onChange={handleChange}>
                                <MenuItem value="CSE">Computer Science (CSE)</MenuItem>
                                <MenuItem value="IT">Information Technology (IT)</MenuItem>
                                <MenuItem value="ECE">Electronics (ECE)</MenuItem>
                                <MenuItem value="EEE">Electrical (EEE)</MenuItem>
                                <MenuItem value="Mechanical">Mechanical</MenuItem>
                                <MenuItem value="Civil">Civil</MenuItem>
                            </Select>
                        </FormControl>

                        <FormControlLabel control={<Checkbox name="hostelRequired" checked={formData.hostelRequired} onChange={handleChange} color="primary" />} label="Include Hostel Fees" />

                        <Button type="submit" variant="contained" disabled={loading} fullWidth sx={{ backgroundColor: '#1a56db', py: 1.5, mt: 2 }}>
                            {loading ? <CircularProgress size={24} color="inherit" /> : 'Analyze My Profile'}
                        </Button>
                    </form>
                </Paper>
            </div>

            {/* RIGHT SIDE: RESULTS GRID */}
            <div className="w-full md:w-2/3 flex flex-col h-full">
                {!report ? (
                    <div className="flex-1 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-2xl p-8 bg-gray-50 h-full min-h-[400px]">
                        <Typography color="textSecondary" align="center">
                            Fill out the form and click Analyze to view your personalized admission report.
                        </Typography>
                    </div>
                ) : (
                    <Grid container spacing={3} alignItems="stretch">
                        
                        {/* 1. Eligibility Card */}
                        <Grid item xs={12} sm={6}>
                            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderTop: `4px solid ${report.eligibility.status === 'Eligible' ? '#10b981' : '#ef4444'}`, boxShadow: 2 }}>
                                <CardContent className="flex-1">
                                    <div className="flex items-center gap-2 mb-3">
                                        <CheckCircleIcon sx={{ color: report.eligibility.status === 'Eligible' ? '#10b981' : '#ef4444' }} />
                                        <Typography variant="h6" fontWeight="bold">Eligibility Status</Typography>
                                    </div>
                                    <Typography variant="h5" fontWeight="bold" className="mb-2" sx={{ color: report.eligibility.status === 'Eligible' ? '#10b981' : '#ef4444' }}>
                                        {report.eligibility.status}
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary">{report.eligibility.message}</Typography>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* 2. Fee Estimator Card */}
                        <Grid item xs={12} sm={6}>
                            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderTop: '4px solid #3b82f6', boxShadow: 2 }}>
                                <CardContent className="flex-1">
                                    <div className="flex items-center gap-2 mb-3">
                                        <AccountBalanceWalletIcon sx={{ color: '#3b82f6' }} />
                                        <Typography variant="h6" fontWeight="bold">Fee Estimate / Year</Typography>
                                    </div>
                                    <div className="space-y-2 mt-2 text-sm text-gray-700">
                                        <div className="flex justify-between"><span>Tuition ({formData.course}):</span> <b>₹{report.feeEstimate.tuition.toLocaleString()}</b></div>
                                        {report.feeEstimate.hostel > 0 && <div className="flex justify-between"><span>Hostel & Mess:</span> <b>₹{report.feeEstimate.hostel.toLocaleString()}</b></div>}
                                        {report.feeEstimate.other > 0 && <div className="flex justify-between"><span>Other Charges:</span> <b>₹{report.feeEstimate.other.toLocaleString()}</b></div>}
                                        <Divider sx={{ my: 1 }} />
                                        <div className="flex justify-between text-base text-blue-700"><span><b>Total Estimate:</b></span> <b>₹{report.feeEstimate.total.toLocaleString()}</b></div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* 3. Scholarship Suggestion (NEW) */}
                        <Grid item xs={12}>
                            <Card sx={{ backgroundColor: '#fffbeb', border: '1px solid #fde68a', boxShadow: 1 }}>
                                <CardContent>
                                    <Typography variant="subtitle1" fontWeight="bold" sx={{ color: '#d97706', mb: 1 }}>
                                        🎓 Scholarship & Financial Aid
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: '#92400e' }}>
                                        {report.scholarship}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* 4. Branch Predictor */}
                        <Grid item xs={12} sm={6}>
                            <Card sx={{ height: '100%', borderTop: '4px solid #f59e0b', boxShadow: 2 }}>
                                <CardContent>
                                    <div className="flex items-center gap-2 mb-2">
                                        <SchoolIcon sx={{ color: '#f59e0b' }} />
                                        <Typography variant="h6" fontWeight="bold">Predicted Branches</Typography>
                                    </div>
                                    {report.predictedBranches.length > 0 ? (
                                        <ul className="list-disc pl-5 text-gray-700 text-sm mt-2">
                                            {report.predictedBranches.map((branch, i) => <li key={i}>{branch}</li>)}
                                        </ul>
                                    ) : (
                                        <Typography variant="body2" color="textSecondary">Enter a rank to see predictions.</Typography>
                                    )}
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* 5. Course Recommendation */}
                        <Grid item xs={12} sm={6}>
                            <Card sx={{ height: '100%', borderTop: '4px solid #8b5cf6', backgroundColor: '#faf5ff', boxShadow: 2 }}>
                                <CardContent>
                                    <div className="flex items-center gap-2 mb-2">
                                        <LightbulbIcon sx={{ color: '#8b5cf6' }} />
                                        <Typography variant="h6" fontWeight="bold">AI Recommendation</Typography>
                                    </div>
                                    <Typography variant="body2" className="text-gray-800 mt-2 italic leading-relaxed">
                                        "{report.recommendation}"
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>

                    </Grid>
                )}
            </div>
        </div>
    );
};

export default ProspectDashboard;