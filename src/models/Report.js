const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  /**
   * 1. THE REPORTER
   * Reference to the User model. 
   * Even if a Collector reports an issue, we store their ID here.
   */
  citizen: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'A reporter ID is required'],
  },

  /**
   * 2. REPORT CONTENT
   */
  title: {
    type: String,
    required: [true, 'Please add a title for the report'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },

  description: {
    type: String,
    required: [true, 'Please add a detailed description'],
  },

  /**
   * 3. OPTIONAL EVIDENCE
   * This stores the Cloudinary URL.
   * We set the default to null so it is clearly optional.
   */
  imageUrl: {
    type: String,
    default: null
  },

  /**
   * 4. WORKFLOW STATUS
   * 'open': Newly submitted, not yet viewed by Admin.
   * 'in-review': Admin is investigating the issue.
   * 'resolved': The issue (e.g., illegal dumping) has been cleaned up.
   */
  status: {
    type: String,
    enum: ['open', 'in-review', 'resolved'],
    default: 'open'
  },

  /**
   * 5. TIMESTAMPS
   * Automatically adds 'createdAt' and 'updatedAt' fields.
   */
}, { timestamps: true });

// index by status for faster Admin filtering
reportSchema.index({ status: 1 });

module.exports = mongoose.model('Report', reportSchema);