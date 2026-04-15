const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  excerpt: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Politics', 'Technology', 'Business', 'Sports', 'Entertainment', 'Science', 'Health', 'World']
  },
  tags: [{
    type: String,
    trim: true
  }],
  isBreaking: {
    type: Boolean,
    default: false
  },
  isPremium: {
    type: Boolean,
    default: true
  },
  views: {
    type: Number,
    default: 0
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

newsSchema.index({ createdAt: -1 });
newsSchema.index({ category: 1 });
newsSchema.index({ isBreaking: 1 });

module.exports = mongoose.model('News', newsSchema);
