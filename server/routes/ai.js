const express = require('express');
const router = express.Router();
const aiAgent = require('../ai');

// POST /api/ai/query - Query the AI agent
router.post('/query', async (req, res, next) => {
  try {
    const { query, context } = req.body;

    if (!query) {
      return res.status(400).json({
        error: {
          code: 'INVALID_QUERY',
          message: 'Query parameter is required',
        },
      });
    }

    // Detect intent and process query
    const intent = aiAgent.detectIntent(query);
    const response = aiAgent.processQuery(query);

    // Build full response
    const result = {
      intent,
      conversation: {
        response: response.message,
        follow_up_questions: response.follow_up_questions || [],
      },
    };

    // Add context if provided
    if (context) {
      result.context = context;
    }

    res.json(result);
  } catch (error) {
    next(error);
  }
});

// GET /api/ai/capabilities - Get AI agent capabilities
router.get('/capabilities', (req, res) => {
  res.json({
    agents: [
      {
        type: 'model_guide',
        name: 'Model Guide',
        description: 'Helps find and compare models',
        capabilities: [
          'Model recommendations',
          'Model comparisons',
          'Search assistance',
        ],
      },
      {
        type: 'technical_advisor',
        name: 'Technical Advisor',
        description: 'Provides technical guidance and specifications',
        capabilities: [
          'Print settings advice',
          'Material recommendations',
          'Technical specifications',
          'Assembly instructions',
        ],
      },
      {
        type: 'safety_compliance',
        name: 'Safety & Compliance',
        description: 'Legal and safety information',
        capabilities: [
          'Legal compliance checking',
          'Safety guidelines',
          'Regulatory information',
        ],
      },
    ],
  });
});

module.exports = router;
