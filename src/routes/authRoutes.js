const express = require('express');
const router = express.Router();
const { 
  register, 
  login, 
  getMe, 
  getUsers, 
  updateProfile, 
  updateLiveLocation,
  getAdmins // Added this
} = require('../controllers/authController');

const { protect, authorize } = require('../middlewares/authMiddleware');
const { registerValidator, loginValidator } = require('../middlewares/validators');

/**
 * AUTH ROUTES
 */
router.post('/register', registerValidator, register);
router.post('/login', loginValidator, login);
router.get('/me', protect, getMe);

// Management Routes
router.get('/users', protect, authorize('admin'), getUsers);
router.get('/admins', protect, getAdmins); // Anyone can find admins to chat

// Location & Profile
router.put('/profile', protect, updateProfile); // Line 14 is now safe!
router.put('/location', protect, updateLiveLocation);

module.exports = router;
