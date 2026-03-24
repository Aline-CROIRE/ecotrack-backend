const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');
const { registerValidator, loginValidator } = require('../middlewares/validators');

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: User registration and authentication
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user (Citizen, Collector, or Admin)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password, phone]
 *             properties:
 *               name: { type: string }
 *               email: { type: string }
 *               password: { type: string, minLength: 6 }
 *               phone: { type: string }
 *               role: { type: string, enum: [citizen, collector, admin], default: citizen }
 */
router.post('/register', registerValidator, register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user and return JWT token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 */
router.post('/login', loginValidator, login);

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get current logged in user profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Returns user data
 */
router.get('/me', protect, getMe);

module.exports = router;