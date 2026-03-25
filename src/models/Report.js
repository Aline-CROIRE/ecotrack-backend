const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  /**
   * The User who reported the issue (Citizen or Collector)
   */
  citizen: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Reporter ID is required'],
  },

  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
  },

  description: {
    type: String,
    required: [true, 'Please add a description'],
  },

  /**
   * Evidence photo from Cloudinary (Optional)
   */
  imageUrl: {
    type: String,
    default: null,
  },

  status: {
    type: String,
    enum: ['open', 'in-review', 'resolved'],
    default: 'open',
  },
}, { 
  timestamps: true // This automatically adds createdAt and updatedAt
});

// Index to make searching by status faster for Admins
reportSchema.index({ status: 1 });

module.exports = mongoose.model('Report', reportSchema);