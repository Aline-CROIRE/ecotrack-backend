const Report = require('../models/Report');

exports.createReport = async (req, res) => {
  try {
    const report = await Report.create({
      citizen: req.user.id,
      ...req.body
    });
    res.status(201).json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getReports = async (req, res) => {
  try {
    let query = {};

    // If NOT an admin, only show reports created by this user
    if (req.user.role !== 'admin') {
      query = { citizen: req.user.id };
    }

    const reports = await Report.find(query)
      .populate('citizen', 'name email')
      .sort('-createdAt');

    res.json({ success: true, data: reports });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};