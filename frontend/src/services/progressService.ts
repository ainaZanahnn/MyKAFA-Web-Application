import axios from '@/lib/axios';

export interface StudentProgress {
  id?: number;
  user_id: number;
  year: number;
  subject: string;
  topic: string;
  lesson_completed?: boolean;
  lesson_completed_at?: Date | null;
  topic_completed?: boolean;
  created_at?: Date;
  updated_at?: Date;
}

class ProgressService {
  async getProgress(): Promise<{ progress: StudentProgress[] }> {
    const response = await axios.get('/progress');
    return response.data;
  }

  async initializeProgress(registrationYear: number): Promise<void> {
    await axios.post('/progress/initialize', { registrationYear });
  }

  async completeTopic(year: number, subject: string, topic: string): Promise<void> {
    await axios.post('/progress/complete-topic', { year, subject, topic });
  }

  async markMaterialViewed(year: number, subject: string, topic: string, materialId: number): Promise<void> {
    await axios.post('/progress/mark-material-viewed', { year, subject, topic, materialId });
  }

  async getMaterialProgress(year: number, subject: string, topic: string): Promise<{ materialsViewed: number[] }> {
    const response = await axios.get(`/progress/material-progress?year=${year}&subject=${subject}&topic=${topic}`);
    return response.data;
  }
}

export const progressService = new ProgressService();
