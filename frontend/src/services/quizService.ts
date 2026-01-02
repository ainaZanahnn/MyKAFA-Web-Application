import apiClient from '@/lib/axios';

export interface Question {
  id?: number;
  questionText: string;
  options: string[];
  correctAnswers: string[];
  answerType: 'single' | 'multiple';
  sentenceWithBlanks?: string;
  answerPool?: string[];
  blankMapping?: Record<string, unknown>[];
  instruction?: string;
  items?: Record<string, unknown>[];
  targets?: Record<string, unknown>[];
  mapping?: Record<string, unknown>[];
  difficulty: 'easy' | 'medium' | 'hard';
  hints?: string[];
}

export interface Quiz {
  id: number;
  year: number;
  subject: string;
  topic: string;
  quizType: string;
  questions: Question[];
  questionCount?: number;
  status: 'draf' | 'diterbitkan' | 'diarkibkan';
  created_at?: string;
}

export interface CreateQuizData {
  year: number;
  subject: string;
  topic: string;
  quizType: string;
  questions: Question[];
  status?: string;
}

export interface UpdateQuizData {
  year?: number;
  subject?: string;
  topic?: string;
  quizType?: string;
  status?: string;
  questions?: Question[];
}

class QuizService {
  async getQuizzes(): Promise<{ quizzes: Quiz[]; success: boolean }> {
    const response = await apiClient.get('/admin/quizzes');
    return response.data;
  }

  async getQuiz(id: number): Promise<{ quiz: Quiz; success: boolean }> {
    const response = await apiClient.get(`/admin/quizzes/${id}`);
    return response.data;
  }

  async createQuiz(data: CreateQuizData): Promise<{ success: boolean; message?: string }> {
    const response = await apiClient.post('/admin/quizzes', data);
    return response.data;
  }

  async updateQuiz(id: number, data: UpdateQuizData): Promise<{ success: boolean; message?: string }> {
    const response = await apiClient.put(`/admin/quizzes/${id}`, data);
    return response.data;
  }

  async deleteQuiz(id: number): Promise<{ success: boolean; message?: string }> {
    const response = await apiClient.delete(`/admin/quizzes/${id}`);
    return response.data;
  }

  async updateQuizStatus(id: number, status: 'draf' | 'diterbitkan' | 'diarkibkan'): Promise<{ success: boolean; message?: string }> {
    const response = await apiClient.put(`/admin/quizzes/${id}`, { status });
    return response.data;
  }

  async getStudentQuiz(year: number, subject: string, topic: string): Promise<{ quiz: Quiz; success: boolean }> {
    const response = await apiClient.get(`/api/quizzes/student/${year}/${subject}/${topic}`);
    return response.data;
  }
}

export default new QuizService();
