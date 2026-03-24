const PickupRequest = require('../models/PickupRequest');

// @desc    Create Request
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
    res.status(201).json({ success: true, data: request });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get All Requests with Advanced Querying (Pagination/Sorting/Filtering)
exports.getRequests = async (req, res) => {
  try {
    // A. Filtering
    let queryObj = { ...req.query };
    const excludeFields = ['page', 'sort', 'limit', 'fields'];
    excludeFields.forEach(el => delete queryObj[el]);

    // Role-based Access Control
    if (req.user.role === 'citizen') queryObj.citizen = req.user.id;
    if (req.user.role === 'collector') queryObj.collector = req.user.id;

    let query = PickupRequest.find(queryObj);

    // B. Sorting
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }

    // C. Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;
    
    query = query.skip(skip).limit(limit);

    // D. Execution
    const requests = await query.populate('citizen collector', 'name phone');
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

// @desc    Update Status
exports.updateStatus = async (req, res) => {
    try {
      const request = await PickupRequest.findByIdAndUpdate(
        req.params.id, 
        { status: req.body.status }, 
        { new: true, runValidators: true }
      );
      if (!request) return res.status(404).json({ message: 'Request not found' });
      res.json({ success: true, data: request });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
};