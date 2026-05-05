const StudentMarks = require('../models/StudentMarks');
const Student = require('../models/Student');

// --- PURE MATH CALCULATION HELPER ---
const calculateModuleInternal = (moduleData) => {
    const T1_raw = moduleData.preT1 + moduleData.T1; 
    const T1_scaled = (T1_raw / 30) * 14;
    const T2_scaled = (moduleData.T2 / 5) * 3;
    const T3_scaled = (moduleData.T3 / 5) * 3;
    const T4_scaled = moduleData.T4;
    const T5_avg = moduleData.T5.reduce((a, b) => a + b, 0) / 4;
    
    return T1_scaled + T2_scaled + T3_scaled + T4_scaled + T5_avg;
};

// --- POST /api/student/marks ---
exports.submitMarks = async (req, res) => {
    try {
        if (req.user.role !== 'student') return res.status(403).json({ message: 'This feature is available only for registered students.' });
        const studentRecord = await Student.findById(req.user.id);
        if (!studentRecord || !studentRecord.isVerifiedStudent) return res.status(403).json({ message: 'This feature is available only for registered students.' });

        const { regNo, module1, module2 } = req.body;

        let M1_internal = null;
        let M2_internal = null;

        // 1. CALCULATE INDEPENDENT MODULES
        // We only calculate if the frontend sent us valid preT1 data for that module
        if (module1 && module1.preT1 !== undefined && module1.preT1 !== '') {
            M1_internal = calculateModuleInternal(module1);
        }
        if (module2 && module2.preT1 !== undefined && module2.preT1 !== '') {
            M2_internal = calculateModuleInternal(module2);
        }

        // 2. CALCULATE FINAL INTERNAL
        let final_internal = null;
        if (M1_internal !== null && M2_internal !== null) {
            final_internal = (M1_internal + M2_internal) / 2; // Both exist
        } else if (M1_internal !== null) {
            final_internal = M1_internal; // Only M1 exists
        } else if (M2_internal !== null) {
            final_internal = M2_internal; // Only M2 exists
        } else {
            return res.status(400).json({ message: 'Please provide data for at least one module.' });
        }

        // 3. SAVE TO DATABASE
        const updateData = {
            userId: req.user.id,
            regNo: regNo.toUpperCase(),
            final_internal: parseFloat(final_internal.toFixed(2))
        };
        
        // Only save the modules that were actually submitted
        if (M1_internal !== null) {
            updateData.module1 = module1;
            updateData.M1_internal = parseFloat(M1_internal.toFixed(2));
        }
        if (M2_internal !== null) {
            updateData.module2 = module2;
            updateData.M2_internal = parseFloat(M2_internal.toFixed(2));
        }

        const marksRecord = await StudentMarks.findOneAndUpdate(
            { userId: req.user.id }, 
            { $set: updateData },
            { returnDocument: 'after', upsert: true, runValidators: true }
        );

        res.status(200).json({
            message: 'Marks calculated and saved successfully!',
            results: {
                module1Internal: marksRecord.M1_internal,
                module2Internal: marksRecord.M2_internal,
                finalInternal: marksRecord.final_internal
            }
        });

    } catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ message: 'Invalid Input: ' + messages.join(', ') });
        }
        res.status(500).json({ message: 'Server error processing marks', error: error.message });
    }
};