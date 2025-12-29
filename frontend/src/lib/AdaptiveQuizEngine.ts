export interface AdaptiveQuizSettings {
  maxQuestions: number;
  timeLimit?: number;
  difficultyAdjustment: 'conservative' | 'moderate' | 'aggressive';
  enableAIFeedback: boolean;
  scoringRules: {
    correctPoints: number;
    incorrectPenalty: number;
    timeBonus: number;
    hintPenalty: number;
  };
  questionDistribution?: {
    easy: number;
    medium: number;
    hard: number;
  };
}

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: string;
  difficulty: 'easy' | 'medium' | 'hard';
  topic: string;
  hints: string[];
  timeLimit: number;
  points: number;
}

export interface QuizSession {
  sessionId: string;
  userId: string;
  currentQuestion: Question | null;
  questionsAnswered: number;
  totalQuestions: number;
  abilityEstimate: number;
  consecutiveWrongAnswers: number;
  hintsUsed: number;
  currentHintsUsed: number;
  totalScore: number;
  timeSpent: number;
  questionHistory: {
    questionId: string;
    answeredCorrectly: boolean;
    difficulty: string;
    timeSpent: number;
    hintsUsed: number;
  }[];
  isCompleted: boolean;
}

export interface QuizSummary {
  totalQuestions: number;
  correctAnswers: number;
  totalScore: number;
  answers: {
    questionId: string;
    selectedAnswer: number;
    isCorrect: boolean;
    timeSpent: number;
  }[];
  averageTime?: number;
  timeSpent?: number;
  abilityEstimate?: number;
  difficultyDistribution?: {
    easy: number;
    medium: number;
    hard: number;
  };
  questionHistory?: {
    questionId: string;
    answeredCorrectly: boolean;
    difficulty: string;
    timeSpent: number;
    hintsUsed: number;
  }[];
  // Backend response properties
  sessionId?: string;
  userId?: string;
  questionsAnswered?: number;
  currentTopicScore?: number;
  currentTopicQuestions?: number;
  currentTopicPercentage?: number;
  quizPassed?: boolean;
  weakTopicScore?: number;
  weakTopicQuestions?: number;
  weakTopicPercentage?: number;
  weakTopics?: string[];
}

// Hint Logic Methods
export class AdaptiveQuizEngine {
  static shouldShowHint(session: QuizSession, settings: AdaptiveQuizSettings): boolean {
    if (!session.currentQuestion || session.currentQuestion.hints.length === 0) {
      return false;
    }

    const baseThreshold = this.getHintThreshold(session.abilityEstimate);
    const adjustment = settings.difficultyAdjustment === 'conservative' ? 1 :
                      settings.difficultyAdjustment === 'aggressive' ? -1 : 0;
    const threshold = Math.max(1, baseThreshold + adjustment);

    return session.consecutiveWrongAnswers >= threshold;
  }

  static getNextHint(session: QuizSession): string | null {
    if (!session.currentQuestion || session.currentQuestion.hints.length === 0) {
      return null;
    }

    if (session.currentHintsUsed < session.currentQuestion.hints.length) {
      return session.currentQuestion.hints[session.currentHintsUsed];
    }

    return null;
  }

  static consumeHint(session: QuizSession, settings: AdaptiveQuizSettings): { session: QuizSession; penalty: number } {
    const penalty = settings.scoringRules.hintPenalty;
    const updatedSession = {
      ...session,
      hintsUsed: session.hintsUsed + 1,
      currentHintsUsed: session.currentHintsUsed + 1,
      totalScore: Math.max(0, session.totalScore - penalty)
    };

    return { session: updatedSession, penalty };
  }

  static getHintThreshold(abilityEstimate: number): number {
    // Adaptive threshold: lower ability = easier hint access (fewer wrong attempts needed)
    if (abilityEstimate < 0.3) return 2; // Low ability: hints after 2 wrong attempts
    if (abilityEstimate < 0.6) return 3; // Medium ability: hints after 3 wrong attempts
    return 4; // High ability: hints after 4 wrong attempts
  }

  static updateConsecutiveWrongAnswers(session: QuizSession, isCorrect: boolean): QuizSession {
    return {
      ...session,
      consecutiveWrongAnswers: isCorrect ? 0 : session.consecutiveWrongAnswers + 1
    };
  }

  static resetCurrentHints(session: QuizSession): QuizSession {
    return {
      ...session,
      currentHintsUsed: 0
    };
  }
}
