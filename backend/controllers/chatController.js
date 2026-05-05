const { GoogleGenerativeAI } = require('@google/generative-ai');
const Faq = require('../models/Faq');
const CampusData = require('../models/CampusData');
const AssignmentStatus = require('../models/AssignmentStatus');
const Conversation = require('../models/Conversation');
const StudentMarks = require('../models/StudentMarks'); 

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const withTimeout = (promise, ms) => {
    const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('AI_API_TIMEOUT')), ms));
    return Promise.race([promise, timeout]);
};

// --- 1. PROCESS CHAT MESSAGE ---
exports.processChatMessage = async (req, res) => {
    try {
        const { message, conversationId } = req.body;
        const userId = req.user.id;
        const userRole = req.user.role; 

        if (!message) return res.status(400).json({ message: 'Please provide a message.' });

        // A. FIND OR CREATE CONVERSATION
        let conversation;
        if (conversationId) {
            conversation = await Conversation.findOne({ _id: conversationId, userId });
            if (!conversation) return res.status(404).json({ message: 'Conversation not found.' });
        } else {
            const title = message.length > 30 ? message.substring(0, 30) + '...' : message;
            conversation = await Conversation.create({ userId, title, messages: [] });
        }

        // B. ADD USER MESSAGE TO THREAD
        conversation.messages.push({ text: message, sender: 'user' });

        const lowerMessage = message.toLowerCase();

        // ==========================================
        // C. MARKS & PREDICTION INTERCEPTOR
        // ==========================================
        const isAskingAboutMarks = lowerMessage.includes('my internal marks') || lowerMessage.includes('my marks');
        const isAskingPrediction = lowerMessage.includes('how much should i score') || lowerMessage.includes('predict') || lowerMessage.includes('cgpa');

        if (isAskingAboutMarks || isAskingPrediction) {
            if (userRole !== 'student') {
                const botResponse = "This feature is only available for enrolled students. New applicants cannot access the academic predictor.";
                conversation.messages.push({ text: botResponse, sender: 'bot' });
                await conversation.save();
                return res.status(200).json({ reply: botResponse, conversationId: conversation._id });
            }

            const userMarks = await StudentMarks.findOne({ userId: req.user.id });
            let botResponse = "";
            
            if (!userMarks || userMarks.final_internal === null) {
                botResponse = "I don't have enough internal marks data to make a prediction. Please use the 'Calculate Marks' portal first!";
            } else {
                botResponse = `Here is your current internal standing:\n`;
                if (userMarks.M1_internal !== null) botResponse += `📚 Module 1: ${userMarks.M1_internal} / 60\n`;
                if (userMarks.M2_internal !== null) botResponse += `📚 Module 2: ${userMarks.M2_internal} / 60\n`;
                botResponse += `📊 Final Internal Average: ${userMarks.final_internal} / 60\n\n`;

                if (isAskingPrediction) {
                    botResponse += `🎯 **Semester Target Predictions (Out of 40):**\n`;
                    const targets = [
                        { cgpa: '7 CGPA', requiredTotal: 70 },
                        { cgpa: '8 CGPA', requiredTotal: 80 },
                        { cgpa: '8.5+ CGPA', requiredTotal: 85 }
                    ];

                    targets.forEach(target => {
                        let requiredSemester = parseFloat((target.requiredTotal - userMarks.final_internal).toFixed(2));
                        if (requiredSemester > 40) {
                            botResponse += `• For ${target.cgpa}: Target not achievable with current internal marks.\n`;
                        } else if (requiredSemester <= 0) {
                            botResponse += `• For ${target.cgpa}: You have already secured this grade!\n`;
                        } else {
                            botResponse += `• For ${target.cgpa}: You need at least ${requiredSemester} marks.\n`;
                        }
                    });
                } else {
                    botResponse += `Ask me "How much do I need for 8 CGPA?" to see your predictions!`;
                }
            }

            conversation.messages.push({ text: botResponse, sender: 'bot' });
            await conversation.save();
            return res.status(200).json({ reply: botResponse, conversationId: conversation._id });
        }

        // ==========================================
        // D. ADMISSIONS & CAMPUS IMAGES INTERCEPTOR
        // ==========================================
        const isAskingAdmission = lowerMessage.includes('how to apply') || lowerMessage.includes('admission link') || lowerMessage.includes('apply now');
        const isAskingCampus = (lowerMessage.includes('show') && lowerMessage.includes('campus')) || lowerMessage.includes('campus image') || lowerMessage.includes('college photo');

        if (isAskingAdmission) {
            const botResponse = "You can apply for admission directly through our official portal. Click the link below to start your application:\n\n🌐 **Official Admission Website:**\nhttps://admissions.vignan.ac.in/";
            conversation.messages.push({ text: botResponse, sender: 'bot' });
            await conversation.save();
            return res.status(200).json({ reply: botResponse, conversationId: conversation._id });
        }

        if (isAskingCampus) {
            const botResponse = "Here are some glimpses of our beautiful Vignan campus! 🏛️✨";
            
            // THESE POINT DIRECTLY TO THE IMAGES IN YOUR FRONTEND PUBLIC FOLDER
            const campusImages = [
                "/image_f10e9f.png", 
                "/image_f10eda.png",
                "/image_f10f1d.png"
            ];

            conversation.messages.push({ text: botResponse, sender: 'bot', images: campusImages });
            await conversation.save();
            
            return res.status(200).json({ reply: botResponse, images: campusImages, conversationId: conversation._id });
        }

        // ==========================================
        // E. VIGNAN LOGIC (FAQs, Excel, Gemini)
        // ==========================================
        const rawWords = lowerMessage.split(/[\s,!?]+/);
        const stopWords = ['what', 'is', 'the', 'for', 'can', 'you', 'tell', 'me', 'about', 'a', 'an', 'of', 'in'];
        const meaningfulWords = rawWords.filter(word => !stopWords.includes(word) && word.length > 2);
        const regexArray = meaningfulWords.map(word => new RegExp(word, 'i'));

        const upperWords = message.toUpperCase().split(/[\s,!?]+/);
        const foundStudent = await AssignmentStatus.findOne({ regNo: { $in: upperWords } });

        let botResponse = "";

        if (!foundStudent && regexArray.length > 0) {
            const exactFaq = await Faq.findOne({ $or: [{ question: { $in: regexArray } }, { keywords: { $in: regexArray } }] });
            if (exactFaq) botResponse = exactFaq.answer;
        }

        if (!botResponse) {
            let contextString = "Official Database:\n\n";

            // --- ADMISSION CONTEXT (UPDATED FOR OFFICIAL FEE LINK) ---
            if (userRole === 'prospect') {
                contextString += `
                --- ADMISSION RULES FOR NEW APPLICANTS ---
                - Eligibility: Minimum 60% in 10th and 12th/Diploma is required.
                - Cutoffs (Approximate Rank): CSE (<10,000), ECE (<25,000), Mechanical/Civil (<50,000).
                - Fees: Do NOT state specific monetary figures for fees. Instruct the user to check the official fee structure link here: https://vignan.ac.in/newvignan/fee_str.php
                - Course Advice: Suggest CSE for coding/AI, ECE for circuits/hardware, Mech for machines.
                \n`;
            }

            if (foundStudent) {
                contextString += `--- STUDENT RECORD ---\nName: ${foundStudent.name}\nRegNo: ${foundStudent.regNo}\nScore: ${foundStudent.totalScore}\n`;
            } else {
                const campusContextData = await CampusData.find({ $or: [{ title: { $in: regexArray } }, { content: { $in: regexArray } }] }).limit(2);
                if (campusContextData.length > 0) {
                    contextString += campusContextData.map(data => `Topic: ${data.title}\nInfo: ${data.content}`).join('\n\n');
                } else {
                    contextString += "No specific data found.";
                }
            }

            const prompt = `You are a helpful assistant. Answer concisely using ONLY the provided context.\n${contextString}\nQuestion: "${message}"\nAnswer:`;

            try {
                const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }); 
                const result = await withTimeout(model.generateContent(prompt), 15000);
                botResponse = result.response.text();
            } catch (aiError) {
                console.error("Gemini AI Failed:", aiError.message);
                botResponse = foundStudent ? `Backup: Student ${foundStudent.name} score is ${foundStudent.totalScore}.` : "I'm having trouble connecting to AI services right now.";
            }
        }

        botResponse = botResponse.trim();

        conversation.messages.push({ text: botResponse, sender: 'bot' });
        await conversation.save();

        res.status(200).json({ reply: botResponse, conversationId: conversation._id });

    } catch (error) {
        console.error('Chat Controller Error:', error.message);
        res.status(500).json({ message: 'Server error processing chat.' });
    }
};

