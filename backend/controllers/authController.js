const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Student = require('../models/Student');
const Prospect = require('../models/Prospect');
const AssignmentStatus = require('../models/AssignmentStatus'); // <-- IMPORTED EXCEL DATA MODEL

// Helper function to generate JWT token
const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// ==========================================
// --- OTP SYSTEM LOGIC (NEW APPLICANTS) ---
// ==========================================

// Temporary memory store for OTPs (In production, use Redis or a Database)
const otpStore = {};

// --- SEND OTP API ---
exports.sendOtp = async (req, res) => {
    try {
        const { phone } = req.body;
        if (!phone) return res.status(400).json({ message: 'Phone number is required' });

        // Generate a random 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        otpStore[phone] = otp; // Store it temporarily

        // IN PRODUCTION: Here is where you would call Twilio or Fast2SMS API
        console.log(`\n======================================`);
        console.log(`📱 MOCK SMS: Sending OTP [ ${otp} ] to ${phone}`);
        console.log(`======================================\n`);

        res.status(200).json({ message: 'OTP sent! Please check your terminal.' });
    } catch (error) {
        res.status(500).json({ message: 'Error sending OTP', error: error.message });
    }
};

// --- VERIFY OTP API ---
exports.verifyOtp = async (req, res) => {
    try {
        const { phone, otp } = req.body;
        if (otpStore[phone] === otp) {
            delete otpStore[phone]; // Clean up after success to prevent reuse
            return res.status(200).json({ message: 'Phone verified successfully!' });
        }
        res.status(400).json({ message: 'Invalid or expired OTP.' });
    } catch (error) {
        res.status(500).json({ message: 'Error verifying OTP', error: error.message });
    }
};

// ==========================================
// --- REGISTRATION LOGIC ---
// ==========================================

// --- REGISTER STUDENT API ---
exports.registerStudent = async (req, res) => {
    try {
        const { registerNumber, name, password } = req.body;

        // 1. STRICT VERIFICATION: Does this student exist in our official college records?
        const isValidCollegeStudent = await AssignmentStatus.findOne({ regNo: registerNumber.toUpperCase() });
        
        if (!isValidCollegeStudent) {
            // Block them and tell them to register as a new applicant
            return res.status(400).json({ 
                message: 'Invalid Register Number. Try as a new applicant if you are not an existing college student.' 
            });
        }

        // 2. Verification Logic: Check if student has already created an account
        const studentExists = await Student.findOne({ registerNumber: registerNumber.toUpperCase() });
        if (studentExists) {
            return res.status(400).json({ message: 'A student with this register number is already registered.' });
        }

        // 3. Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 4. Create the verified student
        const student = await Student.create({
            registerNumber,
            name,
            password: hashedPassword,
            isVerifiedStudent: true // <-- Mark them as verified!
        });

        // 5. Return success with Token
        res.status(201).json({
            _id: student._id,
            name: student.name,
            role: 'student',
            token: generateToken(student._id, 'student')
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// --- REGISTER PROSPECT API ---
exports.registerProspect = async (req, res) => {
    try {
        // --- ADDED PHONE EXTRACTION HERE ---
        const { email, name, password, interestedProgram, phone } = req.body;

        const prospectExists = await Prospect.findOne({ email: email.toLowerCase() });
        if (prospectExists) {
            return res.status(400).json({ message: 'This email is already registered.' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const prospect = await Prospect.create({
            email,
            name,
            password: hashedPassword,
            interestedProgram,
            phone // --- SAVING PHONE TO THE DATABASE HERE ---
        });

        res.status(201).json({
            _id: prospect._id,
            name: prospect.name,
            role: 'prospect',
            token: generateToken(prospect._id, 'prospect')
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// ==========================================
// --- LOGIN LOGIC ---
// ==========================================

// --- UNIFIED LOGIN API ---
exports.loginUser = async (req, res) => {
    try {
        const { identifier, password } = req.body; 
        
        // --- SAFETY CHECK ---
        if (!identifier || !password) {
            return res.status(400).json({ message: 'Please provide both an identifier and password.' });
        }

        let user;
        let role;

        // 1. Check if the identifier matches an email format (Prospect)
        if (identifier.includes('@')) {
            user = await Prospect.findOne({ email: identifier.toLowerCase() });
            role = 'prospect';
        } 
        // 2. Otherwise, treat it as a Register Number (Student)
        else {
            user = await Student.findOne({ registerNumber: identifier.toUpperCase() });
            role = 'student';
        }

        // 3. If user doesn't exist in either database
        if (!user) {
            return res.status(404).json({ message: 'User not found. Please check your credentials.' });
        }

        // 4. Verify Password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid password.' });
        }

        // 5. Login successful
        res.status(200).json({
            _id: user._id,
            name: user.name,
            role: role,
            token: generateToken(user._id, role)
        });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};