export interface AdaptiveQuizSettings {
  maxQuestions: number;
  timeLimit?: number;
  difficultyAdjustment: 'conservative' | 'moderate' | 'aggressive';
  enableAIFeedback: boolean;
  scoringRules: {
    correctPoints: number; // Points for correct answers
    incorrectPenalty: number; // Penalty for incorrect answers
    timeBonus: number; // Bonus points for fast answers
    hintPenalty: number; // Penalty points for using hints
  };
  questionDistribution?: {
    easy: number;
    medium: number;
    hard: number;
  };
  hintThresholds: {
    lowAbility: number; // Hints after X wrong attempts for low ability
    mediumAbility: number;
    highAbility: number;
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

// UI Helper Methods (Business logic moved to backend)
export class AdaptiveQuizEngine {
  // Simple UI helper for resetting hint state
  static resetCurrentHints(session: QuizSession): QuizSession {
    return {
      ...session,
      currentHintsUsed: 0
    };
  }
}
