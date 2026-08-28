const express = require('express');
const router = express.Router();
const axios = require('axios');
const Scheme = require('../models/Scheme');

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://127.0.0.1:8000';

// @route   GET /api/schemes
// @desc    Get list of schemes
router.get('/', async (req, res) => {
  try {
    const { state, level, search } = req.query;
    let query = {};

    if (state && state !== 'All India') {
      query.$or = [{ state: state }, { state: 'All India' }, { level: 'Central' }];
    }
    if (level) {
      query.level = level;
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { department: { $regex: search, $options: 'i' } }
      ];
    }

    const schemes = await Scheme.find(query);
    res.json({ success: true, count: schemes.length, schemes });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// @route   GET /api/schemes/:slug
// @desc    Get single scheme details by slug
router.get('/:slug', async (req, res) => {
  try {
    const scheme = await Scheme.findOne({ slug: req.params.slug });
    if (!scheme) {
      return res.status(404).json({ success: false, error: 'Scheme not found.' });
    }
    res.json({ success: true, scheme });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// @route   POST /api/schemes/recommend
// @desc    Proxy demographic filter request to FastAPI ML Service
router.post('/recommend', async (req, res) => {
  try {
    const userProfile = req.body;

    // Proxy request to Python FastAPI ML microservice
    try {
      const response = await axios.post(`${ML_SERVICE_URL}/recommend`, userProfile, {
        timeout: 8000,
        headers: { 'Content-Type': 'application/json' }
      });
      return res.json(response.data);
    } catch (mlErr) {
      console.warn('ML Microservice proxy offline or delayed, executing DB fallback filter engine...', mlErr.message);

      // In-database fallback hard eligibility filtering
      const allSchemes = await Scheme.find({});
      const eligible = [];

      const userState = (userProfile.state || 'All India').trim();
      const userAge = parseInt(userProfile.age || 25, 10);
      const userGender = (userProfile.gender || 'All').trim();
      const userIncome = parseFloat(userProfile.income || 0);
      const userCategory = (userProfile.category || 'General').trim();
      const userIsStudent = Boolean(userProfile.isStudent);
      const userOccupation = (userProfile.occupation || 'All').trim();

      for (const scheme of allSchemes) {
        // State isolation
        if (scheme.level === 'State' && scheme.state !== 'All India') {
          if (scheme.state.toLowerCase() !== userState.toLowerCase()) continue;
        }

        // Gender check
        if (scheme.gender !== 'All' && scheme.gender.toLowerCase() !== userGender.toLowerCase()) continue;

        // Age bounds
        if (userAge < scheme.minAge || userAge > scheme.maxAge) continue;

        // Income ceiling
        if (scheme.maxIncome && userIncome > scheme.maxIncome) continue;

        // Student check
        if (scheme.isStudentOnly && !userIsStudent) continue;

        // Occupation
        if (scheme.targetOccupations && scheme.targetOccupations.length > 0) {
          if (!scheme.targetOccupations.includes('All') && !scheme.targetOccupations.includes(userOccupation)) {
            continue;
          }
        }

        // Category
        if (scheme.allowedCategories && scheme.allowedCategories.length > 0) {
          if (!scheme.allowedCategories.includes('All') && !scheme.allowedCategories.includes(userCategory)) {
            continue;
          }
        }

        // Calculate affinity match percentage
        let score = 40.0;
        if (scheme.maxIncome > 0) {
          score += (1.0 - (userIncome / scheme.maxIncome)) * 20.0;
        }
        if (scheme.allowedCategories.includes(userCategory)) score += 15.0;
        if (scheme.targetOccupations.includes(userOccupation)) score += 15.0;
        const matchPct = Math.round(Math.max(15, Math.min(98, score)) * 10) / 10;

        const schemeObj = scheme.toObject();
        schemeObj.match_percentage = matchPct;
        schemeObj.scheme_name = scheme.title;
        schemeObj.scheme_slug = scheme.slug;
        schemeObj.state_name = scheme.state;
        schemeObj.eligibility_text = scheme.eligibilityText;
        schemeObj.application_url = scheme.applicationUrl;

        eligible.push(schemeObj);
      }

      // Sort in ASCENDING ORDER as required
      eligible.sort((a, b) => a.match_percentage - b.match_percentage);

      return res.json({
        success: true,
        count: eligible.length,
        total_catalog: allSchemes.length,
        user_profile: userProfile,
        schemes: eligible
      });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
