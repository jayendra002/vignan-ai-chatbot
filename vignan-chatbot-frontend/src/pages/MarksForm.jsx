import React, { useState, useEffect } from 'react';
import { Typography, Paper, TextField, Button, CircularProgress, Alert, Grid, Divider, Switch, FormControlLabel, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import CalculateIcon from '@mui/icons-material/Calculate';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import api from '../services/api';

const MarksForm = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(null);
    const [isProspect, setIsProspect] = useState(false);

    // Module Toggles
    const [enableM1, setEnableM1] = useState(true);
    const [enableM2, setEnableM2] = useState(false);

    // Prediction States
    const [targetCGPA, setTargetCGPA] = useState(80); // Defaults to 8 CGPA (80 marks)
    const [predictionResult, setPredictionResult] = useState(null);

    const initialModule = { preT1: '', T1: '', T2: '', T3: '', T4: '', t5_1: '', t5_2: '', t5_3: '', t5_4: '' };
    
    const [formData, setFormData] = useState({
        regNo: '',
        module1: { ...initialModule },
        module2: { ...initialModule }
    });

    useEffect(() => {
        if (localStorage.getItem('role') !== 'student') setIsProspect(true);
    }, []);

    const handleChange = (e, moduleName) => {
        const { name, value } = e.target;
        if (moduleName) {
            setFormData(prev => ({ ...prev, [moduleName]: { ...prev[moduleName], [name]: value } }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handlePredict = () => {
        if (!success || !success.finalInternal) return;
        const required = parseFloat((targetCGPA - success.finalInternal).toFixed(2));
        
        if (required > 40) setPredictionResult('Target not achievable with current internal marks.');
        else if (required <= 0) setPredictionResult('You have already secured this grade!');
        else setPredictionResult(`To achieve this CGPA, you need at least ${required} marks in the semester exam.`);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true); setError(''); setSuccess(null); setPredictionResult(null);

        if (!enableM1 && !enableM2) {
            setError('Please enable and fill out at least one module.');
            setLoading(false);
            return;
        }

        try {
            const payload = { regNo: formData.regNo };
            
            // Only format and send enabled modules
            if (enableM1) {
                payload.module1 = {
                    preT1: Number(formData.module1.preT1), T1: Number(formData.module1.T1),
                    T2: Number(formData.module1.T2), T3: Number(formData.module1.T3), T4: Number(formData.module1.T4),
                    T5: [Number(formData.module1.t5_1), Number(formData.module1.t5_2), Number(formData.module1.t5_3), Number(formData.module1.t5_4)]
                };
            }
            if (enableM2) {
                payload.module2 = {
                    preT1: Number(formData.module2.preT1), T1: Number(formData.module2.T1),
                    T2: Number(formData.module2.T2), T3: Number(formData.module2.T3), T4: Number(formData.module2.T4),
                    T5: [Number(formData.module2.t5_1), Number(formData.module2.t5_2), Number(formData.module2.t5_3), Number(formData.module2.t5_4)]
                };
            }

            const response = await api.post('/student/marks', payload);
            setSuccess(response.data.results);
        } catch (err) {
            setError(err.response?.data?.message || 'Calculation failed. Check your inputs.');
        } finally {
            setLoading(false);
        }
    };

    if (isProspect) return <div className="p-8 flex justify-center"><Alert severity="warning">Access Denied: Enrolled students only.</Alert></div>;

    const renderModuleInputs = (moduleName, title, isEnabled, setEnabled) => (
        <div className={`p-4 rounded-xl border transition-all ${isEnabled ? 'bg-blue-50/50 border-blue-200' : 'bg-gray-50 opacity-60 border-gray-200'}`}>
            <div className="flex justify-between items-center mb-4">
                <Typography variant="h6" className="text-vignan-dark font-bold">{title}</Typography>
                <FormControlLabel control={<Switch checked={isEnabled} onChange={(e) => setEnabled(e.target.checked)} color="primary" />} label={isEnabled ? "Enabled" : "Disabled"} />
            </div>
            {isEnabled && (
                <>
                    <Grid container spacing={2}>
                        <Grid item xs={6} md={4}><TextField size="small" fullWidth label="Pre-T1 (Max 10)" name="preT1" type="number" onChange={(e) => handleChange(e, moduleName)} required /></Grid>
                        <Grid item xs={6} md={4}><TextField size="small" fullWidth label="T1 (Max 20)" name="T1" type="number" onChange={(e) => handleChange(e, moduleName)} required /></Grid>
                        <Grid item xs={6} md={4}><TextField size="small" fullWidth label="T2 (Max 5)" name="T2" type="number" onChange={(e) => handleChange(e, moduleName)} required /></Grid>
                        <Grid item xs={6} md={4}><TextField size="small" fullWidth label="T3 (Max 5)" name="T3" type="number" onChange={(e) => handleChange(e, moduleName)} required /></Grid>
                        <Grid item xs={6} md={4}><TextField size="small" fullWidth label="T4 (Max 20)" name="T4" type="number" onChange={(e) => handleChange(e, moduleName)} required /></Grid>
                    </Grid>
                    <Typography variant="subtitle2" className="mt-4 mb-2 text-gray-600">T5 Tests (4 required, Max 20 each)</Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={3}><TextField size="small" fullWidth label="Test 1" name="t5_1" type="number" onChange={(e) => handleChange(e, moduleName)} required /></Grid>
                        <Grid item xs={3}><TextField size="small" fullWidth label="Test 2" name="t5_2" type="number" onChange={(e) => handleChange(e, moduleName)} required /></Grid>
                        <Grid item xs={3}><TextField size="small" fullWidth label="Test 3" name="t5_3" type="number" onChange={(e) => handleChange(e, moduleName)} required /></Grid>
                        <Grid item xs={3}><TextField size="small" fullWidth label="Test 4" name="t5_4" type="number" onChange={(e) => handleChange(e, moduleName)} required /></Grid>
                    </Grid>
                </>
            )}
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8 animate-fade-in space-y-6">
            <Paper elevation={2} className="p-6 md:p-8 rounded-2xl">
                <div className="flex items-center gap-3 mb-6">
                    <CalculateIcon sx={{ fontSize: 32, color: '#1a56db' }} />
                    <Typography variant="h5" fontWeight="bold">Internal Marks Calculator</Typography>
                </div>
                
                {error && <Alert severity="error" className="mb-6">{error}</Alert>}
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    <TextField fullWidth label="Registration Number" name="regNo" onChange={(e) => handleChange(e, null)} required />
                    
                    {renderModuleInputs('module1', 'Module 1 Input', enableM1, setEnableM1)}
                    {renderModuleInputs('module2', 'Module 2 Input', enableM2, setEnableM2)}

                    <Button type="submit" variant="contained" disabled={loading} size="large" fullWidth sx={{ backgroundColor: '#1a56db', py: 1.5 }}>
                        {loading ? <CircularProgress size={24} color="inherit" /> : 'Calculate & Save'}
                    </Button>
                </form>
            </Paper>

            {/* --- PREDICTION SECTION (Only shows after successful calculation) --- */}
            {success && (
                <Paper elevation={3} className="p-6 md:p-8 rounded-2xl bg-gradient-to-br from-white to-blue-50 border border-blue-100">
                    <div className="flex items-center gap-3 mb-4">
                        <TrendingUpIcon sx={{ fontSize: 28, color: '#10b981' }} />
                        <Typography variant="h5" fontWeight="bold" className="text-gray-800">Academic Predictor</Typography>
                    </div>
                    
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 mb-6">
                        <Typography variant="subtitle2" color="textSecondary">Current Standing:</Typography>
                        {success.module1Internal && <Typography>Module 1: <b>{success.module1Internal}</b></Typography>}
                        {success.module2Internal && <Typography>Module 2: <b>{success.module2Internal}</b></Typography>}
                        <Typography variant="h6" className="text-vignan-main mt-2">Final Internal Average: {success.finalInternal} / 60</Typography>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 items-center">
                        <FormControl fullWidth size="small">
                            <InputLabel>Target CGPA</InputLabel>
                            <Select value={targetCGPA} label="Target CGPA" onChange={(e) => { setTargetCGPA(e.target.value); setPredictionResult(null); }}>
                                <MenuItem value={70}>7 CGPA</MenuItem>
                                <MenuItem value={80}>8 CGPA</MenuItem>
                                <MenuItem value={85}>8.5+ CGPA</MenuItem>
                            </Select>
                        </FormControl>
                        <Button variant="contained" onClick={handlePredict} sx={{ backgroundColor: '#10b981', '&:hover': { backgroundColor: '#059669' }, whiteSpace: 'nowrap', px: 4, py: 1 }}>
                            Predict
                        </Button>
                    </div>

                    {predictionResult && (
                        <Alert severity={predictionResult.includes('achievable') ? 'error' : 'success'} className="mt-4 font-medium text-base">
                            {predictionResult}
                        </Alert>
                    )}
                </Paper>
            )}
        </div>
    );
};

export default MarksForm;