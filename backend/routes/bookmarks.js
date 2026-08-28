const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const User = require('../models/User');
const Scheme = require('../models/Scheme');


// @route   GET /api/bookmarks
// @desc    Get user's saved schemes and document status checklist
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('savedSchemes');
    if (!user) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'User not found' } });

    res.json({
      success: true,
      data: {
        savedSchemes: user.savedSchemes || [],
        documentStatuses: user.documentStatuses || {}
      },
      message: 'Saved schemes retrieved successfully'
    });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
});

// @route   POST /api/bookmarks/toggle
// @desc    Save or unsave a scheme
router.post('/toggle', auth, async (req, res) => {
  try {
    const { schemeId } = req.body;
    if (!schemeId) {
      return res.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: 'Scheme ID is required' } });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'User not found' } });

    const index = user.savedSchemes.indexOf(schemeId);
    let isSaved = false;

    if (index > -1) {
      user.savedSchemes.splice(index, 1);
    } else {
      user.savedSchemes.push(schemeId);
      isSaved = true;
    }

    await user.save();
    const updatedUser = await User.findById(req.user.id).populate('savedSchemes');

    res.json({
      success: true,
      data: {
        isSaved,
        savedSchemes: updatedUser.savedSchemes
      },
      message: isSaved ? 'Scheme saved successfully' : 'Scheme removed from saved'
    });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
});

// @route   POST /api/bookmarks/document-status
// @desc    Update status of a document (not_available, ready, uploaded)
router.post('/document-status', auth, async (req, res) => {
  try {
    const { docName, status } = req.body;
    if (!docName || !status) {
      return res.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: 'Document name and status are required' } });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'User not found' } });

    if (!user.documentStatuses) {
      user.documentStatuses = new Map();
    }

    user.documentStatuses.set(docName, status);
    await user.save();

    res.json({
      success: true,
      data: { documentStatuses: user.documentStatuses },
      message: `Document '${docName}' status updated to '${status}'`
    });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
});

module.exports = router;
