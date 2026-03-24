const express = require('express');
const router = express.Router();
const { getStats, getAdminOverview, getCollectorPerformance } = require('../controllers/analyticsController');
const { protect, authorize } = require('../middlewares/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Analytics
 *   description: Dashboard and performance statistics
 */

/**
 * @swagger
 * /analytics/stats:
 *   get:
 *     summary: Get chart-ready stats for personal dashboard
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 */
router.get('/stats', protect, getStats);

/**
 * @swagger
 * /analytics/admin-overview:
 *   get:
 *     summary: Get high-level system stats (Admin only)
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 */
router.get('/admin-overview', protect, authorize('admin'), getAdminOverview);

module.exports = router;