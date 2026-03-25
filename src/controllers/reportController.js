const Report = require('../models/Report');

/**
 * @desc    Create a new community report (Citizen or Collector)
 * @route   POST /api/reports
 * @access  Private
 */
exports.createReport = async (req, res) => {
  try {
    const { title, description } = req.body;

    // 1. Validate required fields
    if (!title || !description) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide both a title and description' 
      });
    }

    /**
     * 2. Handle Optional Image
     * 'req.file' is populated by Multer/Cloudinary middleware.
     * If no file is uploaded, 'req.file' is undefined, so we set imageUrl to null.
     */
    const imageUrl = req.file ? req.file.path : null;

    // 3. Create the report in the database
    const report = await Report.create({
      citizen: req.user.id, // We use the 'citizen' field as the 'reporter'
      title,
      description,
      imageUrl,
      status: 'open' // Default status for new reports
    });

    res.status(201).json({
      success: true,
      message: 'Report submitted successfully',
      data: report
    });
  } catch (error) {
    console.error('REPORT_CREATE_ERROR:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error while submitting report',
      error: error.message
    });
  }
};

/**
 * @desc    Get all reports (Role-based filtering)
 * @route   GET /api/reports
 * @access  Private
 */
exports.getReports = async (req, res) => {
  try {
    let query = {};

    /**
     * 4. Smart Filtering
     * ADMIN: Can see ALL reports from everyone.
     * CITIZEN/COLLECTOR: Can only see the reports THEY created.
     */
    if (req.user.role !== 'admin') {
      query = { citizen: req.user.id };
    }

    const reports = await Report.find(query)
      .populate('citizen', 'name email role') // Show reporter details
      .sort('-createdAt'); // Newest first

    res.json({
      success: true,
      count: reports.length,
      data: reports
    });
  } catch (error) {
    console.error('REPORT_GET_ERROR:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching reports'
    });
  }
};

/**
 * @desc    Update report status (Admin Only)
 * @route   PUT /api/reports/:id/status
 * @access  Private/Admin
 */
exports.updateReportStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    // Only allow valid statuses
    const validStatuses = ['open', 'in-review', 'resolved'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const report = await Report.findByIdAndUpdate(
      req.params.id, 
      { status }, 
      { new: true, runValidators: true }
    );

    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    res.json({
      success: true,
      message: 'Report status updated',
      data: report
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
