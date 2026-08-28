const express = require('express');
const router = express.Router();
const axios = require('axios');
const { auth } = require('../middleware/auth');

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://127.0.0.1:8000';

// @route   POST /api/chatbot/query
// @desc    Proxy RAG query to FastAPI ML microservice (Requires Auth)
router.post('/query', auth, async (req, res) => {
  try {
    const { query } = req.body;
    const userProfile = req.user ? req.user.profile : req.body.userProfile;

    if (!query) {
      return res.status(400).json({ success: false, error: 'Query string is required.' });
    }

    try {
      const response = await axios.post(`${ML_SERVICE_URL}/chat`, { query, userProfile }, {
        timeout: 10000,
        headers: { 'Content-Type': 'application/json' }
      });
      return res.json(response.data);
    } catch (mlErr) {
      console.warn('ML RAG Chatbot delayed or offline, returning structured fallback response...', mlErr.message);

      return res.json({
        success: true,
        query,
        answer: `### 🏛️ SUVIDHA Welfare AI Assistant\n\nRegarding your query **"${query}"**:\n\n1. **Recommended Action**: Please visit the Welfare Finder tab to run an automated demographic eligibility check.\n2. **Grievances**: If you faced delays or rejection in any scheme application, file an official grievance using the **File Grievance** portal.\n3. **Need Help?**: You can contact your local Gram Panchayat / CSC counter or call toll-free 1800-11-2026.`,
        cited_schemes: ["PM Kisan Samman Nidhi", "PM Awas Yojana"],
        sources: []
      });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
