const express = require('express');
const router = express.Router();
const { createReport, getReports } = require('../controllers/reportController');
const { protect, authorize } = require('../middlewares/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Reports
 *   description: Illegal dumping or system issue reports
 */

/**
 * @swagger
 * /reports:
 *   post:
 *     summary: Submit a new report (Citizen)
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, description]
 *             properties:
 *               title: { type: string }
 *               description: { type: string }
 */
router.post('/', protect, authorize('citizen'), createReport);

/**
 * @swagger
 * /reports:
 *   get:
 *     summary: View all reports (Admin only)
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 */
router.get('/', protect, authorize('admin', 'citizen', 'collector'), getReports);

module.exports = router;