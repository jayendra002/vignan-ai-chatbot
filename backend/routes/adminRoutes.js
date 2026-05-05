const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const adminController = require('../controllers/adminController');

// --- ADMIN SECURITY MIDDLEWARE ---
// This ensures ONLY people with an 'admin' token can access the data
const adminProtect = (req, res, next) => {
    let token = req.headers.authorization && req.headers.authorization.split(' ')[1];
    
    if (!token) return res.status(401).json({ message: 'Not authorized, no token' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.role !== 'admin') {
            return res.status(403).json({ message: 'Access Denied: Admins Only' });
        }
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ message: 'Not authorized, token failed' });
    }
};

// --- ROUTES ---
router.post('/login', adminController.adminLogin);
router.get('/data', adminProtect, adminController.getDashboardData);
router.get('/faqs', adminProtect, adminController.getAllFaqs);
router.post('/faqs', adminProtect, adminController.createFaq);
router.put('/faqs/:id', adminProtect, adminController.updateFaq);
router.delete('/faqs/:id', adminProtect, adminController.deleteFaq);

router.get('/analytics/top-questions', adminProtect, adminController.getTopQuestions);

// Export CSV Route
router.get('/export-chats', adminProtect, adminController.exportChats);

module.exports = router;