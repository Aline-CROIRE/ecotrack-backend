const Report = require('../models/Report');

exports.getReports = async (req, res) => {
  try {
    let query = {};
    if (req.user.role !== 'admin') {
      query = { citizen: req.user.id };
    }

    // Populate deeply so Admin can call/email the reporter immediately
    const reports = await Report.find(query)
      .populate('citizen', 'name email role phone')
      .sort('-createdAt');

    res.json({ success: true, data: reports });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateReportStatus = async (req, res) => {
  try {
    const data = await Report.findByIdAndUpdate(
        req.params.id, 
        { status: req.body.status }, 
        { new: true, runValidators: true }
    ).populate('citizen', 'name email phone');
    res.json({ success: true, message: "Report status updated", data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// (Keeping standard createReport...)
exports.createReport = async (req, res) => {
  try {
    const report = await Report.create({
      citizen: req.user.id,
      ...req.body,
      imageUrl: req.file ? req.file.path : null
    });
    res.status(201).json({ success: true, data: report });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};