const express = require('express');
const router = express.Router();
const { createReport, getReports } = require('../controllers/reportController');
const { protect, authorize } = require('../middlewares/authMiddleware');
const upload = require('../config/cloudinary');
const upload = require('../config/cloudinary');

/**
 * @swagger
 * tags:
 *   name: Reports
 *   description: Community issue reporting (Illegal dumping, broken bins, etc.)
 *   description: Community issue reporting (Illegal dumping, broken bins, etc.)
 */

/**
 * @swagger
 * /reports:
 *   post:
 *     summary: Submit a new report (Citizen or Collector)
 *     summary: Submit a new report (Citizen or Collector)
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [title, description]
 *             properties:
 *               title: { type: string, example: "Illegal Dumping" }
 *               description: { type: string, example: "Large amount of plastic waste at the corner of 5th Ave." }
 *               image: { type: string, format: binary, description: "Optional evidence photo" }
 *     responses:
 *       201:
 *         description: Report submitted successfully
 *               title: { type: string, example: "Illegal Dumping" }
 *               description: { type: string, example: "Large amount of plastic waste at the corner of 5th Ave." }
 *               image: { type: string, format: binary, description: "Optional evidence photo" }
 *     responses:
 *       201:
 *         description: Report submitted successfully
 */
router.post(
  '/', 
  protect, 
  authorize('citizen', 'collector', 'admin'), 
  upload.single('image'), 
  createReport
);
router.post(
  '/', 
  protect, 
  authorize('citizen', 'collector', 'admin'), 
  upload.single('image'), 
  createReport
);

/**
 * @swagger
 * /reports:
 *   get:
 *     summary: Get reports (Admin sees all, Others see their own)
 *     summary: Get reports (Admin sees all, Others see their own)
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of reports retrieved successfully
 *     responses:
 *       200:
 *         description: List of reports retrieved successfully
 */
router.get(
  '/', 
  protect, 
  authorize('admin', 'citizen', 'collector'), 
  getReports
);

router.get(
  '/', 
  protect, 
  authorize('admin', 'citizen', 'collector'), 
  getReports
);


module.exports = router;
