const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
  request: { type: mongoose.Schema.Types.ObjectId, ref: 'PickupRequest', required: true, unique: true },
  citizen: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  collector: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Rating', ratingSchema);