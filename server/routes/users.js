const express = require('express');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.get('/bookmarks', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
      .populate({
        path: 'bookmarks',
        populate: { path: 'author', select: 'name' }
      })
      .select('-password');
    res.json(user.bookmarks || []);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

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

router.get('/', async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
