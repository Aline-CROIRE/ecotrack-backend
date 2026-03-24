const mongoose = require('mongoose');

const pickupRequestSchema = new mongoose.Schema({
  citizen: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  wasteType: {
    type: String,
    enum: ['organic', 'plastic', 'paper', 'metal', 'electronic', 'other'],
    required: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'low'
  },
  location: {
    address: { type: String, required: true },
    latitude: { type: Number },
    longitude: { type: Number }
  },
  status: {
    type: String,
    enum: ['pending', 'assigned', 'in-progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  collector: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  scheduledDate: {
    type: Date,
    required: true
  },
  completedAt: {
    type: Date
  }
}, { timestamps: true });

module.exports = mongoose.model('PickupRequest', pickupRequestSchema);