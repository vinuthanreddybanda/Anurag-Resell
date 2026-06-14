const express = require('express');
const { getOrCreateChat, getUserChats, getChatMessages } = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// All chat endpoints are protected
router.use(protect);

router.route('/')
  .post(getOrCreateChat)
  .get(getUserChats);

router.get('/:chatId/messages', getChatMessages);

module.exports = router;
