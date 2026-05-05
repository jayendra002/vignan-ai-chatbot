const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/db'); 

// 1. Import all routes
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const chatRoutes = require('./routes/chatRoutes');
const marksRoutes = require('./routes/marksRoutes');
const prospectRoutes = require('./routes/prospectRoutes'); // <-- FIX: Added this missing import!

// 2. Initialize the Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// 3. Middleware
app.use(cors()); 
app.use(express.json());

// 4. Expose the APIs
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/student/marks', marksRoutes);
app.use('/api/prospect', prospectRoutes); // <-- Now it knows what this is!

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});