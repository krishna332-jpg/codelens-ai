require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const rateLimit = require('express-rate-limit');
const authRoutes = require('./routes/auth');
const reviewRoutes = require('./routes/review');
const historyRoutes = require('./routes/history');

const app = express();
app.set('trust proxy', 1);

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: { error: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/review', reviewRoutes);
app.use('/api/history', historyRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Keep alive - ping every 14 minutes to prevent Render free tier spin down
setInterval(async () => {
  try {
    await fetch('https://codelens-ai-backend-p8ms.onrender.com/health');
    console.log('Keep alive ping sent');
  } catch (e) {}
}, 840000);

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// Database connection
const connectDB = async () => {
  try {
    if (process.env.MONGODB_URI) {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log('MongoDB connected');
    }
  } catch (err) {
    console.error('MongoDB connection error:', err);
  }
};

const PORT = process.env.PORT || 5000;

if (require.main === module) {
  connectDB();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
