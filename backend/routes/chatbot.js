const express = require('express');
const router = express.Router();
const { handleChat, getChatbotHealth } = require('../controllers/chatbotController');
const { optionalAuth } = require('../middleware/auth');

// @route   POST /api/chatbot/query
// @desc    Proxy RAG query to FastAPI ML microservice (Optional Auth)
router.post('/query', optionalAuth, handleChat);

// @route   GET /api/chatbot/health
// @desc    Check health status of chatbot and ML service
router.get('/health', getChatbotHealth);

module.exports = router;
