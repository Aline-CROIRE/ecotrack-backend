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
      wasteType, priority,
      location: { address, type: 'Point', coordinates: [parseFloat(longitude || 0), parseFloat(latitude || 0)] },
      scheduledDate, imageUrl: req.file ? req.file.path : null,
      collector: collectorId, status: collectorId ? 'assigned' : 'pending'
    });

    if (collectorId) {
        await Notification.create({
            recipient: collectorId,
            title: "New Location Assigned",
            message: `New pickup point at ${address}`,
            relatedId: request._id, // LINKED ID
            type: 'assignment'
        });
    }

    res.status(201).json({ success: true, data: request });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const request = await PickupRequest.findByIdAndUpdate(req.params.id, { status }, { new: true });
    
    // Notify Citizen of status change
    await Notification.create({
        recipient: request.citizen,
        title: "Mission Update",
        message: `Your pickup is now: ${status.toUpperCase()}`,
        relatedId: request._id, // LINKED ID
        type: 'status_update'
    });

    res.json({ success: true, data: request });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

// ... keep getRequests and getRequest the same
exports.getRequests = async (req, res) => {
  try {
    let query = {};
    if (req.user.role !== 'admin') {
      if (req.user.role === 'citizen') query.citizen = req.user.id;
      if (req.user.role === 'collector') query.collector = req.user.id;
    }
    const data = await PickupRequest.find(query).populate('citizen collector', 'name phone email role').sort('-createdAt');
    res.json({ success: true, data });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

exports.getRequest = async (req, res) => {
  try {
    const data = await PickupRequest.findById(req.params.id).populate('citizen collector', 'name phone email role');
    res.json({ success: true, data });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

exports.assignCollector = async (req, res) => {
  try {
    const data = await PickupRequest.findByIdAndUpdate(req.params.id, { collector: req.body.collectorId, status: 'assigned' }, { new: true });
    await Notification.create({
        recipient: req.body.collectorId,
        title: "🚨 ADMIN ASSIGNMENT",
        message: `Task manually assigned at ${data.location.address}`,
        relatedId: data._id, // LINKED ID
        type: 'assignment'
    });
    res.json({ success: true, data });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};