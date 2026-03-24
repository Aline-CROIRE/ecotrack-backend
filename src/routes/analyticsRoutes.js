const express = require('express');
const router = express.Router();
const { getStats, getAdminOverview } = require('../controllers/analyticsController');
const { protect, authorize } = require('../middlewares/authMiddleware');

/**
 * @swagger
 * /analytics/stats:
 *   get:
 *     summary: Get dashboard statistics (User specific)
 *     tags: [Analytics]
 *     security: [{ bearerAuth: [] }]
 */
router.get('/stats', protect, getStats);

/**
 * @swagger
 * /analytics/admin-overview:
 *   get:
 *     summary: Get system-wide statistics (Admin only)
 *     tags: [Analytics]
 *     security: [{ bearerAuth: [] }]
 */
router.get('/admin-overview', protect, authorize('admin'), getAdminOverview);

module.exports = router;