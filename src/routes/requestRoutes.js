const express = require('express');
const router = express.Router();
const { 
  createRequest, 
  getRequests, 
  assignCollector, 
  updateStatus 
} = require('../controllers/requestController');
const { protect, authorize } = require('../middlewares/authMiddleware');

/**
 * @swagger
 * /requests:
 *   post:
 *     summary: Create a new pickup request (Citizen)
 *     tags: [Requests]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               wasteType: { type: string, enum: [organic, plastic, paper, metal, electronic, other] }
 *               priority: { type: string, enum: [low, medium, high] }
 *               address: { type: string }
 *               scheduledDate: { type: string, format: date-time }
 */
router.post('/', protect, authorize('citizen'), createRequest);

/**
 * @swagger
 * /requests:
 *   get:
 *     summary: Get requests based on user role
 *     tags: [Requests]
 *     security: [{ bearerAuth: [] }]
 */
router.get('/', protect, getRequests);

/**
 * @swagger
 * /requests/{id}/assign:
 *   put:
 *     summary: Assign a collector to a request (Admin)
 *     tags: [Requests]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 */
router.put('/:id/assign', protect, authorize('admin'), assignCollector);

/**
 * @swagger
 * /requests/{id}/status:
 *   put:
 *     summary: Update request status (Collector/Admin)
 *     tags: [Requests]
 *     security: [{ bearerAuth: [] }]
 */
router.put('/:id/status', protect, authorize('collector', 'admin'), updateStatus);

module.exports = router;