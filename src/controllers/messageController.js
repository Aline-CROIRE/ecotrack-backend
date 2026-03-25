const Message = require('../models/Message');

// @desc    Send a message
// @route   POST /api/messages
exports.sendMessage = async (req, res) => {
  try {
    const { recipientId, content } = req.body;
    const message = await Message.create({
      sender: req.user.id,
      recipient: recipientId,
      content
    });
    res.status(201).json({ success: true, data: message });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get conversation between two users
// @route   GET /api/messages/:partnerId
exports.getChatRoom = async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.user.id, recipient: req.params.partnerId },
        { sender: req.params.partnerId, recipient: req.user.id }
      ]
    }).sort('createdAt');

    // Mark partner's messages as read when I open the room
    await Message.updateMany(
      { sender: req.params.partnerId, recipient: req.user.id, isRead: false },
      { isRead: true }
    );

    res.json({ success: true, data: messages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get unread counts for Inbox
exports.getUnreadCounts = async (req, res) => {
    try {
        const counts = await Message.aggregate([
            { $match: { recipient: req.user._id, isRead: false } },
            { $group: { _id: "$sender", count: { $sum: 1 } } }
        ]);
        res.json({ success: true, data: counts });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};