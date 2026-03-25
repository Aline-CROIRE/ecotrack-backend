const express = require('express');
const router = express.Router();
const { 
  createRequest, 
  getRequests, 
  getRequest, 
  updateStatus, 
  assignCollector 
} = require('../controllers/requestController');
const { protect, authorize } = require('../middlewares/authMiddleware');
const upload = require('../config/cloudinary');

/**
 * @swagger
 * tags:
 *   name: Requests
 *   description: Waste pickup management
 */

/**
 * @swagger
 * /requests:
 *   post:
 *     summary: Create a pickup request
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
 *               wasteType: { type: string }
 *               priority: { type: string }
 *               address: { type: string }
 *               latitude: { type: string }
 *               longitude: { type: string }
 *               scheduledDate: { type: string }
 *               image: { type: string, format: binary }
 */
router.post('/', protect, authorize('citizen'), upload.single('image'), createRequest);

/**
 * @swagger
 * /requests:
 *   get:
 *     summary: List requests
 *     tags: [Requests]
 *     security:
 *       - bearerAuth: []
 */
router.get('/', protect, getRequests);

/**
 * @swagger
 * /requests/{id}:
 *   get:
 *     summary: Get single request
 *     tags: [Requests]
 *     security:
 *       - bearerAuth: []
 */
router.get('/:id', protect, getRequest);

/**
 * @swagger
 * /requests/{id}/status:
 *   put:
 *     summary: Update status
 *     tags: [Requests]
 *     security:
 *       - bearerAuth: []
 */
router.put('/:id/status', protect, authorize('collector', 'admin'), updateStatus);

/**
 * @swagger
 * /requests/{id}/assign:
 *   put:
 *     summary: Admin manual assign
 *     tags: [Requests]
 *     security:
 *       - bearerAuth: []
 */
router.put('/:id/assign', protect, authorize('admin'), assignCollector);

module.exports = router;