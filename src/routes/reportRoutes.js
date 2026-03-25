const express = require('express');
const router = express.Router();
const { createReport, getReports } = require('../controllers/reportController');
const { protect, authorize } = require('../middlewares/authMiddleware');
const upload = require('../config/cloudinary');

/**
 * @swagger
 * tags:
 *   name: Reports
 *   description: Community issue reporting
 */

/**
 * @swagger
 * /reports:
 *   post:
 *     summary: Submit a new report
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title: { type: string }
 *               description: { type: string }
 *               image: { type: string, format: binary }
 *     responses:
 *       201:
 *         description: Created successfully
 */
router.post('/', protect, authorize('citizen', 'collector', 'admin'), upload.single('image'), createReport);

/**
 * @swagger
 * /reports:
 *   get:
 *     summary: Get all reports
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/', protect, authorize('admin', 'citizen', 'collector'), getReports);

module.exports = router;