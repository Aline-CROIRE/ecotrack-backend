const Report = require('../models/Report');
const Notification = require('../models/Notification'); // Added this import

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

exports.getReports = async (req, res) => {
  try {
    let query = {};
    if (req.user.role !== 'admin') query = { citizen: req.user.id };

    const reports = await Report.find(query)
      .populate('citizen', 'name email role phone')
      .sort('-createdAt');
    res.json({ success: true, data: reports });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

/**
 * UPGRADED: ADMIN RESOLUTION LOGIC
 * Updates status and notifies the reporter
 */
exports.updateReportStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const report = await Report.findById(req.params.id);

    if (!report) return res.status(404).json({ success: false, message: "Report not found" });

    const oldStatus = report.status;
    report.status = status;
    await report.save();

    // TRIGGER NOTIFICATION: Only if status changed to 'resolved'
    if (status === 'resolved' && oldStatus !== 'resolved') {
      await Notification.create({
        recipient: report.citizen,
        title: "Report Resolved! ✅",
        message: `Your community report "${report.title}" has been successfully resolved by the city admin.`,
        type: 'report'
      });
    }

    res.json({ success: true, message: "Report updated and user notified", data: report });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};