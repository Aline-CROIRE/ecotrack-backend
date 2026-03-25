const PickupRequest = require('../models/PickupRequest');
const User = require('../models/User');
const Notification = require('../models/Notification');
const mongoose = require('mongoose');

// @desc    Create new pickup request (Citizen Only)
// @route   POST /api/requests
exports.createRequest = async (req, res) => {
  try {
    const { wasteType, priority, address, scheduledDate } = req.body;

    /**
     * 1. SMART ENGINE: Auto-Assignment Logic
     * Find the collector with the least amount of ACTIVE (not completed) tasks.
     */
    const availableCollectors = await User.aggregate([
      { $match: { role: 'collector' } },
      {
        $lookup: {
          from: 'pickuprequests',
          localField: '_id',
          foreignField: 'collector',
          as: 'tasks'
        }
      },
      {
        $addFields: {
          activeTaskCount: {
            $size: {
              $filter: {
                input: "$tasks",
                as: "task",
                cond: { $ne: ["$$task.status", "completed"] }
              }
            }
          }
        }
      },
      { $sort: { activeTaskCount: 1 } }, // Smallest workload first
      { $limit: 1 }
    ]);

    const assignedCollectorId = availableCollectors.length > 0 ? availableCollectors[0]._id : null;

    /**
     * 2. Create the Request
     * Handle the image URL from Cloudinary (passed by Multer middleware)
     */
    const request = await PickupRequest.create({
      citizen: req.user.id,
      wasteType,
      priority,
      location: { address },
      scheduledDate,
      imageUrl: req.file ? req.file.path : null, // Cloudinary URL
      collector: assignedCollectorId,
      status: assignedCollectorId ? 'assigned' : 'pending'
    });

    /**
     * 3. Send Notification to Collector (If assigned)
     */
    if (assignedCollectorId) {
      await Notification.create({
        recipient: assignedCollectorId,
        title: "New Task Assigned",
        message: `You have a new ${wasteType} pickup at ${address}`,
        type: 'assignment'
      });
    }

    res.status(201).json({ success: true, data: request });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all requests (Paginated & Filtered)
// @route   GET /api/requests
exports.getRequests = async (req, res) => {
  try {
    let queryObj = { ...req.query };
    const excludeFields = ['page', 'sort', 'limit', 'fields'];
    excludeFields.forEach(el => delete queryObj[el]);

    // Role-based filtering: Citizens see theirs, Collectors see assigned
    if (req.user.role === 'citizen') queryObj.citizen = req.user.id;
    if (req.user.role === 'collector') queryObj.collector = req.user.id;

    let query = PickupRequest.find(queryObj);

    // Sorting
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;
    
    query = query.skip(skip).limit(limit);

    const requests = await query.populate('citizen collector', 'name phone email');
    const total = await PickupRequest.countDocuments(queryObj);

    res.json({
      success: true,
      count: requests.length,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      },
      data: requests
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single request detail
// @route   GET /api/requests/:id
exports.getRequest = async (req, res) => {
  try {
    const request = await PickupRequest.findById(req.params.id).populate('citizen collector', 'name phone email');
    if (!request) return res.status(404).json({ message: "Request not found" });
    res.json({ success: true, data: request });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update request status (Collector/Admin)
// @route   PUT /api/requests/:id/status
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const request = await PickupRequest.findById(req.params.id);

    if (!request) return res.status(404).json({ message: 'Request not found' });

    // Update status
    request.status = status;
    if (status === 'completed') request.completedAt = Date.now();
    
    await request.save();

    // Notify Citizen of status change
    await Notification.create({
      recipient: request.citizen,
      title: "Pickup Status Update",
      message: `Your pickup request is now: ${status.toUpperCase()}`,
      type: 'status_update'
    });

    res.json({ success: true, data: request });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Manually assign collector (Admin Only)
// @route   PUT /api/requests/:id/assign
exports.assignCollector = async (req, res) => {
  try {
    const { collectorId } = req.body;
    const request = await PickupRequest.findByIdAndUpdate(
      req.params.id,
      { collector: collectorId, status: 'assigned' },
      { new: true }
    );
    res.json({ success: true, data: request });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
