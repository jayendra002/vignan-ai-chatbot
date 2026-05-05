const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware'); 

// Send a message (Creates or updates a thread)
router.post('/', protect, chatController.processChatMessage);

// Sidebar Data (Get all chat titles)
router.get('/conversations', protect, chatController.getUserConversations);

// Search inside chats
router.get('/search', protect, chatController.searchConversations);

// Load a specific chat history
router.get('/conversations/:id', protect, chatController.getSingleConversation);

// Load a shared chat (No 'protect' middleware here so anyone with the link can view it!)
router.get('/share/:shareId', chatController.getSharedConversation);

module.exports = router;