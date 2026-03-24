const express = require('express');
const router = express.Router();
const { rateCollector } = require('../controllers/ratingController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.post('/', protect, authorize('citizen'), rateCollector);

module.exports = router;