const jwt = require('jsonwebtoken');
const { Parser } = require('json2csv'); // <-- Required for CSV Export
const Student = require('../models/Student');
const Prospect = require('../models/Prospect');
const Conversation = require('../models/Conversation'); // <-- Upgraded to the new Thread schema
const Faq = require('../models/Faq');

// ==========================================
// --- 1. ADMIN LOGIN ---
// ==========================================
exports.adminLogin = async (req, res) => {
    const { username, password } = req.body;

    // Hardcoded Admin Credentials (In a real app, store these in .env)
    if (username === 'vignan_admin' && password === 'admin123') {
        const token = jwt.sign({ id: 'admin_id', role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '1d' });
        return res.status(200).json({ token, role: 'admin', name: 'Super Admin' });
    }

    res.status(401).json({ message: 'Invalid Admin Credentials' });
};

// ==========================================
// --- 2. GET DASHBOARD DATA ---
// ==========================================
exports.getDashboardData = async (req, res) => {
    try {
        // Run database count queries in parallel for speed
        const [studentCount, prospectCount, chatCount] = await Promise.all([
            Student.countDocuments(),
            Prospect.countDocuments(),
            Conversation.countDocuments() // <-- Now counts total conversation threads
        ]);

        // Fetch user lists (excluding passwords for security)
        const students = await Student.find().select('-password').sort({ createdAt: -1 });
        const prospects = await Prospect.find().select('-password').sort({ createdAt: -1 });

        res.status(200).json({
            stats: { 
                totalStudents: studentCount, 
                totalProspects: prospectCount, 
                totalChats: chatCount 
            },
            users: { students, prospects }
        });
    } catch (error) {
        console.error("Admin Error:", error);
        res.status(500).json({ message: 'Server Error fetching admin data' });
    }
};

// ==========================================
// --- 3. FAQ MANAGEMENT APIs ---
// ==========================================
exports.getAllFaqs = async (req, res) => {
    try {
        const faqs = await Faq.find().sort({ createdAt: -1 });
        res.status(200).json(faqs);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching FAQs', error: error.message });
    }
};

exports.createFaq = async (req, res) => {
    try {
        const { question, answer, keywords } = req.body;
        const newFaq = await Faq.create({ question, answer, keywords });
        res.status(201).json(newFaq);
    } catch (error) {
        res.status(500).json({ message: 'Error creating FAQ', error: error.message });
    }
};

exports.updateFaq = async (req, res) => {
    try {
        const { question, answer, keywords } = req.body;
        const updatedFaq = await Faq.findByIdAndUpdate(
            req.params.id, 
            { question, answer, keywords }, 
            { returnDocument: 'after' } // Returns the updated document
        );
        res.status(200).json(updatedFaq);
    } catch (error) {
        res.status(500).json({ message: 'Error updating FAQ', error: error.message });
    }
};

exports.deleteFaq = async (req, res) => {
    try {
        await Faq.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'FAQ deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting FAQ', error: error.message });
    }
};

// ==========================================
// --- 4. ANALYTICS API ---
// ==========================================
exports.getTopQuestions = async (req, res) => {
    try {
        // Updated Aggregation to look inside the new Conversation threads!
        const topQuestions = await Conversation.aggregate([
            { $unwind: "$messages" }, // Break conversations into individual messages
            { $match: { "messages.sender": "user" } }, // Only look at what the user asked
            { 
                $group: { 
                    _id: { $toLower: "$messages.text" }, // Group by lowercase message text
                    count: { $sum: 1 }             // Count occurrences
                } 
            },
            { $sort: { count: -1 } },              // Sort highest to lowest
            { $limit: 10 }                         // Get top 10
        ]);

        res.status(200).json(topQuestions);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching analytics', error: error.message });
    }
};

// ==========================================
// --- 5. EXPORT CHATS API (CSV) ---
// ==========================================
exports.exportChats = async (req, res) => {
    try {
        // Fetch all conversations
        const conversations = await Conversation.find().sort({ createdAt: -1 });
        
        // Flatten the data for Excel/CSV formatting
        const exportData = [];
        conversations.forEach(conv => {
            conv.messages.forEach(msg => {
                exportData.push({
                    Thread_Title: conv.title,
                    Sender: msg.sender.toUpperCase(),
                    Message: msg.text,
                    Date: new Date(msg.timestamp).toLocaleString()
                });
            });
        });

        if (exportData.length === 0) {
            return res.status(404).json({ message: 'No chat data to export' });
        }

        // Convert JSON to CSV
        const json2csvParser = new Parser();
        const csv = json2csvParser.parse(exportData);

        // Send file to frontend
        res.header('Content-Type', 'text/csv');
        res.attachment('Vignan_AI_Chat_History.csv');
        return res.send(csv);

    } catch (error) {
        console.error("Export Error:", error);
        res.status(500).json({ message: 'Error exporting chats' });
    }
};