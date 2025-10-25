class AIAgent {
  constructor() {
    this.modelGuideIntents = ['show me', 'find', 'looking for', 'need', 'best', 'recommend', 'suggest', 'compare', 'difference between'];
    this.technicalIntents = ['how to', 'instructions', 'steps', 'what', 'why', 'explain', 'settings', 'specifications'];
    this.safetyIntents = ['legal', 'allowed', 'can i', 'safe', 'dangerous', 'risks', 'regulations', 'laws'];
  }

  detectIntent(query) {
    const lowerQuery = query.toLowerCase();
    if (this.safetyIntents.some(intent => lowerQuery.includes(intent))) {
      return 'safety_compliance';
    }
    if (this.technicalIntents.some(intent => lowerQuery.includes(intent))) {
      return 'technical_advisor';
    }
    if (this.modelGuideIntents.some(intent => lowerQuery.includes(intent))) {
      return 'model_guide';
    }
    return 'model_guide'; // Default
  }

  processQuery(query) {
    const intent = this.detectIntent(query);
    let response;

    switch (intent) {
      case 'model_guide':
        response = this.handleModelGuide(query);
        break;
      case 'technical_advisor':
        response = {
          message: "I can help with technical questions. What do you need to know?",
          follow_up_questions: ["What infill should I use?", "What are the best print settings for PLA+?"]
        };
        break;
      case 'safety_compliance':
        response = {
          message: "Safety is very important. Please tell me your location so I can provide accurate information.",
          follow_up_questions: ["What are the laws in California?", "Is it legal to print a firearm?"]
        };
        break;
      default:
        response = {
          message: "I'm not sure how to help with that. Could you rephrase your question?",
          follow_up_questions: []
        };
    }
    return response;
  }

  handleModelGuide(query) {
    const lowerQuery = query.toLowerCase();
    let responseMessage = "I can help you find a model. What are you looking for?";
    const followUp = ["Show me popular pistols", "Compare AR-15 models", "I need a compact 9mm pistol"];

    if (lowerQuery.includes('pistol') || lowerQuery.includes('glock')) {
      responseMessage = "I recommend the G17 and G19 models. The G17 is full-size, and the G19 is compact. Would you like to see a comparison?";
    } else if (lowerQuery.includes('ar-15') || lowerQuery.includes('rifle')) {
        responseMessage = "There are several popular AR-15 lower receiver models. Are you looking for a specific one?";
    }

    return {
      message: responseMessage,
      follow_up_questions: followUp
    };
  }
}

module.exports = new AIAgent();
