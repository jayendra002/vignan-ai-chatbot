const express = require('express');
const router = express.Router();
const prospectController = require('../controllers/prospectController');
const { protect } = require('../middleware/authMiddleware');

router.post('/analyze', protect, prospectController.analyzeProfile);

module.exports = router;