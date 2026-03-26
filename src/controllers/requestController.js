const PickupRequest = require('../models/PickupRequest');
const User = require('../models/User');
const Notification = require('../models/Notification');

// @desc    Get all requests (Admin: All | Others: Own)
exports.getRequests = async (req, res) => {
  try {
    let query = {};
    if (req.user.role !== 'admin') {
      if (req.user.role === 'citizen') query.citizen = req.user.id;
      if (req.user.role === 'collector') query.collector = req.user.id;
    }

    // High-Level Population: Include role and phone for Admin control
    const data = await PickupRequest.find(query)
      .populate('citizen collector', 'name phone email role')
      .sort('-createdAt');

    res.json({ success: true, count: data.length, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Admin: Manually Re-assign Collector
exports.assignCollector = async (req, res) => {
  try {
    const { collectorId } = req.body;
    const request = await PickupRequest.findById(req.params.id);

    if (!request) return res.status(404).json({ success: false, message: "Request not found" });

    request.collector = collectorId;
    request.status = 'assigned';
    await request.save();

    // Mission Control Notification
    await Notification.create({
      recipient: collectorId,
      title: "🚨 ADMIN ASSIGNMENT",
      message: `Administrator has manually assigned you a task at ${request.location.address}`,
      type: 'assignment'
    });

    res.json({ success: true, message: "Task re-assigned successfully", data: request });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Standard Update Status
exports.updateStatus = async (req, res) => {
  try {
    const data = await PickupRequest.findByIdAndUpdate(
        req.params.id, 
        { status: req.body.status }, 
        { new: true }
    ).populate('citizen collector', 'name phone email role');
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// (Keeping standard createRequest logic...)
exports.createRequest = async (req, res) => {
  try {
    const { wasteType, priority, address, scheduledDate, latitude, longitude } = req.body;
    const availableCollectors = await User.aggregate([
      { $match: { role: 'collector' } },
      { $lookup: { from: 'pickuprequests', localField: '_id', foreignField: 'collector', as: 'tasks' } },
      { $addFields: { activeTaskCount: { $size: { $filter: { input: "$tasks", as: "t", cond: { $ne: ["$$t.status", "completed"] } } } } } },
      { $sort: { activeTaskCount: 1 } },
      { $limit: 1 }
    ]);
    const collectorId = availableCollectors.length > 0 ? availableCollectors[0]._id : null;
    const request = await PickupRequest.create({
      citizen: req.user.id,
      wasteType, priority,
      location: { address, type: 'Point', coordinates: [parseFloat(longitude || 0), parseFloat(latitude || 0)] },
      scheduledDate, imageUrl: req.file ? req.file.path : null,
      collector: collectorId, status: collectorId ? 'assigned' : 'pending'
    });
    res.status(201).json({ success: true, data: request });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

exports.getRequest = async (req, res) => {
  try {
    const data = await PickupRequest.findById(req.params.id).populate('citizen collector', 'name phone email role');
    res.json({ success: true, data });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};