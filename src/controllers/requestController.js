const PickupRequest = require('../models/PickupRequest');

// @desc    Create Request
exports.createRequest = async (req, res) => {
  try {
    const { wasteType, priority, address, scheduledDate } = req.body;

    // SMART LOGIC: Find a collector with the least amount of active tasks
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
          // Count only tasks that are NOT completed
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
      { $sort: { activeTaskCount: 1 } }, // Get collector with least tasks
      { $limit: 1 }
    ]);

    const assignedCollectorId = availableCollectors.length > 0 ? availableCollectors[0]._id : null;

    const request = await PickupRequest.create({
      citizen: req.user.id,
      wasteType,
      priority,
      location: { address },
      scheduledDate,
      imageUrl: req.file ? req.file.path : null,
      collector: assignedCollectorId,
      status: assignedCollectorId ? 'assigned' : 'pending'
    });

    res.status(201).json({ success: true, data: request });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get All Requests with Advanced Querying (Pagination/Sorting/Filtering)
exports.getRequests = async (req, res) => {
  try {
    // 1. ADVANCED FILTERING
    const queryObj = { ...req.query };
    const excludeFields = ['page', 'sort', 'limit', 'fields'];
    excludeFields.forEach(el => delete queryObj[el]);

    // Role-based constraints (Citizens only see theirs, Collectors only see theirs)
    if (req.user.role === 'citizen') queryObj.citizen = req.user.id;
    if (req.user.role === 'collector') queryObj.collector = req.user.id;

    // Support for searching wasteType or status via query params
    let query = PickupRequest.find(queryObj);

    // 2. SORTING
    // Example: ?sort=-createdAt (Newest first)
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }

    // 3. PAGINATION
    // Example: ?page=2&limit=5
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    query = query.skip(skip).limit(limit);

    // 4. EXECUTE
    const requests = await query.populate('citizen collector', 'name phone');
    const total = await PickupRequest.countDocuments(queryObj);

    res.json({
      success: true,
      count: requests.length,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
      },
      data: requests,
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