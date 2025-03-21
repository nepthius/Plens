const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  searchHistory: [{
    query: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    results: [{
      name: String,
      risk: String,
      high: [String],
      med: [String],
      timestamp: Date
    }]
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', userSchema); 