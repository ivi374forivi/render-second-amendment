class AIAgent {
  constructor() {
    // Expanded intent patterns for better recognition
    this.modelGuideIntents = [
      'show me', 'find', 'looking for', 'need', 'best', 'recommend', 
      'suggest', 'compare', 'difference between', 'which', 'versus', 
      'vs', 'alternatives', 'options', 'browse', 'search'
    ];
    
    this.technicalIntents = [
      'how to', 'instructions', 'steps', 'what', 'why', 'explain', 
      'settings', 'specifications', 'specs', 'dimensions', 'weight',
      'material', 'infill', 'layer', 'temperature', 'print', 'build',
      'assembly', 'parts', 'components', 'caliber', 'barrel'
    ];
    
    this.safetyIntents = [
      'legal', 'allowed', 'can i', 'safe', 'dangerous', 'risks', 
      'regulations', 'laws', 'compliance', 'permit', 'license',
      'restricted', 'prohibited', 'illegal', 'atf', 'nfa'
    ];
    
    this.communityIntents = [
      'contribute', 'help', 'feedback', 'report', 'bug', 'issue',
      'suggestion', 'improvement', 'community', 'forum', 'discuss'
    ];
    
    this.educationalIntents = [
      'learn', 'teach', 'understand', 'what is', 'definition',
      'terminology', 'guide', 'tutorial', 'basics', 'beginner'
    ];
    
    // Conversation history for context awareness (max 10 turns)
    this.conversationHistory = [];
    this.maxHistoryLength = 10;
    
    // Agent capabilities registry
    this.agentCapabilities = {
      model_guide: {
        name: 'Model Guide',
        description: 'Helps find and compare models',
        confidence_threshold: 0.7
      },
      technical_advisor: {
        name: 'Technical Advisor',
        description: 'Provides technical specifications and guidance',
        confidence_threshold: 0.7
      },
      safety_compliance: {
        name: 'Safety Compliance',
        description: 'Ensures safe and legal usage',
        confidence_threshold: 0.8
      },
      community_liaison: {
        name: 'Community Liaison',
        description: 'Connects users with community',
        confidence_threshold: 0.6
      },
      educational: {
        name: 'Educational Agent',
        description: 'Teaches firearm mechanics and principles',
        confidence_threshold: 0.6
      }
    };
  }

  /**
   * Detect user intent with confidence scoring
   * @param {string} query - User query
   * @returns {Object} Intent and confidence score
   */
  detectIntent(query) {
    const lowerQuery = query.toLowerCase();
    const scores = {
      safety_compliance: 0,
      technical_advisor: 0,
      model_guide: 0,
      community_liaison: 0,
      educational: 0
    };
    
    // Priority patterns that should strongly influence detection
    const priorityPatterns = {
      educational: ['what is ', 'what does', 'define ', 'definition of'],
      community_liaison: ['contribute', 'how can i help', 'how do i contribute', 'report bug', 'submit'],
      safety_compliance: ['is this legal', 'can i build', 'allowed to', 'regulations', 'laws in']
    };
    
    // Check priority patterns first (give higher weight)
    for (const [intent, patterns] of Object.entries(priorityPatterns)) {
      for (const pattern of patterns) {
        if (lowerQuery.includes(pattern)) {
          scores[intent] += 3; // Higher weight for priority patterns
        }
      }
    }
    
    // Calculate confidence scores for each intent
    this.safetyIntents.forEach(intent => {
      if (lowerQuery.includes(intent)) scores.safety_compliance += 1;
    });
    
    this.technicalIntents.forEach(intent => {
      if (lowerQuery.includes(intent)) scores.technical_advisor += 1;
    });
    
    this.modelGuideIntents.forEach(intent => {
      if (lowerQuery.includes(intent)) scores.model_guide += 1;
    });
    
    this.communityIntents.forEach(intent => {
      if (lowerQuery.includes(intent)) scores.community_liaison += 1;
    });
    
    this.educationalIntents.forEach(intent => {
      if (lowerQuery.includes(intent)) scores.educational += 1;
    });
    
    // Find highest scoring intent
    let maxScore = 0;
    let detectedIntent = 'model_guide'; // Default
    
    for (const [intent, score] of Object.entries(scores)) {
      if (score > maxScore) {
        maxScore = score;
        detectedIntent = intent;
      }
    }
    
    // Normalize confidence (0-1 range)
    const totalMatches = Object.values(scores).reduce((a, b) => a + b, 0);
    const confidence = totalMatches > 0 ? maxScore / totalMatches : 0.5;
    
    return { intent: detectedIntent, confidence };
  }

  /**
   * Process query with context awareness
   * @param {string} query - User query
   * @param {string} sessionId - Optional session ID for conversation history
   * @returns {Object} Response object
   */
  processQuery(query, sessionId = null) {
    // Add to conversation history
    this.addToHistory(query, sessionId);
    
    // Detect intent with confidence
    const { intent, confidence } = this.detectIntent(query);
    
    // Get context from conversation history (for future use)
    const context = this.getConversationContext(sessionId);
    void context; // Reserved for future context-aware features
    
    let response;

    switch (intent) {
    case 'model_guide':
      response = this.handleModelGuide(query);
      break;
    case 'technical_advisor':
      response = this.handleTechnicalAdvisor(query);
      break;
    case 'safety_compliance':
      response = this.handleSafetyCompliance(query);
      break;
    case 'community_liaison':
      response = this.handleCommunityLiaison(query);
      break;
    case 'educational':
      response = this.handleEducational(query);
      break;
    default:
      response = {
        message: 'I\'m not sure how to help with that. Could you rephrase your question?',
        follow_up_questions: [
          'Show me popular models',
          'What are the print settings?',
          'Is this legal in my area?'
        ],
        suggestions: ['Try being more specific about what you need']
      };
    }
    
    // Add metadata
    response.intent = intent;
    response.confidence = confidence;
    response.agent = this.agentCapabilities[intent]?.name || 'General Assistant';
    
    return response;
  }

  handleModelGuide(query) {
    const lowerQuery = query.toLowerCase();
    let responseMessage = 'I can help you find a model. What are you looking for?';
    const followUp = ['Show me popular pistols', 'Compare AR-15 models', 'I need a compact 9mm pistol'];

    if (lowerQuery.includes('pistol') || lowerQuery.includes('glock')) {
      responseMessage = 'I recommend the G17 and G19 models. The G17 is full-size, and the G19 is compact. Would you like to see a comparison?';
    } else if (lowerQuery.includes('ar-15') || lowerQuery.includes('rifle')) {
      responseMessage = 'There are several popular AR-15 lower receiver models. Are you looking for a specific one?';
    } else if (lowerQuery.includes('compare') || lowerQuery.includes('versus')) {
      responseMessage = 'I can help compare models. Please specify which models you\'d like to compare, or I can suggest popular comparisons.';
    } else if (lowerQuery.includes('best')) {
      responseMessage = 'The \'best\' model depends on your specific needs. Could you tell me more about your requirements? (e.g., caliber, size, intended use)';
    }

    return {
      message: responseMessage,
      follow_up_questions: followUp,
      suggestions: [
        'Specify caliber or model type',
        'Tell me your experience level',
        'Share your intended use case'
      ]
    };
  }

  /**
   * Handle technical advisor queries
   */
  handleTechnicalAdvisor(query) {
    const lowerQuery = query.toLowerCase();
    let responseMessage = 'I can help with technical questions. What do you need to know?';
    
    if (lowerQuery.includes('infill')) {
      responseMessage = 'For structural parts like lower receivers, I recommend 100% infill with PLA+ or nylon. For non-stress components, 50-70% infill may suffice. What part are you printing?';
    } else if (lowerQuery.includes('material')) {
      responseMessage = 'PLA+ and nylon are popular choices. PLA+ is easier to print but less durable. Nylon is stronger but requires higher temperatures and can warp. What\'s your printer capable of?';
    } else if (lowerQuery.includes('temperature') || lowerQuery.includes('settings')) {
      responseMessage = 'Print settings vary by material: PLA+ (220-235°C), Nylon (240-260°C). I recommend starting with manufacturer specs and adjusting. Need specific settings for a material?';
    } else if (lowerQuery.includes('assembly')) {
      responseMessage = 'Assembly instructions vary by model. Most include step-by-step guides in their README. Which model are you assembling?';
    }
    
    return {
      message: responseMessage,
      follow_up_questions: [
        'What infill should I use?',
        'What are the best print settings for PLA+?',
        'How do I assemble the parts?'
      ],
      suggestions: [
        'Specify the part you\'re working on',
        'Share your printer specs',
        'Describe any issues you\'re facing'
      ]
    };
  }

  /**
   * Handle safety compliance queries
   */
  handleSafetyCompliance(query) {
    const lowerQuery = query.toLowerCase();
    let responseMessage = 'Safety and legal compliance are paramount. I can provide general guidance, but you must verify local laws.';
    
    if (lowerQuery.includes('legal') || lowerQuery.includes('laws')) {
      responseMessage = '⚠️ Legal status varies by jurisdiction. In the US, federal law generally allows personal manufacture, but state/local laws vary significantly. You MUST research your specific location. Are you asking about a specific jurisdiction?';
    } else if (lowerQuery.includes('safe') || lowerQuery.includes('dangerous')) {
      responseMessage = '🔒 Safety considerations: 1) Use appropriate materials, 2) Follow assembly instructions exactly, 3) Inspect all parts before use, 4) Test fire in safe environment, 5) Follow all firearms safety rules. What specific safety aspect concerns you?';
    } else if (lowerQuery.includes('permit') || lowerQuery.includes('license')) {
      responseMessage = 'Licensing requirements vary by location and firearm type. Some jurisdictions require permits for possession or manufacture. Check with your local authorities or a qualified attorney.';
    }
    
    return {
      message: responseMessage,
      follow_up_questions: [
        'What are the federal laws in the US?',
        'What safety precautions should I take?',
        'Do I need a license?'
      ],
      warnings: [
        'Always verify local laws before manufacturing',
        'Consult legal counsel if uncertain',
        'Safety is your responsibility'
      ],
      suggestions: [
        'Specify your location for more accurate info',
        'Contact local law enforcement for clarification',
        'Review SECURITY.md for more details'
      ]
    };
  }

  /**
   * Handle community liaison queries
   */
  handleCommunityLiaison(query) {
    const lowerQuery = query.toLowerCase();
    let responseMessage = 'I can help you connect with the community and contribute to the project.';
    
    if (lowerQuery.includes('contribute') || lowerQuery.includes('help')) {
      responseMessage = 'Great! You can contribute by: 1) Submitting new models, 2) Improving documentation, 3) Reporting issues, 4) Sharing feedback. Check CONTRIBUTING.md for detailed guidelines. What interests you most?';
    } else if (lowerQuery.includes('bug') || lowerQuery.includes('issue')) {
      responseMessage = 'To report an issue: 1) Check existing issues on GitHub, 2) Provide detailed description, 3) Include steps to reproduce, 4) Add screenshots if applicable. Would you like to report a bug now?';
    } else if (lowerQuery.includes('feedback') || lowerQuery.includes('suggestion')) {
      responseMessage = 'We value your feedback! You can share suggestions via GitHub issues or discussions. Please be specific about what you\'d like to see improved. What feedback do you have?';
    }
    
    return {
      message: responseMessage,
      follow_up_questions: [
        'How can I contribute a model?',
        'Where do I report bugs?',
        'How do I join the community?'
      ],
      suggestions: [
        'Check CONTRIBUTING.md for guidelines',
        'Join GitHub discussions',
        'Review existing issues before creating new ones'
      ]
    };
  }

  /**
   * Handle educational queries
   */
  handleEducational(query) {
    const lowerQuery = query.toLowerCase();
    let responseMessage = 'I can help you understand firearm mechanics and 3D printing concepts.';
    
    if (lowerQuery.includes('what is')) {
      const term = lowerQuery.split('what is')[1]?.trim();
      responseMessage = `I can explain "${term}". Let me provide a comprehensive explanation. (Educational content would be expanded here based on the specific term)`;
    } else if (lowerQuery.includes('how does')) {
      responseMessage = 'I can explain how various mechanisms work. Please specify what you\'d like to understand better (e.g., how does a direct impingement system work?).';
    } else if (lowerQuery.includes('learn') || lowerQuery.includes('beginner')) {
      responseMessage = 'For beginners, I recommend starting with: 1) Understanding basic firearm safety, 2) Learning 3D printing fundamentals, 3) Studying simple models first, 4) Reviewing the guides in the repository. What\'s your current knowledge level?';
    }
    
    return {
      message: responseMessage,
      follow_up_questions: [
        'What is a lower receiver?',
        'How does a gas system work?',
        'What should beginners know?'
      ],
      suggestions: [
        'Start with basic concepts',
        'Review documentation in Guides/',
        'Ask specific questions for detailed answers'
      ]
    };
  }

  /**
   * Add query to conversation history
   */
  addToHistory(query, sessionId) {
    if (!sessionId) return;
    
    const entry = {
      query,
      timestamp: new Date().toISOString(),
      sessionId
    };
    
    this.conversationHistory.push(entry);
    
    // Maintain max history length
    if (this.conversationHistory.length > this.maxHistoryLength) {
      this.conversationHistory.shift();
    }
  }

  /**
   * Get conversation context
   */
  getConversationContext(sessionId) {
    if (!sessionId) return {};
    
    const sessionHistory = this.conversationHistory
      .filter(entry => entry.sessionId === sessionId)
      .slice(-3); // Last 3 interactions
    
    return {
      previousQueries: sessionHistory.map(e => e.query),
      queryCount: sessionHistory.length
    };
  }

  /**
   * Get agent capabilities
   */
  getCapabilities() {
    return this.agentCapabilities;
  }

  /**
   * Analyze sentiment of query (simple implementation)
   */
  analyzeSentiment(query) {
    const positiveWords = ['good', 'great', 'excellent', 'love', 'perfect', 'awesome', 'thanks'];
    const negativeWords = ['bad', 'terrible', 'hate', 'problem', 'issue', 'broken', 'wrong', 'error'];
    
    const lowerQuery = query.toLowerCase();
    let sentiment = 'neutral';
    
    if (positiveWords.some(word => lowerQuery.includes(word))) {
      sentiment = 'positive';
    } else if (negativeWords.some(word => lowerQuery.includes(word))) {
      sentiment = 'negative';
    }
    
    return sentiment;
  }
}

module.exports = new AIAgent();
