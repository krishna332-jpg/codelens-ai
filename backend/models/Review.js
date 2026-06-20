const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  shareId: {
    type: String,
    unique: true,
    required: true
  },
  userId: {
    type: String,
    default: null
  },
  userEmail: {
    type: String,
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
    expires: 60 * 60 * 24 * 30
  }
});

module.exports = mongoose.model('Review', reviewSchema);
