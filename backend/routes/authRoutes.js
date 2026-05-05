const express = require('express');
const router = express.Router();

// Import the controller
const authController = require('../controllers/authController');

// Registration Routes
router.post('/register-student', authController.registerStudent);
router.post('/register-prospect', authController.registerProspect);

// Login Route
router.post('/login', authController.loginUser);

// OTP Routes for New Applicants
router.post('/send-otp', authController.sendOtp);
router.post('/verify-otp', authController.verifyOtp);

module.exports = router;