const express = require('express');
const router = express.Router();
const aiAgent = require('../ai');
const { validateBody } = require('../middleware/validation');
const { asyncHandler } = require('../middleware/errorHandler');

// Validation schema for AI query
const querySchema = {
  query: {
    required: true,
    type: 'string',
    minLength: 1,
    maxLength: 1000,
    sanitize: true
  },
  sessionId: {
    required: false,
    type: 'string',
    maxLength: 100,
    pattern: /^[a-zA-Z0-9-_]+$/
  }
};

// POST /api/ai/query - Query the AI agent
router.post('/query', validateBody(querySchema), asyncHandler(async (req, res) => {
  const { query, sessionId } = req.body;

  // Process query with optional session context
  const response = aiAgent.processQuery(query, sessionId);

  // Build full response with enhanced metadata
  const result = {
    query,
    sessionId,
    intent: response.intent,
    confidence: response.confidence,
    agent: response.agent,
    conversation: {
      response: response.message,
      follow_up_questions: response.follow_up_questions || [],
      suggestions: response.suggestions || [],
      warnings: response.warnings || []
    },
    timestamp: new Date().toISOString()
  };

  res.json(result);
}));

// GET /api/ai/capabilities - Get AI agent capabilities
router.get('/capabilities', (req, res) => {
  // Get capabilities from AI agent
  const capabilities = aiAgent.getCapabilities();
  
  // Format for response
  const agents = Object.entries(capabilities).map(([type, data]) => ({
    type,
    name: data.name,
    description: data.description,
    confidenceThreshold: data.confidence_threshold
  }));

  res.json({
    agents,
    features: {
      contextAwareness: true,
      sentimentAnalysis: true,
      confidenceScoring: true,
      conversationHistory: true,
      maxHistoryTurns: 10
    }
  });
});

// GET /api/ai/health - Health check for AI system
router.get('/health', (req, res) => {
  res.json({
    status: 'operational',
    agents: Object.keys(aiAgent.getCapabilities()).length,
    features: ['intent-detection', 'confidence-scoring', 'conversation-history', 'sentiment-analysis'],
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
