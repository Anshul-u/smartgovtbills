const express = require('express');
const router = express.Router();
const { protect, optionalProtect } = require('../middlewares/authMiddleware');
const { chat, getChatHistory } = require('../controllers/aiController');

// Chat can work with or without auth
router.post('/chat', optionalProtect, chat);
router.get('/history', protect, getChatHistory);

module.exports = router;
