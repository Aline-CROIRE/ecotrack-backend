const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'Please add a name'] 
  },
  email: { 
    type: String, 
    required: [true, 'Please add an email'], 
    unique: true 
  },
  password: { 
    type: String, 
    required: [true, 'Please add a password'], 
    select: false 
  },
  role: { 
    type: String, 
    enum: ['citizen', 'collector', 'admin'], 
    default: 'citizen' 
  },
  phone: { 
    type: String, 
    required: [true, 'Please add a phone number'] 
  },
  pushToken: { 
    type: String, 
    default: null 
  },
  /**
   * NEW: AVATAR URL
   * Stores the Cloudinary link for the user's profile photo
   */
  avatarUrl: {
    type: String,
    default: null
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
});

// Encrypt password
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);