const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const multer = require('multer');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const newsRoutes = require('./routes/news');
const usersRoutes = require('./routes/users');
const earningsRoutes = require('./routes/earnings');
const uploadRoutes = require('./routes/upload');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/newspulse';

// Trust proxy headers (needed in Docker / behind nginx)
app.set('trust proxy', 1);

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

// Serve uploaded files — must come BEFORE api routes
app.use('/uploads', (req, res, next) => {
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
}, express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/earnings', earningsRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Multer error handler (must come before generic error handler)
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File is too large. Maximum size is 5MB.' });
    }
    return res.status(400).json({ message: `Upload error: ${err.message}` });
  }
  if (err && err.message === 'Only image files are allowed') {
    return res.status(400).json({ message: err.message });
  }
  next(err);
});

// Generic error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

module.exports = app;
