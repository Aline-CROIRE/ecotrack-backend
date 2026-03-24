const PickupRequest = require('../models/PickupRequest');
const User = require('../models/User');
const mongoose = require('mongoose');

// @desc    Get Stats for Dashboards (Role-based)
// @route   GET /api/analytics/stats
exports.getStats = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    let matchStage = {};

    // Filter data based on role
    if (req.user.role === 'citizen') {
      matchStage = { citizen: userId };
    } else if (req.user.role === 'collector') {
      matchStage = { collector: userId };
    }

    // 1. Total Counts by Status
    const statusStats = await PickupRequest.aggregate([
      { $match: matchStage },
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    // 2. Waste Type Distribution (Pie Chart data)
    const wasteTypeStats = await PickupRequest.aggregate([
      { $match: matchStage },
      { $group: { _id: "$wasteType", count: { $sum: 1 } } }
    ]);

    // 3. Monthly Trend (Line Chart data - Last 6 months)
    const trendStats = await PickupRequest.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: { $month: "$createdAt" },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    res.json({
      statusStats,
      wasteTypeStats,
      trendStats,
      summary: {
        total: statusStats.reduce((acc, curr) => acc + curr.count, 0),
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Admin Only: System-wide Overview
// @route   GET /api/analytics/admin-overview
exports.getAdminOverview = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalRequests = await PickupRequest.countDocuments();
    const pendingRequests = await PickupRequest.countDocuments({ status: 'pending' });
    
    // Active collectors
    const activeCollectors = await User.countDocuments({ role: 'collector' });

    res.json({
      totalUsers,
      totalRequests,
      pendingRequests,
      activeCollectors
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};