import React, { useState, useEffect } from 'react';
import { Paper, Typography, CircularProgress, Divider, Button } from '@mui/material';
import AssessmentIcon from '@mui/icons-material/Assessment';
import DownloadIcon from '@mui/icons-material/Download';
import api from '../services/api';

const AnalyticsPanel = () => {
    const [topQuestions, setTopQuestions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const res = await api.get('/admin/analytics/top-questions');
                setTopQuestions(res.data);
            } catch (error) {
                console.error("Error fetching analytics", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, []);

    // --- CSV EXPORT FUNCTION ---
    const handleExport = async () => {
        try {
            // We need responseType: 'blob' to handle the file download correctly
            const response = await api.get('/admin/export-chats', { responseType: 'blob' });
            
            // Create a temporary hidden link to trigger the browser download
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'Vignan_AI_Chat_History.csv');
            document.body.appendChild(link);
            link.click();
            link.remove(); // Clean up after download
        } catch (error) {
            console.error("Export error:", error);
            alert("Failed to export chat data. Please try again.");
        }
    };

    if (loading) return <div className="flex justify-center p-8"><CircularProgress /></div>;

    // Find the maximum count to scale the bar chart properly
    const maxCount = topQuestions.length > 0 ? Math.max(...topQuestions.map(q => q.count)) : 1;

    return (
        <Paper elevation={2} className="p-6 md:p-8 rounded-xl animate-fade-in">
            {/* UPDATED HEADER: Title on left, Export Button on right */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                    <AssessmentIcon sx={{ color: '#f59e0b', fontSize: 32 }} />
                    <Typography variant="h5" fontWeight="bold" color="textPrimary">
                        Chat Analytics
                    </Typography>
                </div>
                
                <Button 
                    variant="outlined" 
                    startIcon={<DownloadIcon />} 
                    onClick={handleExport}
                    sx={{ color: '#1a56db', borderColor: '#1a56db', '&:hover': { backgroundColor: '#f8fafc' } }}
                >
                    Export All Chats (CSV)
                </Button>
            </div>

            <Typography variant="body2" color="textSecondary" className="mb-6">
                This data is aggregated from all student and applicant conversations with the AI.
            </Typography>
            <Divider className="mb-6" />

            {topQuestions.length === 0 ? (
                <Typography color="textSecondary">No chat data available yet.</Typography>
            ) : (
                <div className="space-y-6">
                    {topQuestions.map((item, index) => {
                        // Calculate percentage for the visual bar width
                        const percentage = Math.max((item.count / maxCount) * 100, 5); // Minimum 5% width so it's visible
                        
                        return (
                            <div key={index} className="flex flex-col gap-1">
                                <div className="flex justify-between items-end">
                                    <Typography variant="body1" fontWeight="medium" className="text-gray-800 capitalize">
                                        {index + 1}. "{item._id}"
                                    </Typography>
                                    <Typography variant="body2" fontWeight="bold" className="text-vignan-main">
                                        {item.count} {item.count === 1 ? 'time' : 'times'}
                                    </Typography>
                                </div>
                                {/* Custom CSS Bar Chart */}
                                <div className="w-full bg-gray-100 rounded-full h-3 mt-1 overflow-hidden">
                                    <div 
                                        className="bg-[#1a56db] h-3 rounded-full transition-all duration-1000 ease-out"
                                        style={{ width: `${percentage}%` }}
                                    ></div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </Paper>
    );
};

export default AnalyticsPanel;