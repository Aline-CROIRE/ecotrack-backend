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
  /**
   * UPGRADED LOCATION FIELD
   * Stores both the readable address AND the physical GPS coordinates
   */
  location: {
    address: { type: String, required: true },
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude] - MongoDB order
      required: true
    }
  },
  status: {
    type: String,
    enum: ['pending', 'assigned', 'in-progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  imageUrl: { type: String },
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

// Index for Geospatial queries (allows "find nearby collectors")
pickupRequestSchema.index({ location: "2dsphere" });

module.exports = mongoose.model('PickupRequest', pickupRequestSchema);