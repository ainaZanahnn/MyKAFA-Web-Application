import { Question, QuizSession, HistoricalProgress } from '../types/adaptiveQuizTypes';

// From adaptiveQuizUtils.ts
export function calculateInitialAbility(progress: HistoricalProgress[], subject: string, year: number): number {
  // Filter relevant historical progress
  const relevantProgress = progress.filter(p =>
    (!subject || p.subject === subject) &&
    (!year || p.year === year)
  );

  // Default to 0.5 if no historical data
  if (relevantProgress.length === 0) return 0.5;

  // Calculate weighted average of topic progress
  // Passed quizzes get higher weight (1.2) while failed (0.8)
  const weightedSum = relevantProgress.reduce((sum, p) => {
    const weight = p.quizPassed ? 1.2 : 0.8;
    return sum + (p.topicProgress / 100) * weight;
  }, 0);

  const totalWeight = relevantProgress.reduce((sum, p) => {
    return sum + (p.quizPassed ? 1.2 : 0.8);
  }, 0);

  //clamping operation using nested Math.max and Math.min
  //constrain value within practical range(0.2 to 0.9)
  // to prevent unrealistic ability estimates
  const averageProgress = weightedSum / totalWeight;
  return Math.max(0.2, Math.min(0.9, averageProgress));
}

export function identifyWeakTopics(progress: HistoricalProgress[], subject: string, year: number): string[] {
  return progress
    .filter(p => {
      const isSameSubject = !subject || p.subject === subject;
      const isSameYear = !year || p.year === year;
      const isWeak = p.topicProgress < 50 || !p.quizPassed;
      return isWeak && isSameSubject && isSameYear;
    })
    .map(p => `${p.year}-${p.subject}-${p.topic}`)
    .slice(0, 3);
}

// Flexible topic matching function
export function isTopicMatch(questionTopic: string, sessionTopic: string): boolean {
  // Exact match
  if (questionTopic === sessionTopic) return true;

  // Normalize both topics for comparison
  const normalizeTopic = (topic: string) => topic.toLowerCase()
    .replace(/tahun/g, 'year')  // Convert "tahun" to "year"
    .replace(/unit\s*\d+:\s*/g, '') // Remove "unit X: " patterns
    .replace(/semasa\s+/g, '') // Remove "semasa " prefix
    .trim();

  const normalizedQuestion = normalizeTopic(questionTopic);
  const normalizedSession = normalizeTopic(sessionTopic);

  // Check if the base topic matches (e.g., "kelahiran nabi muhammad" matches "kelahiran nabi muhammad")
  return normalizedQuestion.includes(normalizedSession) ||
         normalizedSession.includes(normalizedQuestion) ||
         // Handle partial matches for similar topics
         normalizedQuestion.split(' ').some(word => normalizedSession.includes(word) && word.length > 3);
}

