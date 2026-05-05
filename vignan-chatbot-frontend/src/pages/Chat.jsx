import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, IconButton } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import VignanLogo from '../assets/vignan-logo.png';
import Sidebar from '../components/Sidebar';
import ChatWindow from '../components/ChatWindow';

const Chat = () => {
    const navigate = useNavigate();
    
    // State to track which conversation is currently open
    const [activeChatId, setActiveChatId] = useState(null);
    
    // State to trigger the sidebar to refresh when a new chat is created
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // Mobile sidebar toggle
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) navigate('/login');
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    const handleChatCreated = (newChatId) => {
        setActiveChatId(newChatId);
        setRefreshTrigger(prev => prev + 1); // Tells Sidebar to fetch the new list
    };

    return (
        <div className="flex flex-col h-screen bg-white">
            {/* Top Navbar */}
            <AppBar position="static" elevation={0} sx={{ backgroundColor: '#1a56db', zIndex: 20 }}>
                <Toolbar className="flex justify-between">
                    <div className="flex items-center gap-3">
                        <IconButton color="inherit" onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden">
                            <MenuIcon />
                        </IconButton>
                        <img src={VignanLogo} alt="Vignan Logo" className="h-8 md:h-10 bg-white rounded-md p-1" />
                        <Typography variant="h6" fontWeight="bold">Vignan AI</Typography>
                    </div>
                    <Button color="inherit" endIcon={<LogoutIcon />} onClick={handleLogout}>Logout</Button>
                </Toolbar>
            </AppBar>

            {/* Main Layout (Sidebar + Chat Window) */}
            <div className="flex flex-1 overflow-hidden relative">
                
                {/* Desktop Sidebar */}
                <div className={`hidden md:block w-80 flex-shrink-0 h-full transition-all`}>
                    <Sidebar 
                        activeChatId={activeChatId} 
                        onSelectChat={setActiveChatId} 
                        refreshTrigger={refreshTrigger} 
                    />
                </div>

                {/* Mobile Sidebar (Absolute overlay) */}
                {mobileOpen && (
                    <div className="absolute inset-0 z-10 flex md:hidden">
                        <div className="w-4/5 max-w-sm h-full shadow-2xl">
                            <Sidebar 
                                activeChatId={activeChatId} 
                                onSelectChat={(id) => { setActiveChatId(id); setMobileOpen(false); }} 
                                refreshTrigger={refreshTrigger} 
                            />
                        </div>
                        <div className="flex-1 bg-black bg-opacity-50" onClick={() => setMobileOpen(false)}></div>
                    </div>
                )}

                {/* Chat Window Area */}
                <div className="flex-1 h-full min-w-0">
                    <ChatWindow 
                        activeChatId={activeChatId} 
                        onChatCreated={handleChatCreated} 
                    />
                </div>
            </div>
        </div>
    );
};

export default Chat;