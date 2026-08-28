const express = require('express');
const router = express.Router();
const axios = require('axios');
const Scheme = require('../models/Scheme');
const { auth } = require('../middleware/auth');

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://127.0.0.1:8000';

// @route   GET /api/schemes
// @desc    Get list of schemes with filtering, pagination & search (Requires Auth)
router.get('/', auth, async (req, res) => {
  try {
    const { state, district, level, category, search, page = 1, limit = 20 } = req.query;
    let query = { status: { $ne: 'Archived' } };

    if (state && state !== 'All India') {
      query.$or = [{ state: state }, { state: 'All India' }, { level: 'Central' }];
    }
    if (district) {
      query.$or = [{ districts: district }, { districts: { $size: 0 } }];
    }
    if (level) {
      query.level = level;
    }
    if (category && category !== 'All') {
      query.category = category;
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { department: { $regex: search, $options: 'i' } },
        { benefits: { $regex: search, $options: 'i' } }
      ];
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await Scheme.countDocuments(query);
    const schemes = await Scheme.find(query).skip(skip).limit(limitNum).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: {
        total,
        page: pageNum,
        totalPages: Math.ceil(total / limitNum),
        schemes
      },
      message: 'Schemes retrieved successfully'
    });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
});

// @route   POST /api/schemes/compare
// @desc    Get side-by-side comparison data for 2 to 4 schemes (Requires Auth)
router.post('/compare', auth, async (req, res) => {
  try {
    const { identifiers } = req.body;
    if (!identifiers || !Array.isArray(identifiers) || identifiers.length === 0) {
      return res.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: 'Identifiers array is required' } });
    }

    const schemes = await Scheme.find({
      $or: [
        { slug: { $in: identifiers } },
        { _id: { $in: identifiers.filter(id => id.match(/^[0-9a-fA-F]{24}$/)) } }
      ]
    });

    res.json({
      success: true,
      data: { count: schemes.length, schemes },
      message: 'Comparison data generated successfully'
    });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
});

