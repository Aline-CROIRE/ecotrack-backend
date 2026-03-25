const express = require('express');
const router = express.Router();
const { sendMessage, getChatRoom, getUnreadCounts } = require('../controllers/messageController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/', protect, sendMessage);
router.get('/unread', protect, getUnreadCounts);
router.get('/:partnerId', protect, getChatRoom);

module.exports = router;