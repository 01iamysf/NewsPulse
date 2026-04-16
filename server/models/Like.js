const mongoose = require('mongoose');

const likeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  news: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'News',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

likeSchema.index({ user: 1, news: 1 }, { unique: true });
likeSchema.index({ news: 1 });
likeSchema.index({ user: 1 });

module.exports = mongoose.model('Like', likeSchema);
