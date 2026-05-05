import React, { useState, useEffect, useRef } from 'react';
import { TextField, IconButton, Typography, Paper, Avatar, CircularProgress, Button } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';
import IosShareIcon from '@mui/icons-material/IosShare';
import api from '../services/api';

const ChatWindow = ({ activeChatId, onChatCreated }) => {
    const messagesEndRef = useRef(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [shareId, setShareId] = useState(null);

    // Load messages when a chat is clicked in the sidebar
    useEffect(() => {
        const loadConversation = async () => {
            if (!activeChatId) {
                setMessages([{ text: "Hello! Start a new conversation with Vignan AI.", sender: "bot" }]);
                setShareId(null);
                return;
            }
            try {
                const response = await api.get(`/chat/conversations/${activeChatId}`);
                setMessages(response.data.messages);
                setShareId(response.data.shareId);
            } catch (error) {
                console.error("Error loading chat", error);
            }
        };
        loadConversation();
    }, [activeChatId]);

    // Auto-scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleShare = () => {
        if (!shareId) return;
        const link = `${window.location.origin}/share/${shareId}`;
        navigator.clipboard.writeText(link);
        alert(`Link Copied!\n\nAnyone with this link can view this chat:\n${link}`);
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userText = input.trim();
        setInput('');
        setMessages((prev) => [...prev, { text: userText, sender: "user" }]);
        setLoading(true);

        try {
            const response = await api.post('/chat', { 
                message: userText, 
                conversationId: activeChatId 
            });
            
            // NEW: Handle both text and potential images from the backend
            setMessages((prev) => [
                ...prev, 
                { 
                    text: response.data.reply, 
                    images: response.data.images || [], 
                    sender: "bot" 
                }
            ]);
            
            if (!activeChatId) {
                onChatCreated(response.data.conversationId);
            }
        } catch (error) {
            setMessages((prev) => [...prev, { text: "Error connecting to AI.", sender: "bot" }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-white relative">
            
            {/* Header / Share Button */}
            {activeChatId && (
                <div className="absolute top-4 right-6 z-10">
                    <Button 
                        variant="outlined" 
                        size="small" 
                        startIcon={<IosShareIcon />} 
                        onClick={handleShare}
                        sx={{ borderRadius: '20px', backgroundColor: 'white' }}
                    >
                        Share Chat
                    </Button>
                </div>
            )}

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 scroll-smooth">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`flex max-w-[85%] md:max-w-[70%] gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                            <Avatar sx={{ bgcolor: msg.sender === 'user' ? '#1e3a8a' : '#ffffff', border: msg.sender === 'bot' ? '1px solid #e2e8f0' : 'none' }}>
                                {msg.sender === 'user' ? <PersonIcon /> : <SmartToyIcon color="primary" />}
                            </Avatar>
                            
                            <Paper elevation={1} className={`px-5 py-3 rounded-2xl ${msg.sender === 'user' ? 'bg-[#1a56db] text-white rounded-tr-sm' : 'bg-gray-50 text-gray-800 rounded-tl-sm border border-gray-100'}`}>
                                {/* Text Output */}
                                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{msg.text}</Typography>
                                
                                {/* Image Output Grid (If images exist) */}
                                {msg.images && msg.images.length > 0 && (
                                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {msg.images.map((imgUrl, i) => (
                                            <img 
                                                key={i} 
                                                src={imgUrl} 
                                                alt="Campus" 
                                                className="w-full h-auto rounded-lg shadow-sm border border-gray-200 object-cover max-h-48"
                                                onError={(e) => e.target.style.display = 'none'} // Hides broken links safely
                                            />
                                        ))}
                                    </div>
                                )}
                            </Paper>
                        </div>
                    </div>
                ))}
                
                {loading && (
                    <div className="flex justify-start gap-3">
                        <Avatar sx={{ bgcolor: '#ffffff', border: '1px solid #e2e8f0' }}><SmartToyIcon color="primary" /></Avatar>
                        <Paper elevation={0} className="px-5 py-3 rounded-2xl rounded-tl-sm bg-gray-50 border border-gray-100 flex items-center gap-3">
                            <CircularProgress size={16} thickness={5} sx={{ color: '#1a56db' }} />
                            <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'gray' }}>AI is thinking...</Typography>
                        </Paper>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <div className="p-4 md:p-6 bg-white border-t border-gray-100">
                <form onSubmit={sendMessage} className="max-w-4xl mx-auto flex items-center gap-3">
                    <TextField fullWidth placeholder="Message Vignan AI..." variant="outlined" value={input} onChange={(e) => setInput(e.target.value)} disabled={loading} autoComplete="off" sx={{ '& .MuiOutlinedInput-root': { borderRadius: '30px', backgroundColor: '#f8fafc' } }} />
                    <IconButton type="submit" disabled={!input.trim() || loading} sx={{ backgroundColor: input.trim() ? '#1a56db' : '#f1f5f9', color: input.trim() ? 'white' : 'gray', '&:hover': { backgroundColor: '#1e3a8a' }, padding: '12px' }}>
                        <SendIcon />
                    </IconButton>
                </form>
            </div>
        </div>
    );
};

export default ChatWindow;