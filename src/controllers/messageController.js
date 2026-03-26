const Message = require('../models/Message');
const mongoose = require('mongoose');

exports.sendMessage = async (req, res) => {
  try {
    const { recipientId, content } = req.body;
    if (!recipientId || !content) return res.status(400).json({ message: "Recipient and content required" });

    const message = await Message.create({
      sender: req.user.id,
      recipient: recipientId,
      content
    });
    res.status(201).json({ success: true, data: message });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

exports.getChatRoom = async (req, res) => {
  try {
    const { partnerId } = req.params;
    
    // SAFETY CHECK: Ensure partnerId is valid
    if (!mongoose.Types.ObjectId.isValid(partnerId)) {
        return res.status(400).json({ message: "Invalid User ID" });
    }

    const messages = await Message.find({
      $or: [
        { sender: req.user.id, recipient: partnerId },
        { sender: partnerId, recipient: req.user.id }
      ]
    }).sort('createdAt');

    res.json({ success: true, data: messages });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

exports.getUnreadCounts = async (req, res) => {
    try {
        const counts = await Message.aggregate([
            { $match: { recipient: new mongoose.Types.ObjectId(req.user.id), isRead: false } },
            { $group: { _id: "$sender", count: { $sum: 1 } } }
        ]);
        res.json({ success: true, data: counts });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};