// --- GET ALL CONVERSATIONS ---
exports.getUserConversations = async (req, res) => {
    try {
        const conversations = await Conversation.find({ userId: req.user.id }).select('_id title updatedAt shareId').sort({ updatedAt: -1 });
        res.status(200).json(conversations);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching conversations' });
    }
};

// --- GET SINGLE CONVERSATION ---
exports.getSingleConversation = async (req, res) => {
    try {
        const conversation = await Conversation.findOne({ _id: req.params.id, userId: req.user.id });
        if (!conversation) return res.status(404).json({ message: 'Not found' });
        res.status(200).json(conversation);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching conversation' });
    }
};

// --- SEARCH CONVERSATIONS ---
exports.searchConversations = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) return res.status(400).json({ message: 'Search term required' });
        const results = await Conversation.find({ userId: req.user.id, 'messages.text': { $regex: q, $options: 'i' } }).select('_id title updatedAt');
        res.status(200).json(results);
    } catch (error) {
        res.status(500).json({ message: 'Search failed' });
    }
};

// --- GET SHARED CONVERSATION ---
exports.getSharedConversation = async (req, res) => {
    try {
        const conversation = await Conversation.findOne({ shareId: req.params.shareId });
        if (!conversation) return res.status(404).json({ message: 'Shared link invalid or expired' });
        res.status(200).json({ title: conversation.title, messages: conversation.messages });
    } catch (error) {
        res.status(500).json({ message: 'Error loading shared chat' });
    }
};