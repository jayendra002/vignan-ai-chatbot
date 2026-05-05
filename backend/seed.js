const mongoose = require('mongoose');
require('dotenv').config();
const Faq = require('./models/Faq');
const CampusData = require('./models/CampusData');
const AssignmentStatus = require('./models/AssignmentStatus'); // 1. Import new model

const seedData = require('./data/seedData.json');
const rawAssignments = require('./data/assignments.json'); // 2. Import your raw A-B-C JSON

const importData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected for Seeding...');

        // 3. Translate the Excel columns into our Database format
        const formattedAssignments = rawAssignments.map(row => ({
            regNo: row.E,           // Column E is the Registration Number
            name: row.B,            // Column B is the Name
            branch: row.C,          // Column C is the Branch
            totalScore: row.K,      // Column K is the Total
            percentage: row.L       // Column L is the Percentage
        }));

        console.log('Clearing old data...');
        await Faq.deleteMany();
        await CampusData.deleteMany();
        await AssignmentStatus.deleteMany(); 

        console.log('Inserting fresh Campus Data...');
        await Faq.insertMany(seedData.faqs);
        await CampusData.insertMany(seedData.campusData);

        console.log(`Inserting ${formattedAssignments.length} Student Assignment Records...`);
        await AssignmentStatus.insertMany(formattedAssignments); // 4. Insert the translated data!

        console.log('✅ Database Wiped and Fresh Data Imported Successfully!');
        process.exit();
        
    } catch (error) {
        console.error('❌ Error importing data:', error.message);
        process.exit(1);
    }
};

importData();