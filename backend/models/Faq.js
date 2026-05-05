const mongoose = require('mongoose');

const faqSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true
    },
    answer: {
        type: String,
        required: true
    },
    keywords: {
        type: [String], // An array of strings, e.g., ["hostel", "fee", "cost"]
        required: true
    }
});

module.exports = mongoose.model('Faq', faqSchema);