import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, TextField, List, ListItemButton, ListItemText, Typography, InputAdornment, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import CalculateIcon from '@mui/icons-material/Calculate';
import SchoolIcon from '@mui/icons-material/School'; // <-- Import for Prospect Button
import api from '../services/api';

const Sidebar = ({ activeChatId, onSelectChat, refreshTrigger }) => {
    const navigate = useNavigate();
    const [conversations, setConversations] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const userRole = localStorage.getItem('role'); // Get role from local storage

    useEffect(() => {
        const fetchChats = async () => {
            try {
                // If there is a search query, hit the search API, otherwise fetch all
                const endpoint = searchQuery.trim() 
                    ? `/chat/search?q=${searchQuery}` 
                    : `/chat/conversations`;
                
                const response = await api.get(endpoint);
                setConversations(response.data);
            } catch (error) {
                console.error("Failed to load history", error);
            }
        };
        fetchChats();
    }, [searchQuery, refreshTrigger]); // Re-fetch when search changes or when a new chat is created

    return (
        <div className="w-full md:w-80 h-full bg-gray-900 text-white flex flex-col p-4 border-r border-gray-800">
            {/* New Chat Button */}
            <Button 
                variant="outlined" 
                fullWidth 
                startIcon={<AddIcon />} 
                onClick={() => onSelectChat(null)} 
                sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)', mb: 2, justifyContent: 'flex-start', py: 1.5 }}
            >
                New Chat
            </Button>

            {/* Dynamic Feature Button based on Role */}
            {userRole === 'student' ? (
                <Button 
                    variant="contained" 
                    fullWidth 
                    startIcon={<CalculateIcon />} 
                    onClick={() => navigate('/marks')} 
                    sx={{ backgroundColor: '#1a56db', '&:hover': { backgroundColor: '#1e3a8a' }, mb: 3, justifyContent: 'flex-start', py: 1 }}
                >
                    Calculate Marks
                </Button>
            ) : (
                <Button 
                    variant="contained" 
                    fullWidth 
                    startIcon={<SchoolIcon />} 
                    onClick={() => navigate('/admissions')} 
                    sx={{ backgroundColor: '#10b981', '&:hover': { backgroundColor: '#059669' }, mb: 3, justifyContent: 'flex-start', py: 1 }}
                >
                    Applicant Portal
                </Button>
            )}

            {/* Search Bar */}
            <TextField
                variant="outlined"
                placeholder="Search chats..."
                size="small"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{ 
                    mb: 2, 
                    backgroundColor: 'rgba(255,255,255,0.05)', 
                    borderRadius: 1,
                    '& input': { color: 'white' }
                }}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <SearchIcon sx={{ color: 'gray' }} />
                        </InputAdornment>
                    ),
                }}
            />

            {/* Chat History List */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar">
                <Typography variant="caption" sx={{ color: 'gray', fontWeight: 'bold', mb: 1, display: 'block' }}>
                    {searchQuery ? 'SEARCH RESULTS' : 'RECENT'}
                </Typography>
                <List>
                    {conversations.map((chat) => (
                        <ListItemButton 
                            key={chat._id} 
                            onClick={() => onSelectChat(chat._id)}
                            selected={activeChatId === chat._id}
                            sx={{
                                borderRadius: 2,
                                mb: 0.5,
                                '&.Mui-selected': { backgroundColor: 'rgba(255,255,255,0.1)' },
                                '&:hover': { backgroundColor: 'rgba(255,255,255,0.05)' }
                            }}
                        >
                            <ChatBubbleOutlineIcon sx={{ mr: 2, fontSize: 20, color: 'gray' }} />
                            <ListItemText 
                                primary={chat.title} 
                                primaryTypographyProps={{ noWrap: true, fontSize: 14 }} 
                            />
                        </ListItemButton>
                    ))}
                    {conversations.length === 0 && (
                        <Typography variant="body2" sx={{ color: 'gray', textAlign: 'center', mt: 4 }}>
                            No conversations found.
                        </Typography>
                    )}
                </List>
            </div>
        </div>
    );
};

export default Sidebar;