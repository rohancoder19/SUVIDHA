const pythonService = require('../services/pythonService');

const handleChat = async (req, res) => {
  try {
    const { message, query, conversationHistory, userProfile } = req.body;
    const cleanMessage = (message || query || '').trim();
    if (!cleanMessage) {
      return res.status(400).json({ success: false, message: 'Message text is required and cannot be empty' });
    }

    // Extract flat profile from auth session or request body
    let profile = null;
    if (req.user && req.user.profile) {
      profile = req.user.profile;
    } else if (userProfile) {
      profile = userProfile.profile || userProfile;
    }

    const response = await pythonService.queryChatbot(
      cleanMessage,
      Array.isArray(conversationHistory) ? conversationHistory : [],
      profile
    );

    const replyText = response.reply || "AI Assistant is temporarily unavailable. Please try again.";
    const sourcesList = response.sources || [];

    return res.json({
      success: true,
      reply: replyText,
      answer: replyText, // Dual support for RAGChatbotModal
      source: response.source || "Civic Assistant Service",
      sources: sourcesList,
      cited_schemes: sourcesList, // Dual support for RAGChatbotModal
      suggestedActions: Array.isArray(response.suggestedActions) ? response.suggestedActions : ["Find Schemes", "File Complaint", "Track Grievances"]
    });
  } catch (error) {
    console.error('[CHATBOT ERROR]', error.message);
    const fallbackText = "AI Assistant is temporarily unavailable. Please try again.";
    return res.status(500).json({
      success: false,
      reply: fallbackText,
      answer: fallbackText,
      source: "Civic Assistant Service",
      sources: [],
      cited_schemes: [],
      suggestedActions: ["Find Schemes", "File Complaint", "Track Grievances"]
    });
  }
};

const getChatbotHealth = async (req, res) => {
  try {
    const health = await pythonService.checkHealth();
    return res.json({
      status: health.connected ? 'healthy' : 'degraded',
      service: 'Node Express Backend -> FastAPI ML Bridge',
      mlService: health
    });
  } catch (error) {
    return res.status(500).json({
      status: 'unhealthy',
      error: error.message
    });
  }
};

module.exports = { handleChat, getChatbotHealth };
