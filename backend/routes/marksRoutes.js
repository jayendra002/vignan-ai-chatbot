const express = require('express');
const router = express.Router();
const marksController = require('../controllers/marksController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, marksController.submitMarks);

module.exports = router;