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
  weakTopicScore: number;
  totalQuestions: number;
  currentTopicQuestions: number;
  weakTopicQuestions: number;
  timeSpent: number;
  startTime: Date;
  isCompleted: boolean;
  weakTopics: string[];
  availableQuestions: Question[];
  answeredQuestions: number[];
  consecutiveWrongAnswers: number;
  hintsUsed: number;
  currentHintsUsed: number;
  questionAttempts: Map<number, { attempts: number; correct: boolean; hintsUsed: number }>;
  incorrectQuestions: number[];
}
