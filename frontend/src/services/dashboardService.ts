import axios from '@/lib/axios';

export interface SubjectYearAbility {
  subject: string;
  year: number;
  ability: number;
  maxAbility: number;
  attempts: number;
}

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
  currentAbility: number;
  highestAbility: number;
  totalQuizAttempts: number;
  subjectYearAbilities: SubjectYearAbility[];
}

class DashboardService {
  async getDashboardData(): Promise<DashboardData> {
    try {
      const response = await axios.get('/dashboard/student');
      const data = response.data.data;

      // Convert level system from Tingkatan to Malay Year-based
      let currentLevel = data.currentLevel;
      if (currentLevel === 'Tingkatan 1') {
        currentLevel = 'Tahun 1';
      } else if (currentLevel === 'Tingkatan 2') {
        currentLevel = 'Tahun 2';
      } else if (currentLevel === 'Tingkatan 3') {
        currentLevel = 'Tahun 3';
      }

      return {
        lessonsCompleted: data.lessonsCompleted,
        quizPoints: data.quizPoints,
        currentLevel,
        quizzesPassed: data.quizzesPassed,
        weakAreas: data.weakAreas,
        currentAbility: data.currentAbility || 0.5,
        highestAbility: data.highestAbility || 0.5,
        totalQuizAttempts: data.totalQuizAttempts || 0,
        subjectYearAbilities: data.subjectYearAbilities || []
      };
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Return default data if API calls fail
      return {
        lessonsCompleted: 0,
        quizPoints: 0,
        currentLevel: 'Tahun 1',
        quizzesPassed: 0,
        weakAreas: [
          {
            subject: 'Ralat Sistem',
            topic: 'Tidak dapat memuatkan data',
            issue: 'Sila cuba lagi kemudian',
            recommendation: 'Periksa sambungan internet anda'
          }
        ],
        currentAbility: 0.5,
        highestAbility: 0.5,
        totalQuizAttempts: 0,
        subjectYearAbilities: []
      };
    }
  }
}

const dashboardService = new DashboardService();
export default dashboardService;
