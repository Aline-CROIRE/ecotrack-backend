const express = require('express');
const router = express.Router();
const { createRequest, getRequests, updateStatus, assignCollector } = require('../controllers/requestController');
const { protect, authorize } = require('../middlewares/authMiddleware');
const { requestValidator } = require('../middlewares/validators');
const upload = require('../config/cloudinary');

/**
 * @swagger
 * tags:
 *   name: Requests
 *   description: Waste pickup request management
 */

/**
 * @swagger
 * /requests:
 *   post:
 *     summary: Create a new waste pickup (Citizen) - Triggers Auto-Assignment
 *     tags: [Requests]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               wasteType: { type: string, enum: [organic, plastic, paper, metal, electronic, other] }
 *               priority: { type: string, enum: [low, medium, high] }
 *               address: { type: string }
 *               scheduledDate: { type: string, format: date-time }
 *               image: { type: string, format: binary, description: "Waste photo to upload" }
 */
router.post('/', protect, authorize('citizen'), upload.single('image'), requestValidator, createRequest);

/**
 * @swagger
 * /requests:
 *   get:
 *     summary: Get requests with Pagination/Filtering (Citizen:Own, Collector:Assigned, Admin:All)
 *     tags: [Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [pending, assigned, in-progress, completed] }
 *       - in: query
 *         name: sort
 *         description: "Example: -createdAt (newest) or createdAt (oldest)"
 */
router.get('/', protect, getRequests);

/**
 * @swagger
 * /requests/{id}/status:
 *   put:
 *     summary: Update request status (Collector or Admin)
 *     tags: [Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status: { type: string, enum: [in-progress, completed, cancelled] }
 */
router.put('/:id/status', protect, authorize('collector', 'admin'), updateStatus);

module.exports = router;