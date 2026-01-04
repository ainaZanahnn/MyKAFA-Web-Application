import axios from '@/lib/axios';

export interface QuizSession {
  sessionId: string;
  initialAbility: number;
  weakTopics: string[];
  totalQuestions: number;
}

export interface QuestionResponse {
  id: number;
  question: string;
  options: string[];
  hints: string[];
  correct_answers: number | number[];
  difficulty: string;
  isWeakTopicQuestion: boolean;
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
  totalPoints: number;
  answeredWithinTime: boolean;
  feedback: string;
  abilityEstimate: number;
  isWeakTopicQuestion: boolean;
  sessionProgress: {
    current: number;
    total: number;
    abilityEstimate: number;
  };
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
  weakTopicScore: number;
  weakTopicQuestions: number;
  weakTopicPercentage: number;
  totalScore: number;
  timeSpent: number;
  abilityEstimate: number;
  weakTopics: string[];
}

class AdaptiveQuizService {
  private baseURL = '/adaptive-quiz';

  async startQuiz(userId: string, year: number, subject: string, topic: string, maxQuestions: number = 10): Promise<QuizSession> {
    const response = await axios.post(`${this.baseURL}/start`, {
      userId,
      year,
      subject,
      topic,
      maxQuestions
    });
    return response.data;
  }

  async getNextQuestion(sessionId: string): Promise<QuestionResponse | { completed: true }> {
    const response = await axios.get(`${this.baseURL}/question/${sessionId}`);
    return response.data;
  }

  async submitAnswer(sessionId: string, questionId: number, answer: number | number[], timeSpent: number): Promise<AnswerResponse> {
    const response = await axios.post(`${this.baseURL}/answer/${sessionId}`, {
      questionId,
      answer,
      timeSpent
    });
    return response.data;
  }

  async getResults(sessionId: string): Promise<QuizResults> {
    const response = await axios.get(`${this.baseURL}/results/${sessionId}`);
    return response.data;
  }

  async requestHint(sessionId: string): Promise<{
    hint: string;
    hintIndex: number;
    penalty: number;
    totalScore: number;
    hintsRemaining: number;
  }> {
    const response = await axios.post(`${this.baseURL}/hint/${sessionId}`);
    return response.data;
  }
}

export const adaptiveQuizService = new AdaptiveQuizService();
