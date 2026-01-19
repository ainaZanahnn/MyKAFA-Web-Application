export interface QuestionOption {
  id: string;
  text: string;
}

export interface Question {
  id: number;
  question: string;
  options: QuestionOption[];
  correct_answers: string[];
  hints: string[];
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  year?: number;
  subject?: string;
}

export interface HistoricalProgress {
  year: number;
  subject: string;
  topic: string;
  topicProgress: number;
  quizScore: number;
  quizPassed: boolean;
  materialsViewed: number;
  totalMaterials: number;
}

export interface QuizSession {
  sessionId: string;
  userId: number;
  year: number;
  subject: string;
  topic: string;
  currentQuestionIndex: number;
  currentQuestion: Question | null;
  abilityEstimate: number;
  questionsAnswered: number;
  uniqueQuestionsAnswered: number;
  totalScore: number;
  currentTopicScore: number;
  totalQuestions: number;
  currentTopicQuestions: number;
  timeSpent: number;
  startTime: Date;
  isCompleted: boolean;
  weakTopics: string[];
  availableQuestions: Question[];
  answeredQuestions: number[];
  consecutiveWrongAnswers: number;
  hintsUsed: number;
  currentHintsUsed: number;
  remedialQuestions: number[]; // Track questions from weak topics
  questionAttempts: Map<number, { attempts: number; correct: boolean; hintsUsed: number }>;
  incorrectQuestions: number[];
  questionScores: {
    questionId: number;
    question: string;
    difficulty: 'easy' | 'medium' | 'hard';
    isCorrect: boolean;
    points: number;
    timeSpent: number;
    attempts?: number;
    hintsUsed?: number;
    baseScore?: number;
    timeBonus?: number;
    partialCredit?: number;
    hintPenalty?: number;
    answeredWithinTime?: boolean;
    isRemedial?: boolean; // Mark if this is a remedial question
  }[];
}
