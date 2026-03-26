const Message = require('../models/Message');
const mongoose = require('mongoose');

// @desc    Send a message
exports.sendMessage = async (req, res) => {
  try {
    const { recipientId, content } = req.body;

    // 1. Validation
    if (!recipientId || !content) {
        return res.status(400).json({ success: false, message: "Missing recipient or content" });
    }
    if (!mongoose.Types.ObjectId.isValid(recipientId)) {
        return res.status(400).json({ success: false, message: "Invalid Recipient ID" });
    }

    const message = await Message.create({
      sender: req.user.id,
      recipient: recipientId,
      content
    });

    res.status(201).json({ success: true, data: message });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

// @desc    Get conversation
exports.getChatRoom = async (req, res) => {
  try {
    const { partnerId } = req.params;

    // 2. Validation
    if (!mongoose.Types.ObjectId.isValid(partnerId)) {
        return res.status(400).json({ success: false, message: "Invalid Partner ID" });
    }

    const messages = await Message.find({
      $or: [
        { sender: req.user.id, recipient: partnerId },
        { sender: partnerId, recipient: req.user.id }
      ]
    }).sort('createdAt');

    // Mark as read
    await Message.updateMany(
        { sender: partnerId, recipient: req.user.id, isRead: false },
        { isRead: true }
    );

    res.json({ success: true, data: messages });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

// @desc    Get counts for Inbox
exports.getUnreadCounts = async (req, res) => {
    try {
        const counts = await Message.aggregate([
            { $match: { recipient: new mongoose.Types.ObjectId(req.user.id), isRead: false } },
            { $group: { _id: "$sender", count: { $sum: 1 } } }
        ]);
        res.json({ success: true, data: counts });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};
