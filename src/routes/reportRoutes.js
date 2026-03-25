const Report = require('../models/Report');

// @desc    Create new report
// @route   POST /api/reports
exports.createReport = async (req, res) => {
  try {
    // Attach the logged-in user (Citizen OR Collector) to the report
    const reportData = {
      ...req.body,
      citizen: req.user.id // We use the 'citizen' field in the DB as the 'reporter'
    };

    const report = await Report.create(reportData);

    res.status(201).json({
      success: true,
      data: report
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get reports
// @route   GET /api/reports
exports.getReports = async (req, res) => {
  try {
    let query = {};

    // If NOT an admin, only show reports created by the current user
    if (req.user.role !== 'admin') {
      query = { citizen: req.user.id };
    }

    const reports = await Report.find(query)
      .populate('citizen', 'name email role') // Also populate the role
      .sort('-createdAt');

    res.json({ success: true, data: reports });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};