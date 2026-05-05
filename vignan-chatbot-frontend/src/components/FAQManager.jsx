import React, { useState, useEffect } from 'react';
import { Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Chip } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import api from '../services/api';

const FAQManager = () => {
    const [faqs, setFaqs] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({ question: '', answer: '', keywords: '' });

    useEffect(() => {
        fetchFaqs();
    }, []);

    const fetchFaqs = async () => {
        try {
            const res = await api.get('/admin/faqs');
            setFaqs(res.data);
        } catch (error) { console.error("Error fetching FAQs", error); }
    };

    const handleOpen = (faq = null) => {
        if (faq) {
            setEditingId(faq._id);
            setFormData({ question: faq.question, answer: faq.answer, keywords: faq.keywords.join(', ') });
        } else {
            setEditingId(null);
            setFormData({ question: '', answer: '', keywords: '' });
        }
        setOpenDialog(true);
    };

    const handleSave = async () => {
        const payload = { ...formData, keywords: formData.keywords.split(',').map(k => k.trim()) };
        try {
            if (editingId) {
                await api.put(`/admin/faqs/${editingId}`, payload);
            } else {
                await api.post('/admin/faqs', payload);
            }
            setOpenDialog(false);
            fetchFaqs();
        } catch (error) { console.error("Error saving FAQ", error); }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this FAQ?")) {
            try {
                await api.delete(`/admin/faqs/${id}`);
                fetchFaqs();
            } catch (error) { console.error("Error deleting FAQ", error); }
        }
    };

    return (
        <div className="animate-fade-in">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Knowledge Base (FAQs)</h2>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpen()} sx={{ backgroundColor: '#1a56db' }}>
                    Add FAQ
                </Button>
            </div>

            <TableContainer component={Paper} elevation={2} className="rounded-xl overflow-hidden">
                <Table>
                    <TableHead>
                        <TableRow sx={{ backgroundColor: '#f8fafc' }}>
                            <TableCell sx={{ fontWeight: 'bold' }}>Question</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Answer (Snippet)</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Keywords</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {faqs.map((faq) => (
                            <TableRow key={faq._id} hover>
                                <TableCell className="font-medium">{faq.question}</TableCell>
                                <TableCell>{faq.answer.substring(0, 50)}...</TableCell>
                                <TableCell>
                                    <div className="flex gap-1 flex-wrap">
                                        {faq.keywords.map((kw, i) => <Chip key={i} label={kw} size="small" variant="outlined" />)}
                                    </div>
                                </TableCell>
                                <TableCell align="right">
                                    <IconButton color="primary" onClick={() => handleOpen(faq)}><EditIcon /></IconButton>
                                    <IconButton color="error" onClick={() => handleDelete(faq._id)}><DeleteIcon /></IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* ADD/EDIT DIALOG */}
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth maxWidth="sm">
                <DialogTitle>{editingId ? 'Edit FAQ' : 'Add New FAQ'}</DialogTitle>
                <DialogContent className="flex flex-col gap-4 mt-2">
                    <TextField label="Question" fullWidth value={formData.question} onChange={(e) => setFormData({...formData, question: e.target.value})} />
                    <TextField label="Answer" fullWidth multiline rows={4} value={formData.answer} onChange={(e) => setFormData({...formData, answer: e.target.value})} />
                    <TextField label="Keywords (comma separated)" fullWidth value={formData.keywords} onChange={(e) => setFormData({...formData, keywords: e.target.value})} helperText="e.g. library, timings, hours" />
                </DialogContent>
                <DialogActions className="p-4">
                    <Button onClick={() => setOpenDialog(false)} color="inherit">Cancel</Button>
                    <Button onClick={handleSave} variant="contained" sx={{ backgroundColor: '#1a56db' }}>Save FAQ</Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default FAQManager;