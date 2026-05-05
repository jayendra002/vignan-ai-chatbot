import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Typography, Paper, TextField, Button, CircularProgress, Card, CardContent, Tabs, Tab, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import ChatIcon from '@mui/icons-material/Chat';
import LogoutIcon from '@mui/icons-material/Logout';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import AssessmentIcon from '@mui/icons-material/Assessment';
import api from '../services/api';

// --- IMPORT YOUR LOGO & COMPONENTS ---
import VignanLogo from '../assets/vignan-logo.png';
import FAQManager from '../components/FAQManager';
import AnalyticsPanel from '../components/AnalyticsPanel';

const AdminDashboard = () => {
    const navigate = useNavigate();
    
    const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
    const [loginData, setLoginData] = useState({ username: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [dashboardData, setDashboardData] = useState(null);
    const [mainTab, setMainTab] = useState(0); // 0=Overview, 1=FAQs, 2=Analytics
    const [userTab, setUserTab] = useState(0); // 0=Students, 1=Applicants (for Overview)

    useEffect(() => {
        const role = localStorage.getItem('role');
        if (role === 'admin') {
            setIsAdminLoggedIn(true);
            fetchDashboardData();
        }
    }, []);

    const fetchDashboardData = async () => {
        try {
            const response = await api.get('/admin/data');
            setDashboardData(response.data);
        } catch (err) {
            if (err.response?.status === 401 || err.response?.status === 403) handleLogout();
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const response = await api.post('/admin/login', loginData);
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('role', response.data.role);
            setIsAdminLoggedIn(true);
            fetchDashboardData();
        } catch (err) {
            setError('Invalid Admin Credentials');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        setIsAdminLoggedIn(false);
        setDashboardData(null);
    };

    // --- VIEW 1: ADMIN LOGIN SCREEN ---
    if (!isAdminLoggedIn) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
                <Paper elevation={6} className="p-8 max-w-sm w-full rounded-xl bg-white text-center">
                    <img src={VignanLogo} alt="Vignan Logo" className="h-16 mx-auto mb-4" />
                    <Typography variant="h5" fontWeight="bold" className="text-gray-800 mb-6">
                        Admin Command Center
                    </Typography>
                    {error && <Typography color="error" className="mb-4 text-sm">{error}</Typography>}
                    <form onSubmit={handleLogin} className="flex flex-col gap-4">
                        <TextField label="Username" variant="outlined" value={loginData.username} onChange={(e) => setLoginData({...loginData, username: e.target.value})} required />
                        <TextField label="Password" type="password" variant="outlined" value={loginData.password} onChange={(e) => setLoginData({...loginData, password: e.target.value})} required />
                        <Button type="submit" variant="contained" disabled={loading} sx={{ backgroundColor: '#1a56db', py: 1.5 }}>
                            {loading ? <CircularProgress size={24} color="inherit" /> : 'Secure Login'}
                        </Button>
                    </form>
                </Paper>
            </div>
        );
    }

    if (!dashboardData) return <div className="min-h-screen flex items-center justify-center"><CircularProgress /></div>;

    // --- VIEW 2: MASTER DASHBOARD SCREEN ---
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col relative">
            
            {/* --- WATERMARK BACKGROUND --- */}
            <div 
                className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none bg-center bg-no-repeat bg-fixed"
                style={{ backgroundImage: `url(${VignanLogo})`, backgroundSize: '50%' }}
            />

            {/* --- HEADER NAVBAR --- */}
            <div className="bg-white shadow-sm border-b border-gray-200 p-4 z-10 sticky top-0">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        {/* LOGO INTEGRATION HERE */}
                        <img src={VignanLogo} alt="Vignan Logo" className="h-10 w-auto" />
                        <Typography variant="h5" fontWeight="bold" className="text-vignan-dark hidden md:block">
                            Vignan AI Command Center
                        </Typography>
                    </div>
                    <Button variant="outlined" color="error" endIcon={<LogoutIcon />} onClick={handleLogout}>
                        Exit Portal
                    </Button>
                </div>
            </div>

            {/* --- MAIN CONTENT AREA --- */}
            <div className="max-w-7xl mx-auto w-full p-4 md:p-8 z-10 flex-1">
                
                {/* Dashboard Navigation Tabs */}
                <Paper elevation={1} className="mb-6 rounded-xl overflow-hidden">
                    <Tabs 
                        value={mainTab} 
                        onChange={(e, val) => setMainTab(val)} 
                        variant="fullWidth"
                        sx={{ backgroundColor: '#ffffff', '& .Mui-selected': { color: '#1a56db', fontWeight: 'bold' } }}
                    >
                        <Tab icon={<DashboardIcon />} iconPosition="start" label="Overview & Users" />
                        <Tab icon={<LibraryBooksIcon />} iconPosition="start" label="FAQ Management" />
                        <Tab icon={<AssessmentIcon />} iconPosition="start" label="Analytics" />
                    </Tabs>
                </Paper>

                {/* --- TAB 0: OVERVIEW & USERS --- */}
                {mainTab === 0 && (
                    <div className="animate-fade-in space-y-6">
                        {/* Stat Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <Card sx={{ borderLeft: '5px solid #1a56db', boxShadow: 1, '&:hover': { boxShadow: 4, transform: 'translateY(-2px)' }, transition: 'all 0.2s' }}>
                                <CardContent className="flex items-center gap-4">
                                    <PeopleIcon sx={{ fontSize: 40, color: '#1a56db' }} />
                                    <div>
                                        <Typography color="textSecondary" variant="subtitle2">Verified Students</Typography>
                                        <Typography variant="h4" fontWeight="bold">{dashboardData.stats.totalStudents}</Typography>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card sx={{ borderLeft: '5px solid #10b981', boxShadow: 1, '&:hover': { boxShadow: 4, transform: 'translateY(-2px)' }, transition: 'all 0.2s' }}>
                                <CardContent className="flex items-center gap-4">
                                    <PeopleIcon sx={{ fontSize: 40, color: '#10b981' }} />
                                    <div>
                                        <Typography color="textSecondary" variant="subtitle2">New Applicants</Typography>
                                        <Typography variant="h4" fontWeight="bold">{dashboardData.stats.totalProspects}</Typography>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card sx={{ borderLeft: '5px solid #f59e0b', boxShadow: 1, '&:hover': { boxShadow: 4, transform: 'translateY(-2px)' }, transition: 'all 0.2s' }}>
                                <CardContent className="flex items-center gap-4">
                                    <ChatIcon sx={{ fontSize: 40, color: '#f59e0b' }} />
                                    <div>
                                        <Typography color="textSecondary" variant="subtitle2">Total AI Chats</Typography>
                                        <Typography variant="h4" fontWeight="bold">{dashboardData.stats.totalChats}</Typography>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* User Tables */}
                        <Paper elevation={2} className="rounded-xl overflow-hidden">
                            <Tabs value={userTab} onChange={(e, val) => setUserTab(val)} sx={{ borderBottom: 1, borderColor: 'divider', backgroundColor: '#f8fafc' }}>
                                <Tab label="Verified Students" sx={{ fontWeight: 'bold' }} />
                                <Tab label="New Applicants" sx={{ fontWeight: 'bold' }} />
                            </Tabs>
                            <TableContainer className="max-h-[400px]">
                                <Table stickyHeader>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f1f5f9' }}>Name</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f1f5f9' }}>Identifier</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f1f5f9' }}>Status</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f1f5f9' }}>Joined Date</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {userTab === 0 && dashboardData.users.students.map((student) => (
                                            <TableRow key={student._id} hover>
                                                <TableCell>{student.name}</TableCell>
                                                <TableCell>{student.registerNumber}</TableCell>
                                                <TableCell><Chip label="Verified Student" color="primary" size="small" /></TableCell>
                                                <TableCell>{new Date(student.createdAt).toLocaleDateString()}</TableCell>
                                            </TableRow>
                                        ))}
                                        {userTab === 1 && dashboardData.users.prospects.map((prospect) => (
                                            <TableRow key={prospect._id} hover>
                                                <TableCell>{prospect.name}</TableCell>
                                                <TableCell>{prospect.email} <br/><span className="text-xs text-gray-500">Phone: {prospect.phone}</span></TableCell>
                                                <TableCell><Chip label={prospect.interestedProgram} color="success" size="small" variant="outlined" /></TableCell>
                                                <TableCell>{new Date(prospect.createdAt).toLocaleDateString()}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Paper>
                    </div>
                )}

                {/* --- TAB 1: FAQ MANAGEMENT --- */}
                {mainTab === 1 && <FAQManager />}

                {/* --- TAB 2: ANALYTICS --- */}
                {mainTab === 2 && <AnalyticsPanel />}

            </div>
        </div>
    );
};

export default AdminDashboard;