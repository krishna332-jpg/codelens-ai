const express = require('express');
const { requireAuth } = require('../middleware/auth');
const Review = require('../models/Review');
const router = express.Router();

// Get user's review history
router.get('/', requireAuth, async (req, res) => {
  try {
    const reviews = await Review.find({ userId: req.user.id })
      .select('shareId language review.summary review.score createdAt')
      .sort({ createdAt: -1 })
      .limit(20);
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

// Delete a review
router.delete('/:shareId', requireAuth, async (req, res) => {
  try {
    const review = await Review.findOneAndDelete({
      shareId: req.params.shareId,
      userId: req.user.id
    });
    if (!review) return res.status(404).json({ error: 'Review not found' });
    res.json({ message: 'Review deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete review' });
  }
});

module.exports = router;
