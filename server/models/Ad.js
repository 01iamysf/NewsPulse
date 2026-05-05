const mongoose = require('mongoose');

const adSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  targetUrl: {
    type: String,
    required: true
  },
  cpm: {
    type: Number,
    default: 10.0, // $10 per 1000 views
    required: true
  },
  stats: {
    views: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

adSchema.pre('save', function() {
  this.updatedAt = new Date();
});

module.exports = mongoose.model('Ad', adSchema);
