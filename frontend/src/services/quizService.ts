import apiClient from '@/lib/axios';
import type { QuizStats } from '@/types/kafaTypes';
import type { AdaptiveQuizSettings } from '../lib/AdaptiveQuizEngine';

export interface BackendQuiz {
  id: number;
  year: number;
  subject: string;
  topic: string;
  quiz_type?: string;
  status: string;
  questionCount?: number;
  question_count?: number;
}

export interface QuestionOption {
  id: string;
  text: string;
}

export interface Question {
  id?: number;
  questionText: string;
  options: QuestionOption[];
  correctAnswers: string[]; // Array of option IDs
  answerType: 'single' | 'multiple';
  difficulty: 'easy' | 'medium' | 'hard';
  hints?: string[];
  topic?: string;
  targets?: Record<string, unknown>[];
}

export interface QuizData {
  id?: number;
  year: number;
  subject: string;
  topic: string;
  quizType: string;
  questions: Question[];
  questionCount?: number;
  adaptiveSettings: AdaptiveQuizSettings;
  status?: 'draf' | 'diterbitkan' | 'diarkibkan';
}

class QuizService {
  async getQuizStats(year: number, subject: string, topic: string): Promise<QuizStats> {
    const response = await apiClient.get(`/quizzes/student/stats/${year}/${subject}/${topic}`);
    return response.data.stats;
  }

  async getStudentQuiz(year: number, subject: string, topic: string) {
    const response = await apiClient.get(`/quizzes/student/${year}/${subject}/${topic}`);
    return response.data;
  }

  async getQuizzes() {
    const response = await apiClient.get('/admin');
    return response.data;
  }

  async getQuiz(id: number) {
    const response = await apiClient.get(`/admin/${id}`);
    return {
      ...response.data,
      quizType: response.data.quiz_type || 'mcq',
      questionCount: response.data.question_count || response.data.questionCount || 0
    };
  }

  async createQuiz(quizData: unknown) {
    const response = await apiClient.post('/admin', quizData);
    return response.data;
  }

  async updateQuiz(id: number, quizData: unknown) {
    const response = await apiClient.put(`/admin/${id}`, quizData);
    return response.data;
  }

  async deleteQuiz(id: number) {
    const response = await apiClient.delete(`/admin/${id}`);
    return response.data;
  }

  async updateQuizStatus(id: number, status: string) {
    const response = await apiClient.put(`/admin/${id}/status`, { status });
    return response.data;
  }

  transformQuizDataToCreateQuizData(quizData: QuizData) {
    return {
      year: quizData.year,
      subject: quizData.subject,
      topic: quizData.topic,
      quizType: quizData.quizType,
      questions: quizData.questions.map(q => ({
        questionText: q.questionText,
        options: q.options,
        correctAnswers: q.correctAnswers,
        hints: q.hints,
        difficulty: q.difficulty
      }))
    };
  }
}

const quizService = new QuizService();
export default quizService;
