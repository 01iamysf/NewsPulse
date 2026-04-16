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
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  bookmarks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'News'
  }],
  profile: {
    bio: {
      type: String,
      maxlength: 500,
      default: ''
    },
    avatar: {
      type: String,
      default: ''
    },
    coverImage: {
      type: String,
      default: ''
    },
    location: {
      type: String,
      default: ''
    },
    website: {
      type: String,
      default: ''
    },
    socialLinks: {
      twitter: { type: String, default: '' },
      facebook: { type: String, default: '' },
      instagram: { type: String, default: '' },
      linkedin: { type: String, default: '' }
    }
  },
  stats: {
    followersCount: { type: Number, default: 0 },
    followingCount: { type: Number, default: 0 },
    totalLikesReceived: { type: Number, default: 0 },
    totalViewsReceived: { type: Number, default: 0 },
    articlesPublished: { type: Number, default: 0 }
  },
  monetization: {
    isEnabled: { type: Boolean, default: false },
    isEligible: { type: Boolean, default: false },
    totalEarnings: { type: Number, default: 0 },
    pendingEarnings: { type: Number, default: 0 },
    withdrawnAmount: { type: Number, default: 0 },
    monetizationEnabledAt: { type: Date }
  },
  paymentInfo: {
    paypalEmail: { type: String, default: '' },
    bankName: { type: String, default: '' },
    accountNumber: { type: String, default: '' },
    accountHolderName: { type: String, default: '' }
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

userSchema.pre('save', function() {
  this.updatedAt = new Date();
});

userSchema.index({ 'stats.followersCount': -1 });
userSchema.index({ 'stats.articlesPublished': -1 });
userSchema.index({ 'monetization.isEnabled': 1 });

module.exports = mongoose.model('User', userSchema);
