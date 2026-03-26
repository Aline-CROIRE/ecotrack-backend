const PickupRequest = require('../models/PickupRequest');
const User = require('../models/User');
const Rating = require('../models/Rating'); // Ensure this model is imported
const mongoose = require('mongoose');

// @desc    Get Stats for Dashboards (User specific)
exports.getStats = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    let matchStage = { citizen: userId };
    if (req.user.role === 'collector') matchStage = { collector: userId };

    const wasteTypeStats = await PickupRequest.aggregate([
      { $match: matchStage },
      { $group: { _id: "$wasteType", count: { $sum: 1 } } }
    ]);

    const monthlyTrend = await PickupRequest.aggregate([
      { $match: matchStage },
      { $group: { _id: { month: { $month: "$createdAt" } }, count: { $sum: 1 } } },
      { $sort: { "_id.month": 1 } }
    ]);

    res.json({
      success: true,
      wasteTypeStats,
      monthlyTrend,
      summary: { total: wasteTypeStats.reduce((acc, curr) => acc + curr.count, 0) }
    });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

/**
 * UPGRADED: ADMIN GOD-MODE OVERVIEW
 * Includes Average Rating calculation for every collector
 */
exports.getAdminOverview = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalRequests = await PickupRequest.countDocuments();
    const heatmap = await PickupRequest.find({ status: { $ne: 'completed' } }, 'location.coordinates priority');

    const collectorRankings = await User.aggregate([
      { $match: { role: 'collector' } },
      // 1. Join with requests to get counts
      {
        $lookup: {
          from: 'pickuprequests',
          localField: '_id',
          foreignField: 'collector',
          as: 'tasks'
        }
      },
      // 2. Join with ratings to calculate average score
      {
        $lookup: {
          from: 'ratings',
          localField: '_id',
          foreignField: 'collector',
          as: 'allRatings'
        }
      },
      {
        $project: {
          name: 1,
          email: 1,
          phone: 1,
          completedCount: {
            $size: { $filter: { input: "$tasks", as: "t", cond: { $eq: ["$$t.status", "completed"] } } }
          },
          pendingCount: {
            $size: { $filter: { input: "$tasks", as: "t", cond: { $ne: ["$$t.status", "completed"] } } }
          },
          // CALCULATE AVERAGE STAR RATING
          averageRating: { $avg: "$allRatings.rating" }
        }
      },
      { $sort: { averageRating: -1, completedCount: -1 } }
    ]);

    res.json({
      success: true,
      totals: { users: totalUsers, requests: totalRequests },
      heatmap,
      rankings: collectorRankings // Now includes averageRating!
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
