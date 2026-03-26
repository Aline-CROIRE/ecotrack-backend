const PickupRequest = require('../models/PickupRequest');
const User = require('../models/User');
const mongoose = require('mongoose');

exports.getStats = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    let matchStage = {};
    if (req.user.role === 'citizen') matchStage = { citizen: userId };
    else if (req.user.role === 'collector') matchStage = { collector: userId };

    // 1. Distribution by Type
    const wasteTypeStats = await PickupRequest.aggregate([
      { $match: matchStage },
      { $group: { _id: "$wasteType", count: { $sum: 1 } } }
    ]);

    // 2. MONTHLY TREND LOGIC (Last 6 Months)
    const monthlyTrend = await PickupRequest.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: { month: { $month: "$createdAt" }, year: { $year: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": -1, "_id.month": -1 } },
      { $limit: 6 }
    ]);

    res.json({
      success: true,
      wasteTypeStats,
      monthlyTrend: monthlyTrend.reverse(), // Show chronologically
      summary: { total: wasteTypeStats.reduce((acc, curr) => acc + curr.count, 0) }
    });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.getAdminOverview = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalRequests = await PickupRequest.countDocuments();
    const heatmap = await PickupRequest.find({ status: { $ne: 'completed' } }, 'location.coordinates priority');

    // 3. CITY-WIDE MONTHLY TREND
    const cityTrend = await PickupRequest.aggregate([
      {
        $group: {
          _id: { month: { $month: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.month": 1 } }
    ]);

    const rankings = await User.aggregate([
      { $match: { role: 'collector' } },
      { $lookup: { from: 'pickuprequests', localField: '_id', foreignField: 'collector', as: 'tasks' } },
      { $project: { name: 1, completedCount: { $size: { $filter: { input: "$tasks", as: "t", cond: { $eq: ["$$t.status", "completed"] } } } }, pendingCount: { $size: { $filter: { input: "$tasks", as: "t", cond: { $ne: ["$$t.status", "completed"] } } } } } },
      { $sort: { completedCount: -1 } }
    ]);

    res.json({ success: true, totals: { users: totalUsers, requests: totalRequests }, heatmap, rankings, cityTrend });
  } catch (error) { res.status(500).json({ message: error.message }); }
};
