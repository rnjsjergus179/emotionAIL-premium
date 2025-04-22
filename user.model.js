const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  subscribed: {
    type: Boolean,
    default: false
  },
  startDate: {
    type: Date
  },
  expiresAt: {
    type: Date
  }
});

const User = mongoose.model('User', userSchema);

module.exports = User;
