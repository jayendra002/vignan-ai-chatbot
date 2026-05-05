const mongoose = require('mongoose');

const feeSchema = new mongoose.Schema({
    courseName: { type: String, required: true, unique: true },
    tuitionFee: { type: Number, required: true },
    hostelFee: { type: Number, required: true },
    otherCharges: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Fee', feeSchema);