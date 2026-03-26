const express = require('express');
const router = express.Router();
const { 
  register, login, getMe, getUsers, updateProfile, updateLiveLocation 
} = require('../controllers/authController');
const { protect, authorize } = require('../middlewares/authMiddleware');
const { registerValidator, loginValidator } = require('../middlewares/validators');

router.post('/register', registerValidator, register);
router.post('/login', loginValidator, login);
router.get('/me', protect, getMe);
router.get('/users', protect, authorize('admin'), getUsers);
router.put('/profile', protect, updateProfile);
router.put('/location', protect, updateLiveLocation);

/**
 * NEW: Admin Discovery
 * Allows any user to find the Admin's ID for support chat
 */
router.get('/admins', protect, async (req, res) => {
    try {
        const User = require('../models/User');
        const admins = await User.find({ role: 'admin' }).select('name role email phone');
        res.json({ success: true, data: admins });
    } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;
