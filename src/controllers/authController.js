const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// @desc    Register user
exports.register = async (req, res) => {
  try {
    const { name, email, password, role, phone } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });
    const user = await User.create({ name, email, password, role, phone });
    res.status(201).json({ _id: user._id, name: user.name, email: user.email, role: user.role, token: generateToken(user._id) });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

// @desc    Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (user && (await user.matchPassword(password))) {
      res.json({ _id: user._id, name: user.name, email: user.email, role: user.role, token: generateToken(user._id) });
    } else { res.status(401).json({ message: 'Invalid email or password' }); }
  } catch (error) { res.status(500).json({ message: error.message }); }
};

// @desc    Get current user
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json(user);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

// @desc    Get all users (Admin only)
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json({ success: true, data: users });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

// @desc    Update profile info
exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.user.id, req.body, { new: true, runValidators: true });
    res.json({ success: true, data: user });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

// @desc    Update live GPS (Collectors)
exports.updateLiveLocation = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    await User.findByIdAndUpdate(req.user.id, {
      currentLocation: {
        type: 'Point',
        coordinates: [parseFloat(longitude), parseFloat(latitude)]
      }
    });
    res.json({ success: true });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

// @desc    Get all Admins for chat discovery
exports.getAdmins = async (req, res) => {
    try {
        const admins = await User.find({ role: 'admin' }).select('name role email phone');
        res.json({ success: true, data: admins });
    } catch (e) { res.status(500).json({ message: e.message }); }
};
