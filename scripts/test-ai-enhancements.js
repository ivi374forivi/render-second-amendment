#!/usr/bin/env node

/**
 * Test script for enhanced AI agent system
 * Tests intent detection, confidence scoring, and all agent types
 */

const aiAgent = require('../server/ai');

// Test colors
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const BLUE = '\x1b[34m';
const YELLOW = '\x1b[33m';
const RESET = '\x1b[0m';

let passed = 0;
let failed = 0;

function test(description, testFn) {
  try {
    testFn();
    console.log(`${GREEN}✓${RESET} ${description}`);
    passed++;
  } catch (error) {
    console.log(`${RED}✗${RESET} ${description}`);
    console.log(`  ${error.message}`);
    failed++;
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

console.log(`${BLUE}Running AI Agent Enhancement Tests...${RESET}\n`);

// Test 1: Intent Detection with Confidence
console.log(`${YELLOW}1. Intent Detection & Confidence Scoring${RESET}`);

test('Should detect model_guide intent', () => {
  const result = aiAgent.detectIntent('show me AR-15 models');
  assert(result.intent === 'model_guide', `Expected model_guide, got ${result.intent}`);
  assert(result.confidence > 0, 'Confidence should be greater than 0');
});

test('Should detect technical_advisor intent', () => {
  const result = aiAgent.detectIntent('what infill should I use?');
  assert(result.intent === 'technical_advisor', `Expected technical_advisor, got ${result.intent}`);
});

test('Should detect safety_compliance intent', () => {
  const result = aiAgent.detectIntent('is this legal in California?');
  assert(result.intent === 'safety_compliance', `Expected safety_compliance, got ${result.intent}`);
});

test('Should detect community_liaison intent', () => {
  const result = aiAgent.detectIntent('how can I contribute to the project?');
  assert(result.intent === 'community_liaison', `Expected community_liaison, got ${result.intent}`);
});

test('Should detect educational intent', () => {
  const result = aiAgent.detectIntent('what is a lower receiver?');
  assert(result.intent === 'educational', `Expected educational, got ${result.intent}`);
});

// Test 2: Enhanced Response Structure
console.log(`\n${YELLOW}2. Enhanced Response Structure${RESET}`);

test('Should include confidence in response', () => {
  const response = aiAgent.processQuery('show me pistol models');
  assert(response.confidence !== undefined, 'Response should include confidence');
  assert(typeof response.confidence === 'number', 'Confidence should be a number');
});

test('Should include agent name in response', () => {
  const response = aiAgent.processQuery('what material should I use?');
  assert(response.agent !== undefined, 'Response should include agent name');
  assert(typeof response.agent === 'string', 'Agent should be a string');
});

test('Should include suggestions in response', () => {
  const response = aiAgent.processQuery('find me a model');
  assert(response.suggestions !== undefined, 'Response should include suggestions');
  assert(Array.isArray(response.suggestions), 'Suggestions should be an array');
});

test('Should include follow-up questions', () => {
  const response = aiAgent.processQuery('help me');
  assert(response.follow_up_questions !== undefined, 'Response should include follow-up questions');
  assert(Array.isArray(response.follow_up_questions), 'Follow-up questions should be an array');
});

// Test 3: Agent Capabilities
console.log(`\n${YELLOW}3. Agent Capabilities Registry${RESET}`);

test('Should return all agent capabilities', () => {
  const capabilities = aiAgent.getCapabilities();
  assert(typeof capabilities === 'object', 'Capabilities should be an object');
  assert(Object.keys(capabilities).length === 5, 'Should have 5 agent types');
});

test('Should have model_guide capability', () => {
  const capabilities = aiAgent.getCapabilities();
  assert(capabilities.model_guide !== undefined, 'Should have model_guide');
  assert(capabilities.model_guide.name === 'Model Guide', 'Should have correct name');
});

test('Should have technical_advisor capability', () => {
  const capabilities = aiAgent.getCapabilities();
  assert(capabilities.technical_advisor !== undefined, 'Should have technical_advisor');
});

test('Should have confidence thresholds', () => {
  const capabilities = aiAgent.getCapabilities();
  Object.values(capabilities).forEach(cap => {
    assert(cap.confidence_threshold !== undefined, 'Each capability should have threshold');
    assert(typeof cap.confidence_threshold === 'number', 'Threshold should be a number');
  });
});

// Test 4: Conversation History
console.log(`\n${YELLOW}4. Conversation History${RESET}`);

test('Should track conversation history', () => {
  const sessionId = 'test-session-1';
  aiAgent.processQuery('show me models', sessionId);
  aiAgent.processQuery('what about pistols?', sessionId);
  const context = aiAgent.getConversationContext(sessionId);
  assert(context.previousQueries !== undefined, 'Should have previous queries');
  assert(Array.isArray(context.previousQueries), 'Previous queries should be an array');
});

test('Should limit history length', () => {
  const sessionId = 'test-session-2';
  for (let i = 0; i < 15; i++) {
    aiAgent.processQuery(`query ${i}`, sessionId);
  }
  const context = aiAgent.getConversationContext(sessionId);
  assert(context.previousQueries.length <= 3, 'Should only return last 3 queries');
});

// Test 5: Sentiment Analysis
console.log(`\n${YELLOW}5. Sentiment Analysis${RESET}`);

test('Should detect positive sentiment', () => {
  const sentiment = aiAgent.analyzeSentiment('this is great, thanks!');
  assert(sentiment === 'positive', `Expected positive, got ${sentiment}`);
});

test('Should detect negative sentiment', () => {
  const sentiment = aiAgent.analyzeSentiment('this is broken and terrible');
  assert(sentiment === 'negative', `Expected negative, got ${sentiment}`);
});

test('Should detect neutral sentiment', () => {
  const sentiment = aiAgent.analyzeSentiment('show me the models');
  assert(sentiment === 'neutral', `Expected neutral, got ${sentiment}`);
});

// Test 6: Specific Agent Responses
console.log(`\n${YELLOW}6. Agent-Specific Responses${RESET}`);

test('Model Guide should provide recommendations', () => {
  const response = aiAgent.processQuery('I need a 9mm pistol');
  assert(response.message.length > 0, 'Should have a message');
  assert(response.intent === 'model_guide', 'Should be model_guide');
});

test('Technical Advisor should provide technical guidance', () => {
  const response = aiAgent.processQuery('what infill percentage?');
  assert(response.intent === 'technical_advisor', 'Should be technical_advisor');
  assert(response.message.includes('infill') || response.message.includes('100%'), 'Should mention infill');
});

test('Safety Compliance should include warnings', () => {
  const response = aiAgent.processQuery('can I build this?');
  assert(response.intent === 'safety_compliance', 'Should be safety_compliance');
  assert(response.warnings !== undefined, 'Should include warnings');
  assert(response.warnings.length > 0, 'Should have at least one warning');
});

test('Community Liaison should mention contribution', () => {
  const response = aiAgent.processQuery('how can I help?');
  assert(response.intent === 'community_liaison', 'Should be community_liaison');
  assert(response.message.toLowerCase().includes('contribute') || 
         response.message.toLowerCase().includes('help'), 'Should mention contribution');
});

test('Educational should provide learning guidance', () => {
  const response = aiAgent.processQuery('what is direct impingement?');
  assert(response.intent === 'educational', 'Should be educational');
});

// Results Summary
console.log(`\n${'='.repeat(50)}`);
console.log(`${BLUE}Test Results${RESET}`);
console.log(`${'='.repeat(50)}`);
console.log(`${GREEN}Passed: ${passed}${RESET}`);
console.log(`${RED}Failed: ${failed}${RESET}`);
console.log(`Total: ${passed + failed}`);

if (failed === 0) {
  console.log(`\n${GREEN}✓ All tests passed!${RESET}`);
  process.exit(0);
} else {
  console.log(`\n${RED}✗ Some tests failed${RESET}`);
  process.exit(1);
}
