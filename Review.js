const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  shareId: {
    type: String,
    unique: true,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  code: {
    type: String,
    required: true,
    maxlength: 20000
  },
  language: {
    type: String,
    required: true,
    default: 'javascript'
  },
  review: {
    summary: String,
    bugs: [{ severity: String, line: String, message: String, suggestion: String }],
    security: [{ severity: String, line: String, message: String, suggestion: String }],
    performance: [{ message: String, suggestion: String }],
    bestPractices: [{ message: String, suggestion: String }],
    score: Number,
    positives: [String]
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 60 * 60 * 24 * 30 // 30 days TTL
  }
});

module.exports = mongoose.model('Review', reviewSchema);
