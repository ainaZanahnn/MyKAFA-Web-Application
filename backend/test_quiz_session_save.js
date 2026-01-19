const { QuizSessionStore } = require('./src/services/QuizSessionStore');
const { AdaptiveQuizService } = require('./src/services/AdaptiveQuizService');

async function testQuizSessionSave() {
  try {
    console.log('Testing quiz session save with remedial_questions column...');

    const adaptiveQuizService = new AdaptiveQuizService();

    // Create a test quiz session
    const sessionData = {
      userId: 1,
      year: 1,
      subject: 'Sirah',
      topic: 'Unit 1: Rasulullah S.A.W',
      totalQuestions: 10,
      abilityEstimate: 0.5,
      weakTopics: [],
      availableQuestions: []
    };

    const session = adaptiveQuizService.createQuizSession(sessionData);
    console.log('Created quiz session:', session.sessionId);

    // Try to save the session
    const store = new QuizSessionStore();
    await store.save(session);
    console.log('✅ Quiz session saved successfully!');

    // Try to retrieve the session
    const retrievedSession = await store.get(session.sessionId);
    if (retrievedSession) {
      console.log('✅ Quiz session retrieved successfully!');
      console.log('Remedial questions:', retrievedSession.remedialQuestions);
    } else {
      console.log('❌ Failed to retrieve quiz session');
    }

  } catch (error) {
    console.error('❌ Error testing quiz session save:', error.message);
  }
}

testQuizSessionSave();
