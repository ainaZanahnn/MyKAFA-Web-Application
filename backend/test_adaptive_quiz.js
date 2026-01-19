const { AdaptiveQuizService } = require('./src/services/AdaptiveQuizService');

async function testAdaptiveQuizHistoricalProgress() {
  try {
    console.log('Testing adaptive quiz historical progress...');

    const adaptiveQuizService = new AdaptiveQuizService();

    // Test getting historical progress for user ID 1
    console.log('Fetching historical progress for user ID 1...');
    const historicalProgress = await adaptiveQuizService.getHistoricalProgress(1);

    console.log('✅ Historical progress fetched successfully!');
    console.log('Number of progress records:', historicalProgress.length);

    if (historicalProgress.length > 0) {
      console.log('Sample progress record:', historicalProgress[0]);
    }

    // Test starting an adaptive quiz (this will call getHistoricalProgress internally)
    console.log('\nTesting adaptive quiz start...');
    const quizData = await adaptiveQuizService.startAdaptiveQuiz(1, 1, 'Sirah', 'Unit 1: Rasulullah S.A.W', 5);

    console.log('✅ Adaptive quiz started successfully!');
    console.log('Initial ability:', quizData.initialAbility);
    console.log('Weak topics:', quizData.weakTopics.length);
    console.log('Total questions:', quizData.totalQuestions);

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

testAdaptiveQuizHistoricalProgress();
