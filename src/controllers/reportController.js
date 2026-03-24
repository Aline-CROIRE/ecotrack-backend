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
    const reports = await Report.find().populate('citizen', 'name email');
    res.json({ success: true, data: reports });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};