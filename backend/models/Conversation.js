const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const conversationSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        required: true 
    },
    title: { 
        type: String, 
        default: 'New Chat' 
    },
    shareId: { 
        type: String, 
        default: uuidv4, // Automatically generates a unique secure link ID
        unique: true 
    },
    messages: [{
        text: String,
        sender: { type: String, enum: ['user', 'bot'] },
        images: [{ type: String }],
        timestamp: { type: Date, default: Date.now }
    }]
}, { timestamps: true });

module.exports = mongoose.model('Conversation', conversationSchema);