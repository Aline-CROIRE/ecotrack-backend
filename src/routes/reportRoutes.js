const express = require('express');
const router = express.Router();
const { createReport, getReports } = require('../controllers/reportController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.post('/', protect, authorize('citizen'), createReport);
router.get('/', protect, authorize('admin'), getReports);

module.exports = router;