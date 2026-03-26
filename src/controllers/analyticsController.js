const PickupRequest = require('../models/PickupRequest');
const User = require('../models/User');
const mongoose = require('mongoose');

// @desc    Get Stats for Dashboards (User specific)
exports.getStats = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    let matchStage = {};
    if (req.user.role === 'citizen') matchStage = { citizen: userId };
    else if (req.user.role === 'collector') matchStage = { collector: userId };

    const statusStats = await PickupRequest.aggregate([
      { $match: matchStage },
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    const wasteTypeStats = await PickupRequest.aggregate([
      { $match: matchStage },
      { $group: { _id: "$wasteType", count: { $sum: 1 } } }
    ]);

    res.json({
      statusStats,
      wasteTypeStats,
      summary: { total: statusStats.reduce((acc, curr) => acc + curr.count, 0) }
    });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

/**
 * NEW: ADMIN GOD-MODE OVERVIEW
 * Calculates City Heatmap points and Collector Efficiency
 */
exports.getAdminOverview = async (req, res) => {
  try {
    // 1. SYSTEM TOTALS
    const totalUsers = await User.countDocuments();
    const totalRequests = await PickupRequest.countDocuments();
    
    // 2. CITY HEATMAP DATA
    // Returns latitude/longitude of all non-completed requests
    const heatmapData = await PickupRequest.find(
      { status: { $ne: 'completed' } },
      'location.coordinates wasteType priority'
    );

    // 3. COLLECTOR EFFICIENCY RANKING
    // Joins users with their completed tasks to calculate performance
    const collectorRankings = await User.aggregate([
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
        $project: {
          name: 1,
          email: 1,
          completedCount: {
            $size: { $filter: { input: "$tasks", as: "t", cond: { $eq: ["$$t.status", "completed"] } } }
          },
          pendingCount: {
            $size: { $filter: { input: "$tasks", as: "t", cond: { $ne: ["$$t.status", "completed"] } } }
          }
        }
      },
      { $sort: { completedCount: -1 } }
    ]);

    res.json({
      success: true,
      totals: { users: totalUsers, requests: totalRequests },
      heatmap: heatmapData,
      rankings: collectorRankings
    });
  } catch (error) { res.status(500).json({ message: error.message }); }
};