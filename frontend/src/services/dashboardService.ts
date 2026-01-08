import axios from '@/lib/axios';

export interface DashboardData {
  lessonsCompleted: number;
  quizPoints: number;
  currentLevel: string;
  quizzesPassed: number;
  weakAreas: Array<{
    subject: string;
    topic: string;
    issue: string;
    recommendation: string;
  }>;
}

class DashboardService {
  async getDashboardData(): Promise<DashboardData> {
    try {
      const response = await axios.get('/dashboard/student');
      const data = response.data.data;

      // Convert level system from Tingkatan to Year-based
      let currentLevel = data.currentLevel;
      if (currentLevel === 'Tingkatan 1') {
        currentLevel = 'Year 1';
      } else if (currentLevel === 'Tingkatan 2') {
        currentLevel = 'Year 2';
      } else if (currentLevel === 'Tingkatan 3') {
        currentLevel = 'Year 3';
      }

      return {
        lessonsCompleted: data.lessonsCompleted,
        quizPoints: data.quizPoints,
        currentLevel,
        quizzesPassed: data.quizzesPassed,
        weakAreas: data.weakAreas
      };
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Return default data if API calls fail
      return {
        lessonsCompleted: 0,
        quizPoints: 0,
        currentLevel: 'Year 1',
        quizzesPassed: 0,
        weakAreas: [
          {
            subject: 'Ralat Sistem',
            topic: 'Tidak dapat memuatkan data',
            issue: 'Sila cuba lagi kemudian',
            recommendation: 'Periksa sambungan internet anda'
          }
        ]
      };
    }
  }
}

const dashboardService = new DashboardService();
export default dashboardService;
