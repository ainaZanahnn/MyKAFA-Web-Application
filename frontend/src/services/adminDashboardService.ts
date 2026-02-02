import apiClient from '@/lib/axios';

export interface TopPerformer {
  name: string;
  avgScore: number;
  quizzesTaken: number;
}

export interface AdminDashboardData {
  totalStudents: number;
  activeStudents: number;
  totalQuizzes: number;
  studentsNeedingAttention: number;
  dailyUserData: Array<{
    name: string;
    users: number;
  }>;
  topPerformers: TopPerformer[];
}

class AdminDashboardService {
  async getDashboardData(): Promise<AdminDashboardData> {
    try {
      const response = await apiClient.get('/dashboard/admin');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching admin dashboard data:', error);
      // Return default data if API fails
      return {
        totalStudents: 0,
        activeStudents: 0,
        totalQuizzes: 0,
        studentsNeedingAttention: 0,
        dailyUserData: [],
        topPerformers: []
      };
    }
  }
}

const adminDashboardService = new AdminDashboardService();
export default adminDashboardService;
