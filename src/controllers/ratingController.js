const Rating = require('../models/Rating');
const PickupRequest = require('../models/PickupRequest');

exports.rateCollector = async (req, res) => {
  try {
    const { requestId, rating, comment } = req.body;

    // Check if request exists and is completed
    const request = await PickupRequest.findById(requestId);
    if (!request || request.status !== 'completed') {
      return res.status(400).json({ message: "Can only rate completed pickups" });
    }

    const newRating = await Rating.create({
      request: requestId,
      citizen: req.user.id,
      collector: request.collector,
      rating,
      comment
    });

    res.status(201).json({ success: true, data: newRating });
  } catch (error) {
    if(error.code === 11000) return res.status(400).json({ message: "You already rated this pickup" });
    res.status(500).json({ success: false, message: error.message });
  }
};