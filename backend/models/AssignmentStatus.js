const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
    regNo: { type: String, required: true, uppercase: true },
    name: { type: String },
    branch: { type: String },
    totalScore: { type: String },
    percentage: { type: String }
});

module.exports = mongoose.model('AssignmentStatus', assignmentSchema);