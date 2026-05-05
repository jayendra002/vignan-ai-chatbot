const Prospect = require('../models/Prospect');
const Fee = require('../models/Fee'); // <-- IMPORT NEW MODEL

exports.analyzeProfile = async (req, res) => {
    try {
        if (req.user.role !== 'prospect') {
            return res.status(403).json({ message: 'This feature is exclusively for new applicants.' });
        }

        const { tenth, twelfth, rank, interests, course, hostelRequired } = req.body;

        const report = {
            eligibility: { status: 'Unknown', message: '' },
            predictedBranches: [],
            feeEstimate: { tuition: 0, hostel: 0, other: 0, total: 0 },
            recommendation: '',
            scholarship: '' // <-- NEW FIELD
        };

        // --- 1. ELIGIBILITY CHECKER ---
        if (twelfth) {
            if (twelfth >= 60) {
                report.eligibility.status = 'Eligible';
                report.eligibility.message = 'Congratulations! You meet the minimum 60% requirement for admission.';
            } else {
                report.eligibility.status = 'Not Eligible';
                report.eligibility.message = 'You need a minimum of 60% in your 12th/Diploma for standard admission.';
            }
        }

        // --- 2. SCHOLARSHIP SUGGESTION ---
        if (tenth && twelfth) {
            if (tenth >= 90 && twelfth >= 85) {
                report.scholarship = "Excellent academic performance! 🌟 You may be eligible for merit-based scholarships. Early admission applications can increase your chances.";
            } else if (tenth >= 80 || twelfth >= 80) {
                report.scholarship = "You have good academic performance! Scholarship opportunities may be available.";
            } else {
                report.scholarship = "Explore available financial aid and scholarship options during the admission process.";
            }
        }

        // --- 3. BRANCH PREDICTOR ---
        if (rank) {
            if (rank <= 10000) report.predictedBranches = ['CSE', 'IT', 'AI & Data Science', 'ECE'];
            else if (rank <= 25000) report.predictedBranches = ['IT', 'ECE', 'EEE'];
            else if (rank <= 50000) report.predictedBranches = ['EEE', 'Mechanical', 'Civil'];
            else report.predictedBranches = ['Civil', 'Mechanical', 'Management Quota'];
        }

        // --- 4. REAL FEE INTEGRATION (DB FETCH) ---
        if (course) {
            // Try to find the exact course in the database
            const feeData = await Fee.findOne({ courseName: course });
            
            if (feeData) {
                report.feeEstimate.tuition = feeData.tuitionFee;
                report.feeEstimate.hostel = hostelRequired ? feeData.hostelFee : 0;
                report.feeEstimate.other = feeData.otherCharges || 0;
            } else {
                // Fallback if DB is empty
                const fallbackFees = { 'CSE': 250000, 'IT': 200000, 'ECE': 180000, 'EEE': 150000, 'Mechanical': 120000, 'Civil': 120000 };
                report.feeEstimate.tuition = fallbackFees[course] || 150000;
                report.feeEstimate.hostel = hostelRequired ? 100000 : 0;
                report.feeEstimate.other = 0;
            }
            report.feeEstimate.total = report.feeEstimate.tuition + report.feeEstimate.hostel + report.feeEstimate.other;
        }

        // --- 5. COURSE RECOMMENDATION ---
        if (interests) {
            const lowerInterests = interests.toLowerCase();
            if (lowerInterests.match(/coding|software|computer|app|web|ai|data/)) report.recommendation = 'Computer Science & Engineering (CSE) or IT aligns perfectly with your interest in technology and software.';
            else if (lowerInterests.match(/circuit|electronics|hardware|iot|robotics/)) report.recommendation = 'Electronics & Communication (ECE) or EEE is ideal for your hardware interests.';
            else if (lowerInterests.match(/machine|engine|car|build|construction/)) report.recommendation = 'Mechanical or Civil Engineering suits your hands-on building interests.';
            else report.recommendation = 'Based on your inputs, we recommend speaking with our academic counselor to find the perfect fit!';
        }

        res.status(200).json({ success: true, report });

    } catch (error) {
        console.error("Prospect Analysis Error:", error);
        res.status(500).json({ message: 'Error analyzing applicant profile.' });
    }
};