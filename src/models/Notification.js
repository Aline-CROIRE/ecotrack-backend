const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  /**
   * TYPE ENUM
   * status_update: Request status changes
   * assignment: New task for collectors
   * report: Incident resolution alerts (NEW)
   */
  type: { 
    type: String, 
    enum: ['status_update', 'assignment', 'report'], 
    default: 'status_update' 
  },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', notificationSchema);