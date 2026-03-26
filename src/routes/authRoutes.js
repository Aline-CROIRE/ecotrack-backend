const express = require('express');
const router = express.Router();
const { 
  register, 
  login, 
  getMe, 
  getUsers, 
  updateProfile, 
  updateLiveLocation,
  getAdmins
} = require('../controllers/authController');

const { protect, authorize } = require('../middlewares/authMiddleware');
const { registerValidator, loginValidator } = require('../middlewares/validators');
const upload = require('../config/cloudinary'); // IMPORT CLOUDINARY

/**
 * AUTH ROUTES
 */
router.post('/register', registerValidator, register);
router.post('/login', loginValidator, login);
router.get('/me', protect, getMe);

// Management
router.get('/users', protect, authorize('admin'), getUsers);
router.get('/admins', protect, getAdmins);

// Profile Update with Optional Image
// 'image' must match the key used in the Mobile FormData
router.put('/profile', protect, upload.single('image'), updateProfile);

// Real-time Logistics
router.put('/location', protect, updateLiveLocation);

module.exports = router;