export function selectNextQuestion(session: QuizSession): Question | null {
  if (session.questionsAnswered >= session.totalQuestions) return null;

  // First, check if we should repeat an incorrect question (after 70% of questions answered)
  const isRepetitionPhase = session.questionsAnswered >= session.totalQuestions * 0.7;
  if (isRepetitionPhase && session.incorrectQuestions.length > 0) {
    // Select a random incorrect question to repeat
    const questionIdToRepeat = session.incorrectQuestions[Math.floor(Math.random() * session.incorrectQuestions.length)];
    const questionToRepeat = session.availableQuestions.find(q => q.id === questionIdToRepeat);
    if (questionToRepeat) {
      return questionToRepeat;
    }
  }

  // Prioritize weak topic questions throughout the quiz (not just first question)
  if (session.weakTopics.length > 0) {
    const weakTopicQuestions = session.availableQuestions.filter(q =>
      session.weakTopics.some(weakTopic => isTopicMatch(q.topic, weakTopic.replace(/^\d{4}-[^-]+-/, ''))) &&
      !session.answeredQuestions.includes(q.id)
    );

    if (weakTopicQuestions.length > 0) {
      const targetDifficulty = getTargetDifficulty(session.abilityEstimate);
      const candidates = weakTopicQuestions.filter(q =>
        getDifficultyScore(q.difficulty) <= targetDifficulty + 0.3 &&
        getDifficultyScore(q.difficulty) >= targetDifficulty - 0.3
      );

    if (candidates.length > 0) {
      const selectedQuestion = candidates[Math.floor(Math.random() * candidates.length)];
      // Mark this question as remedial in the quiz session only if it's not from the current topic
      if (!session.remedialQuestions.includes(selectedQuestion.id) && !isTopicMatch(selectedQuestion.topic, session.topic)) {
        session.remedialQuestions.push(selectedQuestion.id);
      }
      return selectedQuestion;
    }
    }
  }

  // Regular adaptive selection - from current topic or related sub-topics
  const availableQuestions = session.availableQuestions.filter(q =>
    !session.answeredQuestions.includes(q.id) &&
    isTopicMatch(q.topic, session.topic) // Allow flexible topic matching
  );

  if (availableQuestions.length === 0) return null;

  // Select questions within ±0.3 range of target difficulty
  const targetDifficulty = getTargetDifficulty(session.abilityEstimate);
  const candidates = availableQuestions.filter(q =>
    getDifficultyScore(q.difficulty) <= targetDifficulty + 0.3 &&
    getDifficultyScore(q.difficulty) >= targetDifficulty - 0.3
  );

  return candidates.length > 0
    ? candidates[Math.floor(Math.random() * candidates.length)]
    : availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
}

// Map ability to target difficulty
export function getTargetDifficulty(ability: number): number {
  if (ability < 0.4) return 0.3; // Easy
  if (ability < 0.7) return 0.5; // Medium
  return 0.7; // Hard
}

// Map difficulty strings to numeric scores
export function getDifficultyScore(difficulty: string): number {
  switch (difficulty) {
    case 'easy': return 0.3;
    case 'medium': return 0.5;
    case 'hard': return 0.7;
    default: return 0.5;
  }
}

export function updateAbilityEstimate(currentAbility: number, difficulty: string, isCorrect: boolean): 
number { // Convert difficulty string to numeric value
  const difficultyScore = getDifficultyScore(difficulty);

  // Calculate expected performance using logistic function
  // P(correct) = 1 / (1 + e^(-(ability - difficulty)))
  const expectedScore = 1 / (1 + Math.exp(-(currentAbility - difficultyScore)));
    // Calculate update delta with learning rate of 0.1
  const delta = 0.1 * (isCorrect ? 1 - expectedScore : -expectedScore);
  // Update ability and clamp between 0.1 and 0.9
  return Math.max(0.1, Math.min(0.9, currentAbility + delta));
}

export function generatePerformanceFeedback(isCorrect: boolean, difficulty: string, answeredWithinTime: boolean, consecutiveWrongAnswers: number): string {
  if (isCorrect) {
    let feedback = "Bagus! ";
    if (answeredWithinTime) {
      feedback += "Anda menjawab dengan cepat dan betul. ";
    } else {
      feedback += "Anda mendapat jawapan yang betul. ";
    }

    if (difficulty === 'hard') {
      feedback += "Soalan ini mencabar - anda lakukan dengan baik!";
    } else if (difficulty === 'medium') {
      feedback += "Pemahaman yang kukuh ditunjukkan di sini.";
    } else {
      feedback += "Teruskan usaha yang baik!";
    }
    return feedback;
  } else {
    let feedback = "Tidak betul sepenuhnya. ";
    if (consecutiveWrongAnswers > 1) {
      feedback += "Pertimbangkan menggunakan petunjuk jika tersedia. ";
    }

    if (difficulty === 'easy') {
      feedback += "Ini adalah konsep asas - semak semula asas.";
    } else if (difficulty === 'medium') {
      feedback += "Konsep ini memerlukan lebih banyak latihan.";
    } else {
      feedback += "Ini mencabar - jangan risau, terus cuba!";
    }
    return feedback;
  }
}
