const express = require('express');
const router = express.Router();
const { createRequest, getRequests, updateStatus } = require('../controllers/requestController');
const { protect, authorize } = require('../middlewares/authMiddleware');
const { requestValidator } = require('../middlewares/validators');

/**
 * @swagger
 * /requests:
 *   post:
 *     summary: Create a request (Citizen)
 *     tags: [Requests]
 *     security: [{ bearerAuth: [] }]
 */
router.post('/', protect, authorize('citizen'), requestValidator, createRequest);

/**
 * @swagger
 * /requests:
 *   get:
 *     summary: Get all requests (Filtered by role)
 *     tags: [Requests]
 *     security: [{ bearerAuth: [] }]
 */
router.get('/', protect, getRequests);

/**
 * @swagger
 * /requests/{id}/status:
 *   put:
 *     summary: Update status (Collector/Admin)
 *     tags: [Requests]
 *     security: [{ bearerAuth: [] }]
 */
router.put('/:id/status', protect, authorize('collector', 'admin'), updateStatus);

module.exports = router;