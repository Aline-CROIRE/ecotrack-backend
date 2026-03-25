const PickupRequest = require('../models/PickupRequest');
const User = require('../models/User');
const Notification = require('../models/Notification');

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
      wasteType,
      priority,
      location: {
        address,
        type: 'Point',
        coordinates: [parseFloat(longitude || 0), parseFloat(latitude || 0)]
      },
      scheduledDate,
      imageUrl: req.file ? req.file.path : null,
      collector: collectorId,
      status: collectorId ? 'assigned' : 'pending'
    });

    if (collectorId) {
      await Notification.create({
        recipient: collectorId,
        title: "New Location Assigned",
        message: `New pickup point at ${address}`,
        type: 'assignment'
      });
    }

    res.status(201).json({ success: true, data: request });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getRequests = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'citizen') query.citizen = req.user.id;
    if (req.user.role === 'collector') query.collector = req.user.id;

    const data = await PickupRequest.find(query).populate('citizen collector', 'name phone').sort('-createdAt');
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getRequest = async (req, res) => {
  try {
    const data = await PickupRequest.findById(req.params.id).populate('citizen collector', 'name phone');
    if (!data) return res.status(404).json({ message: "Not found" });
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const data = await PickupRequest.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.assignCollector = async (req, res) => {
  try {
    const data = await PickupRequest.findByIdAndUpdate(req.params.id, { collector: req.body.collectorId, status: 'assigned' }, { new: true });
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};