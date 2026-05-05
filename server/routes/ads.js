const express = require('express');
const Ad = require('../models/Ad');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// GET /api/ads (List all - Admin only)
router.get('/', adminAuth, async (req, res) => {
  try {
    const ads = await Ad.find().sort({ createdAt: -1 });
    res.json(ads);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/ads/random (Public - Get a random active ad for the feed)
router.get('/random', async (req, res) => {
  try {
    const ads = await Ad.find({ isActive: true });
    if (ads.length === 0) return res.status(404).json({ message: 'No active ads' });
    
    const randomAd = ads[Math.floor(Math.random() * ads.length)];
    
    // Increment view count (async, don't block response)
    Ad.findByIdAndUpdate(randomAd._id, { $inc: { 'stats.views': 1 } }).exec();
    
    res.json(randomAd);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/ads (Create - Admin only)
router.post('/', adminAuth, async (req, res) => {
  try {
    const { title, imageUrl, targetUrl, cpm } = req.body;
    const ad = new Ad({ title, imageUrl, targetUrl, cpm });
    await ad.save();
    res.status(201).json(ad);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/ads/:id (Update - Admin only)
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const { title, imageUrl, targetUrl, cpm, isActive } = req.body;
    const ad = await Ad.findByIdAndUpdate(
      req.params.id,
      { title, imageUrl, targetUrl, cpm, isActive, updatedAt: Date.now() },
      { new: true }
    );
    res.json(ad);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/ads/:id (Delete - Admin only)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    await Ad.findByIdAndDelete(req.params.id);
    res.json({ message: 'Ad deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/ads/click/:id (Public - Track click and redirect)
router.get('/click/:id', async (req, res) => {
  try {
    const ad = await Ad.findByIdAndUpdate(req.params.id, { $inc: { 'stats.clicks': 1 } });
    if (!ad) return res.status(404).send('Ad not found');
    res.redirect(ad.targetUrl);
  } catch (error) {
    res.status(500).send('Server error');
  }
});

module.exports = router;
