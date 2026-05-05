const mongoose = require('mongoose');

const prospectSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address']
    },
    name: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    phone: { type: String, required: true },
    interestedProgram: {
        type: String,
        default: 'Not specified'
    }
}, { timestamps: true });

module.exports = mongoose.model('Prospect', prospectSchema);