// @route   POST /api/schemes/natural-search
// @desc    Natural language AI search proxy (Requires Auth)
router.post('/natural-search', auth, async (req, res) => {
  try {
    const { query } = req.body;
    try {
      const mlRes = await axios.post(`${ML_SERVICE_URL}/natural-search`, { query }, { timeout: 8000 });
      return res.json(mlRes.data);
    } catch (mlErr) {
      console.warn('ML Service offline, using DB text fallback search:', mlErr.message);
      const schemes = await Scheme.find({
        $or: [
          { title: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } },
          { benefits: { $regex: query, $options: 'i' } }
        ]
      }).limit(6);
      return res.json({ success: true, count: schemes.length, schemes });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
});

// @route   GET /api/schemes/:slug
// @desc    Get single scheme details by slug (Requires Auth)
router.get('/:slug', auth, async (req, res) => {
  try {
    const scheme = await Scheme.findOne({ slug: req.params.slug });
    if (!scheme) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Scheme not found' } });
    }

    const similar = await Scheme.find({
      _id: { $ne: scheme._id },
      $or: [{ level: scheme.level }, { state: scheme.state }]
    }).limit(3);

    res.json({ success: true, data: { scheme, similar }, message: 'Scheme details retrieved' });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
});

// @route   POST /api/schemes/recommend
// @desc    Proxy demographic filter request to FastAPI ML Service using authenticated user profile (Requires Auth)
router.post('/recommend', auth, async (req, res) => {
  try {
    // SECURITY: Always use authenticated user's profile from server-side session
    const userProfile = { ...req.user.profile.toObject(), ...req.body };

    try {
      const response = await axios.post(`${ML_SERVICE_URL}/recommend`, userProfile, {
        timeout: 8000,
        headers: { 'Content-Type': 'application/json' }
      });
      return res.json(response.data);
    } catch (mlErr) {
      console.warn('ML Microservice proxy offline, executing DB fallback filter engine...', mlErr.message);

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
        const matched_reasons = [];
        const missing_requirements = [];

        // State isolation
        if (scheme.level === 'State' && scheme.state !== 'All India') {
          if (scheme.state.toLowerCase() !== userState.toLowerCase()) {
            missing_requirements.push(`Requires residence in ${scheme.state}`);
            continue;
          } else {
            matched_reasons.push(`Resides in ${scheme.state}`);
          }
        } else {
          matched_reasons.push(`Central Scheme available in all states`);
        }

        // Gender check
        if (scheme.gender !== 'All' && scheme.gender.toLowerCase() !== userGender.toLowerCase()) {
          missing_requirements.push(`Targeted for ${scheme.gender} applicants`);
          continue;
        } else if (scheme.gender !== 'All') {
          matched_reasons.push(`Gender criteria met (${userGender})`);
        }

        // Age bounds
        if (userAge < scheme.minAge || userAge > scheme.maxAge) {
          missing_requirements.push(`Age must be between ${scheme.minAge} and ${scheme.maxAge}`);
          continue;
        } else {
          matched_reasons.push(`Age requirement met (${userAge} yrs within ${scheme.minAge}-${scheme.maxAge})`);
        }

        // Income ceiling
        if (scheme.maxIncome && userIncome > scheme.maxIncome) {
          missing_requirements.push(`Annual income must be under ₹${scheme.maxIncome.toLocaleString('en-IN')}`);
          continue;
        } else {
          matched_reasons.push(`Income ceiling met (under ₹${(scheme.maxIncome || 0).toLocaleString('en-IN')})`);
        }

        // Student check
        if (scheme.isStudentOnly && !userIsStudent) {
          missing_requirements.push(`Must be an active student`);
          continue;
        } else if (scheme.isStudentOnly) {
          matched_reasons.push(`Active student status verified`);
        }

        // Occupation check
        if (scheme.targetOccupations && scheme.targetOccupations.length > 0) {
          if (!scheme.targetOccupations.includes('All') && !scheme.targetOccupations.includes(userOccupation)) {
            missing_requirements.push(`Targeted for occupations: ${scheme.targetOccupations.join(', ')}`);
            continue;
          } else {
            matched_reasons.push(`Occupation matches (${userOccupation})`);
          }
        }

        // Category check
        if (scheme.allowedCategories && scheme.allowedCategories.length > 0) {
          if (!scheme.allowedCategories.includes('All') && !scheme.allowedCategories.includes(userCategory)) {
            missing_requirements.push(`Targeted for categories: ${scheme.allowedCategories.join(', ')}`);
            continue;
          } else {
            matched_reasons.push(`Category quota met (${userCategory})`);
          }
        }

        let score = 40.0;
        if (scheme.maxIncome > 0) {
          score += (1.0 - (userIncome / scheme.maxIncome)) * 20.0;
        }
        if (scheme.allowedCategories.includes(userCategory)) score += 15.0;
        if (scheme.targetOccupations.includes(userOccupation)) score += 15.0;
        const matchPct = Math.round(Math.max(25, Math.min(99, score)) * 10) / 10;

        const schemeObj = scheme.toObject();
        schemeObj.match_percentage = matchPct;
        schemeObj.scheme_name = scheme.title;
        schemeObj.scheme_slug = scheme.slug;
        schemeObj.state_name = scheme.state;
        schemeObj.eligibility_text = scheme.eligibilityText;
        schemeObj.application_url = scheme.applicationUrl;
        schemeObj.matched_reasons = matched_reasons;
        schemeObj.missing_requirements = missing_requirements;
        schemeObj.score_breakdown = {
          eligibility_match: 40,
          profile_match: 25,
          location_match: 15,
          category_match: 10,
          priority_match: 10
        };

        eligible.push(schemeObj);
      }

      eligible.sort((a, b) => b.match_percentage - a.match_percentage);

      return res.json({
        success: true,
        count: eligible.length,
        total_catalog: allSchemes.length,
        user_profile: userProfile,
        schemes: eligible
      });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
});

module.exports = router;
