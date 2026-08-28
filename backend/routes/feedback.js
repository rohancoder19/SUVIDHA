const express = require('express');
const router = express.Router();
const Feedback = require('../models/Feedback');

// @route   POST /api/feedback
// @desc    Store user feedback on recommendation
router.post('/', async (req, res) => {
  try {
    const { schemeSlug, schemeTitle, isHelpful, comment } = req.body;
    if (!schemeSlug || isHelpful === undefined) {
      return res.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: 'Scheme slug and feedback score required' } });
    }

    const feedback = new Feedback({
      schemeSlug,
      schemeTitle: schemeTitle || schemeSlug,
      isHelpful: Boolean(isHelpful),
      comment: comment || ''
    });

    await feedback.save();

    res.json({
      success: true,
      message: 'Feedback recorded successfully. Thank you for helping improve SUVIDHA 2.0!'
    });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
});

// @route   GET /api/feedback/stats
// @desc    Get aggregated recommendation feedback analytics
router.get('/stats', async (req, res) => {
  try {
    const total = await Feedback.countDocuments({});
    const helpfulCount = await Feedback.countDocuments({ isHelpful: true });
    const unhelpfulCount = await Feedback.countDocuments({ isHelpful: false });

    res.json({
      success: true,
      data: {
        total,
        helpfulCount,
        unhelpfulCount,
        satisfactionRate: total > 0 ? Math.round((helpfulCount / total) * 100) : 100
      },
      message: 'Feedback statistics retrieved'
    });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
});

module.exports = router;
