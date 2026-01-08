import { Question, QuizSession, HistoricalProgress } from '../types/adaptiveQuizTypes';

export function calculateInitialAbility(progress: HistoricalProgress[], subject: string, year: number): number {
  const relevantProgress = progress.filter(p =>
    (!subject || p.subject === subject) &&
    (!year || p.year === year)
  );

  if (relevantProgress.length === 0) return 0.5;

  const weightedSum = relevantProgress.reduce((sum, p) => {
    const weight = p.quizPassed ? 1.2 : 0.8;
    return sum + (p.topicProgress / 100) * weight;
  }, 0);

  const totalWeight = relevantProgress.reduce((sum, p) => {
    return sum + (p.quizPassed ? 1.2 : 0.8);
  }, 0);

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

  // First 30% of questions: prioritize weak topics
  const isRemediationPhase = session.questionsAnswered < session.totalQuestions * 0.3;

  if (isRemediationPhase && session.weakTopics.length > 0) {
    const weakTopicQuestions = session.availableQuestions.filter(q =>
      session.weakTopics.some(weakTopic => weakTopic.includes(q.topic)) &&
      !session.answeredQuestions.includes(q.id)
    );

    if (weakTopicQuestions.length > 0) {
      const targetDifficulty = getTargetDifficulty(session.abilityEstimate);
      const candidates = weakTopicQuestions.filter(q =>
        getDifficultyScore(q.difficulty) <= targetDifficulty + 0.3 &&
        getDifficultyScore(q.difficulty) >= targetDifficulty - 0.3
      );

      if (candidates.length > 0) {
        return candidates[Math.floor(Math.random() * candidates.length)];
      }
    }
  }

  // Regular adaptive selection
  const availableQuestions = session.availableQuestions.filter(q =>
    !session.answeredQuestions.includes(q.id)
  );

  if (availableQuestions.length === 0) return null;

  const targetDifficulty = getTargetDifficulty(session.abilityEstimate);
  const candidates = availableQuestions.filter(q =>
    getDifficultyScore(q.difficulty) <= targetDifficulty + 0.3 &&
    getDifficultyScore(q.difficulty) >= targetDifficulty - 0.3
  );

  return candidates.length > 0
    ? candidates[Math.floor(Math.random() * candidates.length)]
    : availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
}

export function getTargetDifficulty(ability: number): number {
  if (ability < 0.4) return 0.3; // Easy
  if (ability < 0.7) return 0.5; // Medium
  return 0.7; // Hard
}

export function getDifficultyScore(difficulty: string): number {
  switch (difficulty) {
    case 'easy': return 0.3;
    case 'medium': return 0.5;
    case 'hard': return 0.7;
    default: return 0.5;
  }
}

export function updateAbilityEstimate(currentAbility: number, difficulty: string, isCorrect: boolean): number {
  const difficultyScore = getDifficultyScore(difficulty);
  const expectedScore = 1 / (1 + Math.exp(-(currentAbility - difficultyScore)));
  const delta = 0.1 * (isCorrect ? 1 - expectedScore : -expectedScore);
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
