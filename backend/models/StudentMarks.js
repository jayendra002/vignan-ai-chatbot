const mongoose = require('mongoose');

const moduleSchema = new mongoose.Schema({
    preT1: { type: Number, required: true, min: 0, max: 10 },
    T1: { type: Number, required: true, min: 0, max: 20 },
    T2: { type: Number, required: true, min: 0, max: 5 },
    T3: { type: Number, required: true, min: 0, max: 5 },
    T4: { type: Number, required: true, min: 0, max: 20 },
    T5: { 
        type: [Number], 
        required: true,
        validate: [arrayLimit, 'T5 must contain exactly 4 test scores.']
    }
});

function arrayLimit(val) {
    return val.length === 4 && val.every(num => num >= 0 && num <= 20);
}

const marksSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true, unique: true },
    regNo: { type: String, required: true, uppercase: true },
    
    // Modules are now OPTIONAL so students can calculate one at a time
    module1: { type: moduleSchema, required: false },
    module2: { type: moduleSchema, required: false },
    
    // Calculated Fields
    M1_internal: { type: Number, default: null },
    M2_internal: { type: Number, default: null },
    final_internal: { type: Number, default: null }
    
    // Notice: semesterMarks and final_subject have been completely removed!
}, { timestamps: true });

module.exports = mongoose.model('StudentMarks', marksSchema);