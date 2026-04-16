const express = require('express');
const User = require('../models/User');
const News = require('../models/News');
const Subscription = require('../models/Subscription');
const Like = require('../models/Like');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

const MONETIZATION_THRESHOLDS = {
  minFollowers: 100,
  minArticles: 50,
  minLikes: 500
};

async function checkMonetizationEligibility(userId) {
  const user = await User.findById(userId);
  if (!user) return false;

  const isEligible =
    user.stats.followersCount >= MONETIZATION_THRESHOLDS.minFollowers &&
    user.stats.articlesPublished >= MONETIZATION_THRESHOLDS.minArticles &&
    user.stats.totalLikesReceived >= MONETIZATION_THRESHOLDS.minLikes;

  if (isEligible && !user.monetization.isEligible) {
    user.monetization.isEligible = true;
    await user.save();
  }

  return isEligible;
}

// ─────────────────────────────────────────────────────────────
// All static routes MUST come before /:id to avoid shadowing
// ─────────────────────────────────────────────────────────────

// GET /users (list all users)
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search;

    const query = { role: 'user', isActive: true };
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ 'stats.followersCount': -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await User.countDocuments(query);

    res.json({
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /users/me (current user)
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await checkMonetizationEligibility(req.user.userId);

    const updatedUser = await User.findById(req.user.userId).select('-password');
    res.json({ user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /users/top-creators
router.get('/top-creators', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const creators = await User.find({ role: 'user', isActive: true })
      .select('name profile stats monetization')
      .sort({ 'stats.followersCount': -1 })
      .limit(limit);

    res.json(creators);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /users/bookmarks (current user's bookmarks)
router.get('/bookmarks', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
      .populate({
        path: 'bookmarks',
        populate: { path: 'author', select: 'name profile.avatar' }
      })
      .select('-password');
    res.json(user.bookmarks || []);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /users/bookmarks/:newsId
router.post('/bookmarks/:newsId', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    const newsId = req.params.newsId;

    const index = user.bookmarks.indexOf(newsId);
    if (index > -1) {
      user.bookmarks.splice(index, 1);
      await user.save();
      return res.json({ message: 'Bookmark removed', bookmarked: false });
    } else {
      user.bookmarks.push(newsId);
      await user.save();
      return res.json({ message: 'Bookmark added', bookmarked: true });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /users/earnings/stats
router.get('/earnings/stats', auth, async (req, res) => {
  try {
    await checkMonetizationEligibility(req.user.userId);

    const user = await User.findById(req.user.userId).select(
      'monetization stats name email paymentInfo'
    );

    res.json({
      earnings: {
        total: user.monetization.totalEarnings,
        pending: user.monetization.pendingEarnings,
        withdrawn: user.monetization.withdrawnAmount,
        available: user.monetization.totalEarnings - user.monetization.withdrawnAmount
      },
      stats: user.stats,
      paymentInfo: user.paymentInfo,
      isEligible: user.monetization.isEligible,
      isEnabled: user.monetization.isEnabled,
      thresholds: MONETIZATION_THRESHOLDS
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /users/check-subscription/:creatorId
router.get('/check-subscription/:creatorId', auth, async (req, res) => {
  try {
    const subscription = await Subscription.findOne({
      subscriber: req.user.userId,
      creator: req.params.creatorId
    });

    res.json({ isSubscribed: !!subscription });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /users/profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, profile, paymentInfo } = req.body;

    const updateFields = {};
    if (name) updateFields.name = name;
    if (profile) updateFields.profile = profile;
    if (paymentInfo) updateFields.paymentInfo = paymentInfo;

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { $set: updateFields },
      { new: true }
    ).select('-password');

    res.json({ user, message: 'Profile updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /users/subscribe/:creatorId
router.post('/subscribe/:creatorId', auth, async (req, res) => {
  try {
    const creatorId = req.params.creatorId;
    const subscriberId = req.user.userId;

    if (creatorId === subscriberId) {
      return res.status(400).json({ message: 'You cannot subscribe to yourself' });
    }

    const creator = await User.findById(creatorId);
    if (!creator) {
      return res.status(404).json({ message: 'User not found' });
    }

    const existingSubscription = await Subscription.findOne({
      subscriber: subscriberId,
      creator: creatorId
    });

    if (existingSubscription) {
      await Subscription.findByIdAndDelete(existingSubscription._id);

      await User.findByIdAndUpdate(subscriberId, { $inc: { 'stats.followingCount': -1 } });
      await User.findByIdAndUpdate(creatorId, { $inc: { 'stats.followersCount': -1 } });

      await checkMonetizationEligibility(creatorId);

      return res.json({ subscribed: false, message: 'Unsubscribed successfully' });
    } else {
      const subscription = new Subscription({
        subscriber: subscriberId,
        creator: creatorId
      });
      await subscription.save();

      await User.findByIdAndUpdate(subscriberId, { $inc: { 'stats.followingCount': 1 } });
      await User.findByIdAndUpdate(creatorId, { $inc: { 'stats.followersCount': 1 } });

      await checkMonetizationEligibility(creatorId);

      return res.json({ subscribed: true, message: 'Subscribed successfully' });
    }
  } catch (error) {
    console.error('Subscription error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /users/monetization/enable
router.post('/monetization/enable', auth, async (req, res) => {
  try {
    await checkMonetizationEligibility(req.user.userId);

    const user = await User.findById(req.user.userId);

    if (!user.monetization.isEligible) {
      return res.status(400).json({
        message: 'You do not meet the monetization requirements',
        thresholds: MONETIZATION_THRESHOLDS,
        current: {
          followers: user.stats.followersCount,
          articles: user.stats.articlesPublished,
          likes: user.stats.totalLikesReceived
        }
      });
    }

    user.monetization.isEnabled = true;
    user.monetization.monetizationEnabledAt = new Date();
    await user.save();

    res.json({
      message: 'Monetization enabled successfully',
      monetization: user.monetization
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ─────────────────────────────────────────────────────────────
// Dynamic routes with :id — must come AFTER all static routes
// ─────────────────────────────────────────────────────────────

// GET /users/:id
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password -email');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /users/:id/subscribers
router.get('/:id/subscribers', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const subscriptions = await Subscription.find({ creator: req.params.id })
      .populate('subscriber', 'name profile.avatar stats.followersCount')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Subscription.countDocuments({ creator: req.params.id });

    res.json({
      subscribers: subscriptions.map(s => s.subscriber),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /users/:id/subscribing
router.get('/:id/subscribing', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const subscriptions = await Subscription.find({ subscriber: req.params.id })
      .populate('creator', 'name profile.avatar stats.followersCount')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Subscription.countDocuments({ subscriber: req.params.id });

    res.json({
      subscribing: subscriptions.map(s => s.creator),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /users/:id/articles
router.get('/:id/articles', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const news = await News.find({ author: req.params.id })
      .populate('author', 'name profile.avatar stats.followersCount')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await News.countDocuments({ author: req.params.id });

    res.json({
      articles: news,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
