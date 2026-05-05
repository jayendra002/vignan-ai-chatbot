import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Typography, Paper, Avatar, CircularProgress, AppBar, Toolbar, Button } from '@mui/material';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';
import VignanLogo from '../assets/vignan-logo.png';
import api from '../services/api';

const SharedChat = () => {
    const { shareId } = useParams(); // Grabs the ID from the URL
    const navigate = useNavigate();
    
    const [chatData, setChatData] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchSharedChat = async () => {
            try {
                // Notice we do NOT need a token for this API call!
                const response = await api.get(`/chat/share/${shareId}`);
                setChatData(response.data);
            } catch (err) {
                setError('This shared link is invalid or has expired.');
            }
        };
        fetchSharedChat();
    }, [shareId]);

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
                <Paper className="p-8 text-center rounded-xl">
                    <Typography variant="h5" color="error" className="mb-4">{error}</Typography>
                    <Button variant="contained" onClick={() => navigate('/login')}>Go to Vignan AI</Button>
                </Paper>
            </div>
        );
    }

    if (!chatData) return <div className="min-h-screen flex items-center justify-center"><CircularProgress /></div>;

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            {/* Read-Only Navbar */}
            <AppBar position="static" elevation={1} sx={{ backgroundColor: '#1a56db' }}>
                <Toolbar className="max-w-4xl mx-auto w-full flex justify-between">
                    <div className="flex items-center gap-3">
                        <img src={VignanLogo} alt="Vignan" className="h-8 bg-white rounded p-1" />
                        <Typography variant="h6" fontWeight="bold">Shared Conversation</Typography>
                    </div>
                    <Button color="inherit" onClick={() => navigate('/login')}>Try Vignan AI</Button>
                </Toolbar>
            </AppBar>

            {/* Read-Only Chat History */}
            <div className="flex-1 overflow-y-auto p-4 md:p-8 max-w-4xl mx-auto w-full">
                <Typography variant="h4" fontWeight="bold" className="mb-8 text-center text-gray-800">
                    "{chatData.title}"
                </Typography>
                
                <div className="space-y-6">
                    {chatData.messages.map((msg, index) => (
                        <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`flex max-w-[85%] md:max-w-[70%] gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                <Avatar sx={{ bgcolor: msg.sender === 'user' ? '#1e3a8a' : '#ffffff', border: msg.sender === 'bot' ? '1px solid #e2e8f0' : 'none' }}>
                                    {msg.sender === 'user' ? <PersonIcon /> : <SmartToyIcon color="primary" />}
                                </Avatar>
                                <Paper elevation={1} className={`px-5 py-3 rounded-2xl ${msg.sender === 'user' ? 'bg-[#1a56db] text-white rounded-tr-sm' : 'bg-white text-gray-800 rounded-tl-sm border border-gray-100'}`}>
                                    <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{msg.text}</Typography>
                                </Paper>
                            </div>
                        </div>
                    ))}
                </div>
                
                <div className="mt-12 text-center text-gray-400 text-sm">
                    End of shared conversation.
                </div>
            </div>
        </div>
    );
};

export default SharedChat;