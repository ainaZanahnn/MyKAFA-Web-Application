// Shared utilities for quiz functionality across the application

// Status mapping between English (DB) and Malay (Frontend)
export const statusMap = {
  'draft': 'draf',
  'published': 'diterbitkan',
  'archived': 'diarkibkan'
};

export const reverseStatusMap = {
  'draf': 'draft',
  'diterbitkan': 'published',
  'diarkibkan': 'archived'
};

// Quiz validation utilities
export const validateQuizInput = (year: number, subject: string, topic: string, quizType?: string) => {
  if (!year || !subject || !topic) {
    return { isValid: false, error: 'Year, subject, and topic are required' };
  }

  if (year < 1 || year > 6) {
    return { isValid: false, error: 'Year must be between 1 and 6' };
  }

  if (quizType && !['mcq', 'truefalse', 'shortanswer'].includes(quizType)) {
    return { isValid: false, error: 'Invalid quiz type' };
  }

  return { isValid: true };
};

// Convert status for display
export const getDisplayStatus = (dbStatus: string): string => {
  return statusMap[dbStatus as keyof typeof statusMap] || dbStatus;
};

// Convert status for database storage
export const getDbStatus = (displayStatus: string): string => {
  return reverseStatusMap[displayStatus as keyof typeof reverseStatusMap] || displayStatus;
};

// Validate quiz status
export const validateQuizStatus = (status: string): { isValid: boolean; error?: string } => {
  const validStatuses = ['draf', 'diterbitkan', 'diarkibkan'];
  if (!validStatuses.includes(status)) {
    return { isValid: false, error: 'Invalid status. Must be draf, diterbitkan, or diarkibkan' };
  }
  return { isValid: true };
};

// Quiz question validation
export const validateQuizQuestion = (question: any): { isValid: boolean; error?: string } => {
  if (!question.questionText || question.questionText.trim() === '') {
    return { isValid: false, error: 'Question text is required' };
  }

  if (!question.options || !Array.isArray(question.options) || question.options.length < 2) {
    return { isValid: false, error: 'At least 2 options are required' };
  }

  if (!question.correctAnswers || (!Array.isArray(question.correctAnswers) && typeof question.correctAnswers !== 'number')) {
    return { isValid: false, error: 'Correct answers are required' };
  }

  return { isValid: true };
};

// Difficulty levels
export const DIFFICULTY_LEVELS = {
  EASY: 'easy',
  MEDIUM: 'medium',
  HARD: 'hard'
} as const;

export type DifficultyLevel = typeof DIFFICULTY_LEVELS[keyof typeof DIFFICULTY_LEVELS];

// Quiz types
export const QUIZ_TYPES = {
  MCQ: 'mcq',
  TRUE_FALSE: 'truefalse',
  SHORT_ANSWER: 'shortanswer'
} as const;

export type QuizType = typeof QUIZ_TYPES[keyof typeof QUIZ_TYPES];
