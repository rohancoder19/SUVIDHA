const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const User = require('../models/User');


// @route   GET /api/applications
// @desc    Get user's tracked scheme applications
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('trackedApplications.scheme');
    if (!user) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'User not found' } });

    res.json({
      success: true,
      data: { applications: user.trackedApplications || [] },
      message: 'Tracked applications retrieved successfully'
    });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
});

// @route   POST /api/applications/update
// @desc    Add or update status of a tracked scheme application
router.post('/update', auth, async (req, res) => {
  try {
    const { schemeId, status, notes } = req.body;
    if (!schemeId) {
      return res.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: 'Scheme ID is required' } });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'User not found' } });

    let appItem = user.trackedApplications.find(a => a.scheme.toString() === schemeId);

    if (appItem) {
      if (status) appItem.status = status;
      if (notes !== undefined) appItem.notes = notes;
      appItem.updatedAt = new Date();
      if (status === 'Applied' && !appItem.appliedAt) {
        appItem.appliedAt = new Date();
      }
    } else {
      user.trackedApplications.push({
        scheme: schemeId,
        status: status || 'Saved',
        notes: notes || '',
        appliedAt: status === 'Applied' ? new Date() : null,
        updatedAt: new Date()
      });
    }

    await user.save();
    const updatedUser = await User.findById(req.user.id).populate('trackedApplications.scheme');

    res.json({
      success: true,
      data: { applications: updatedUser.trackedApplications },
      message: 'Application tracker status updated'
    });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
});

// @route   DELETE /api/applications/:schemeId
// @desc    Remove scheme from tracked applications
router.delete('/:schemeId', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'User not found' } });

    user.trackedApplications = user.trackedApplications.filter(a => a.scheme.toString() !== req.params.schemeId);
    await user.save();

    res.json({
      success: true,
      data: { applications: user.trackedApplications },
      message: 'Scheme removed from application tracker'
    });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
});

module.exports = router;
