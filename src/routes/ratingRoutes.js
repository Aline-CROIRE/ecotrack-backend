const express = require('express');
const router = express.Router();
const { rateCollector } = require('../controllers/ratingController');
const { protect, authorize } = require('../middlewares/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Ratings
 *   description: Citizen feedback on collectors
 */

/**
 * @swagger
 * /ratings:
 *   post:
 *     summary: Rate a collector after a completed pickup (Citizen)
 *     tags: [Ratings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [requestId, rating]
 *             properties:
 *               requestId: { type: string }
 *               rating: { type: number, minimum: 1, maximum: 5 }
 *               comment: { type: string }
 */
router.post('/', protect, authorize('citizen'), rateCollector);

module.exports = router;