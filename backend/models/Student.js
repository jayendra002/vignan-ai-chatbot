const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    registerNumber: {
        type: String,
        required: [true, 'Register number is required'],
        unique: true,
        uppercase: true, // Automatically converts to uppercase (e.g., 26cs1a0501 -> 26CS1A0501)
        trim: true,      // Removes accidental spaces before or after the number
        // Regex for exactly 10 alphanumeric characters. 
        match: [/^[A-Z0-9]{10}$/, 'Please enter a valid 10-character college register number']
    },
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },
    password: {
        type: String,
        required: [true, 'Password is required']
    },
    isVerifiedStudent: {
        type: Boolean,
        default: true // Defaults to true because our authController now blocks fake ones from even registering!
    }
}, { 
    timestamps: true // Automatically adds 'createdAt' and 'updatedAt' fields to your database
});

module.exports = mongoose.model('Student', studentSchema);