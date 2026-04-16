const express = require('express');
const News = require('../models/News');
const User = require('../models/User');
const Like = require('../models/Like');
const Subscription = require('../models/Subscription');
const { auth, adminAuth, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// ─────────────────────────────────────────────────────────────
// All named/static routes MUST come before /:id to avoid shadowing
// ─────────────────────────────────────────────────────────────

// GET /news/breaking
router.get('/breaking', async (req, res) => {
  try {
    const breakingNews = await News.find({ isBreaking: true })
      .populate('author', 'name profile.avatar stats.followersCount')
      .sort({ createdAt: -1 })
      .limit(5);
    res.json(breakingNews);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /news/featured
router.get('/featured', async (req, res) => {
  try {
    const featuredNews = await News.find()
      .populate('author', 'name profile.avatar stats.followersCount')
      .sort({ views: -1, createdAt: -1 })
      .limit(1);
    res.json(featuredNews[0] || null);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /news/popular
router.get('/popular', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    const popularNews = await News.find()
      .populate('author', 'name profile.avatar stats.followersCount')
      .sort({ likesCount: -1, views: -1 })
      .limit(limit);
    res.json(popularNews);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /news/trending
router.get('/trending', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const trendingNews = await News.find({
      createdAt: { $gte: oneWeekAgo }
    })
      .populate('author', 'name profile.avatar stats.followersCount')
      .sort({ views: -1, likesCount: -1 })
      .limit(limit);
    res.json(trendingNews);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /news/subscriptions (authenticated)
router.get('/subscriptions', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const subscriptions = await Subscription.find({ subscriber: req.user.userId });
    const creatorIds = subscriptions.map(s => s.creator);

    const news = await News.find({ author: { $in: creatorIds } })
      .populate('author', 'name profile.avatar stats.followersCount')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await News.countDocuments({ author: { $in: creatorIds } });

    const newsIds = news.map(n => n._id);
    const likes = await Like.find({
      user: req.user.userId,
      news: { $in: newsIds }
    });
    const userLikedNews = likes.map(l => l.news.toString());

    const processedNews = news.map(item => ({
      ...item.toObject(),
      isLiked: userLikedNews.includes(item._id.toString())
    }));

    res.json({
      news: processedNews,
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

// GET /news/stats/admin (admin only)
router.get('/stats/admin', adminAuth, async (req, res) => {
  try {
    const totalNews = await News.countDocuments();
    const totalViews = await News.aggregate([
      { $group: { _id: null, total: { $sum: '$views' } } }
    ]);
    const totalUsers = await User.countDocuments({ role: 'user' });
    const breakingCount = await News.countDocuments({ isBreaking: true });
    const totalLikes = await Like.countDocuments();

    const categoryStats = await News.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json({
      totalNews,
      totalViews: totalViews[0]?.total || 0,
      totalUsers,
      breakingCount,
      totalLikes,
      categoryStats
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ─────────────────────────────────────────────────────────────
// GET /news (list, with optional filters)
// ─────────────────────────────────────────────────────────────
router.get('/', optionalAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const category = req.query.category;
    const search = req.query.search;
    const authorId = req.query.author;

    const query = {};

    if (category && category !== 'All') {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } }
      ];
    }

    if (authorId) {
      query.author = authorId;
    }

    const total = await News.countDocuments(query);
    const news = await News.find(query)
      .populate('author', 'name profile.avatar stats.followersCount')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    let isAuthenticated = !!req.user;
    let userLikedNews = [];

    if (isAuthenticated) {
      const newsIds = news.map(n => n._id);
      const likes = await Like.find({
        user: req.user.userId,
        news: { $in: newsIds }
      });
      userLikedNews = likes.map(l => l.news.toString());
    }

    const processedNews = news.map(item => ({
      ...item.toObject(),
      isLocked: item.isPremium && !isAuthenticated,
      isLiked: userLikedNews.includes(item._id.toString())
    }));

    res.json({
      news: processedNews,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get news error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ─────────────────────────────────────────────────────────────
// Dynamic routes with :id — AFTER all static routes
// ─────────────────────────────────────────────────────────────

// GET /news/:id
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const news = await News.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    ).populate('author', 'name profile.avatar stats.followersCount monetization.isEnabled');

    if (!news) {
      return res.status(404).json({ message: 'News not found' });
    }

    let isLiked = false;
    if (req.user) {
      const like = await Like.findOne({
        user: req.user.userId,
        news: req.params.id
      });
      isLiked = !!like;
    }

    await User.findByIdAndUpdate(news.author._id, {
      $inc: { 'stats.totalViewsReceived': 1 }
    });

    res.json({
      ...news.toObject(),
      isLiked,
      isLocked: news.isPremium && !req.user
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /news
router.post('/', auth, async (req, res) => {
  try {
    const { title, excerpt, content, imageUrl, category, tags, isBreaking, isPremium } = req.body;

    if (!title || !excerpt || !content || !imageUrl || !category) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const news = new News({
      title,
      excerpt,
      content,
      imageUrl,
      category,
      tags: tags || [],
      isBreaking: isBreaking || false,
      isPremium: isPremium || false,
      author: req.user.userId
    });

    await news.save();

    await User.findByIdAndUpdate(req.user.userId, {
      $inc: { 'stats.articlesPublished': 1 }
    });

    const populatedNews = await News.findById(news._id)
      .populate('author', 'name profile.avatar stats.followersCount');

    res.status(201).json(populatedNews);
  } catch (error) {
    console.error('Create news error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /news/:id
router.put('/:id', auth, async (req, res) => {
  try {
    const news = await News.findById(req.params.id);

    if (!news) {
      return res.status(404).json({ message: 'News not found' });
    }

    if (news.author.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to edit this article' });
    }

    const { title, excerpt, content, imageUrl, category, tags, isBreaking, isPremium } = req.body;

    if (title) news.title = title;
    if (excerpt) news.excerpt = excerpt;
    if (content) news.content = content;
    if (imageUrl) news.imageUrl = imageUrl;
    if (category) news.category = category;
    if (tags) news.tags = tags;
    if (isBreaking !== undefined) news.isBreaking = isBreaking;
    if (isPremium !== undefined) news.isPremium = isPremium;

    await news.save();

    const populatedNews = await News.findById(news._id)
      .populate('author', 'name profile.avatar stats.followersCount');

    res.json(populatedNews);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /news/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    const news = await News.findById(req.params.id);

    if (!news) {
      return res.status(404).json({ message: 'News not found' });
    }

    if (news.author.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this article' });
    }

    await Like.deleteMany({ news: req.params.id });

    await User.updateMany(
      { bookmarks: req.params.id },
      { $pull: { bookmarks: req.params.id } }
    );

    await User.findByIdAndUpdate(news.author, {
      $inc: { 'stats.articlesPublished': -1 }
    });

    await News.findByIdAndDelete(req.params.id);

    res.json({ message: 'News deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /news/:id/like
router.post('/:id/like', auth, async (req, res) => {
  try {
    const newsId = req.params.id;
    const userId = req.user.userId;

    const news = await News.findById(newsId);
    if (!news) {
      return res.status(404).json({ message: 'News not found' });
    }

    const existingLike = await Like.findOne({ user: userId, news: newsId });

    if (existingLike) {
      await Like.findByIdAndDelete(existingLike._id);

      await News.findByIdAndUpdate(newsId, { $inc: { likesCount: -1 } });

      await User.findByIdAndUpdate(news.author, {
        $inc: { 'stats.totalLikesReceived': -1 }
      });

      return res.json({ liked: false, message: 'Article unliked' });
    } else {
      const like = new Like({ user: userId, news: newsId });
      await like.save();

      await News.findByIdAndUpdate(newsId, { $inc: { likesCount: 1 } });

      await User.findByIdAndUpdate(news.author, {
        $inc: { 'stats.totalLikesReceived': 1 }
      });

      return res.json({ liked: true, message: 'Article liked' });
    }
  } catch (error) {
    console.error('Like error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
