const express = require('express');
const News = require('../models/News');
const User = require('../models/User');
const { auth, adminAuth, optionalAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/', optionalAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const category = req.query.category;
    const search = req.query.search;

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

    const total = await News.countDocuments(query);
    const news = await News.find(query)
      .populate('author', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    let isAuthenticated = !!req.user;

    const processedNews = news.map(item => ({
      ...item.toObject(),
      isLocked: item.isPremium && !isAuthenticated
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

router.get('/breaking', async (req, res) => {
  try {
    const breakingNews = await News.find({ isBreaking: true })
      .populate('author', 'name')
      .sort({ createdAt: -1 })
      .limit(5);
    res.json(breakingNews);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/featured', async (req, res) => {
  try {
    const featuredNews = await News.find()
      .populate('author', 'name')
      .sort({ views: -1, createdAt: -1 })
      .limit(1);
    res.json(featuredNews[0] || null);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const news = await News.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    ).populate('author', 'name');

    if (!news) {
      return res.status(404).json({ message: 'News not found' });
    }

    res.json(news);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', adminAuth, async (req, res) => {
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
      isPremium: isPremium !== false,
      author: req.user.userId
    });

    await news.save();
    res.status(201).json(news);
  } catch (error) {
    console.error('Create news error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:id', adminAuth, async (req, res) => {
  try {
    const news = await News.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!news) {
      return res.status(404).json({ message: 'News not found' });
    }

    res.json(news);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const news = await News.findByIdAndDelete(req.params.id);
    
    if (!news) {
      return res.status(404).json({ message: 'News not found' });
    }

    await User.updateMany(
      { bookmarks: req.params.id },
      { $pull: { bookmarks: req.params.id } }
    );

    res.json({ message: 'News deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/stats/admin', adminAuth, async (req, res) => {
  try {
    const totalNews = await News.countDocuments();
    const totalViews = await News.aggregate([
      { $group: { _id: null, total: { $sum: '$views' } } }
    ]);
    const totalUsers = await User.countDocuments();
    const breakingCount = await News.countDocuments({ isBreaking: true });

    const categoryStats = await News.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json({
      totalNews,
      totalViews: totalViews[0]?.total || 0,
      totalUsers,
      breakingCount,
      categoryStats
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
