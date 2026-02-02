import apiClient from '@/lib/axios';

export interface QuizSession {
  sessionId: string;
  initialAbility: number;
  weakTopics: string[];
  totalQuestions: number;
}

export interface QuestionResponse {
  id: number;
  question: string;
  options: { id: string; text: string }[];
  hints: string[];
  correct_answers: number | number[];
  difficulty: string;
  topic: string;
  progress: {
    current: number;
    total: number;
    abilityEstimate: number;
  };
}

export interface AnswerResponse {
  isCorrect: boolean;
  baseScore: number;
  timeBonus: number;
  partialCredit: number;
  hintPenalty: number;
  totalPoints: number;
  answeredWithinTime: boolean;
  feedback: string;
  abilityEstimate: number;
  weakTopics?: string[];
  sessionProgress: {
    current: number;
    total: number;
    abilityEstimate: number;
  };
}

export interface QuestionScore {
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
  isRemedial?: boolean;
}

export interface QuizResults {
  sessionId: string;
  userId: string;
  totalQuestions: number;
  questionsAnswered: number;
  currentTopicScore: number;
  currentTopicQuestions: number;
  currentTopicPercentage: number;
  quizPassed: boolean;
  totalScore: number;
  timeSpent: number;
  abilityEstimate: number;
  weakTopics: string[];
  questionScores?: QuestionScore[];
}

class AdaptiveQuizService {

  async startQuiz(userId: string, year: number, subject: string, topic: string, maxQuestions: number = 10): Promise<QuizSession> {
    const response = await apiClient.post('/adaptive-quiz/start', {
      userId,
      year,
      subject,
      topic,
      maxQuestions
    });
    return response.data;
  }

  async getNextQuestion(sessionId: string): Promise<QuestionResponse | { completed: true }> {
    const response = await apiClient.get(`/adaptive-quiz/question/${sessionId}`);
    return response.data;
  }

  async submitAnswer(sessionId: string, questionId: number, answer: string | string[], timeSpent: number): Promise<AnswerResponse> {
    const response = await apiClient.post(`/adaptive-quiz/answer/${sessionId}`, {
      questionId,
      answer,
      timeSpent
    });
    return response.data;
  }

  async getResults(sessionId: string): Promise<QuizResults> {
    const response = await apiClient.get(`/adaptive-quiz/results/${sessionId}`);
    return response.data;
  }

  async requestHint(sessionId: string): Promise<{
    hint: string;
    hintIndex: number;
    penalty: number;
    totalScore: number;
    hintsRemaining: number;
  }> {
    const response = await apiClient.post(`/adaptive-quiz/hint/${sessionId}`);
    return response.data;
  }
}

export const adaptiveQuizService = new AdaptiveQuizService();
