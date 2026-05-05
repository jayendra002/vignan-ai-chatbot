const mongoose = require('mongoose');

const chatHistorySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        // We don't use 'ref' here because the user could be a Student OR a Prospect
    },
    message: {
        type: String,
        required: true
    },
    response: {
        type: String,
        required: true
    }
}, { timestamps: true }); // Automatically adds 'createdAt' timestamp

module.exports = mongoose.model('ChatHistory', chatHistorySchema);