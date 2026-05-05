const mongoose = require('mongoose');

const campusDataSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true,
        // Grouping data helps the AI search faster later
        enum: ['Admissions', 'Academics', 'Hostel', 'Transport', 'General'] 
    },
    sourceUrl: {
        type: String,
        required: true,
        unique: true // Prevents storing the exact same page twice
    }
}, { timestamps: true });

module.exports = mongoose.model('CampusData', campusDataSchema);