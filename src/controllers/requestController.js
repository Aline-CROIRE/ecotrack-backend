const PickupRequest = require('../models/PickupRequest');
const User = require('../models/User');

// @desc    Create new pickup request
// @route   POST /api/requests
exports.createRequest = async (req, res) => {
  try {
    const { wasteType, priority, address, scheduledDate } = req.body;
    
    const request = await PickupRequest.create({
      citizen: req.user.id,
      wasteType,
      priority,
      location: { address },
      scheduledDate,
    });

    res.status(201).json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all requests (Admin: All, Citizen: Own, Collector: Assigned)
// @route   GET /api/requests
exports.getRequests = async (req, res) => {
  try {
    let query;
    if (req.user.role === 'admin') {
      query = PickupRequest.find().populate('citizen collector', 'name email phone');
    } else if (req.user.role === 'collector') {
      query = PickupRequest.find({ collector: req.user.id }).populate('citizen', 'name phone');
    } else {
      query = PickupRequest.find({ citizen: req.user.id });
    }

    const requests = await query.sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Assign collector to request (Admin Only)
// @route   PUT /api/requests/:id/assign
exports.assignCollector = async (req, res) => {
  try {
    const { collectorId } = req.body;
    const request = await PickupRequest.findById(req.params.id);

    if (!request) return res.status(404).json({ message: 'Request not found' });

    request.collector = collectorId;
    request.status = 'assigned';
    await request.save();

    res.json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update status (Collector & Admin)
// @route   PUT /api/requests/:id/status
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const request = await PickupRequest.findById(req.params.id);

    if (!request) return res.status(404).json({ message: 'Request not found' });

    request.status = status;
    if (status === 'completed') request.completedAt = Date.now();
    
    await request.save();
    res.json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};