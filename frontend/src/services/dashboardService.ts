import apiClient from '@/lib/axios';

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
  quizHistory?: Array<{
    subject: string;
    topic: string;
    year: number;
    lastScore: number;
    bestScore: number;
    totalAttempts: number;
    lastActivity: string;
    passed: boolean;
  }>;
  abilityProgression?: Array<{
    date: string;
    avgAbility: number;
    attempts: number;
  }>;
  lessonHistory?: Array<{
    subject: string;
    topic: string;
    completedAt: string;
    completed: boolean;
  }>;
}

class DashboardService {
  async getDashboardData(): Promise<DashboardData> {
    try {
      const response = await apiClient.get('/dashboard/student');
      const data = response.data.data;

      // Check if data exists and has the expected structure
      if (!data) {
        console.warn('No data received from dashboard API, using defaults');
        throw new Error('No data received');
      }

      // Convert level system from Tingkatan to Malay Year-based
      let currentLevel = data.currentLevel || 'Tahun 1';
      if (currentLevel === 'Tingkatan 1') {
        currentLevel = 'Tahun 1';
      } else if (currentLevel === 'Tingkatan 2') {
        currentLevel = 'Tahun 2';
      } else if (currentLevel === 'Tingkatan 3') {
        currentLevel = 'Tahun 3';
      }

      return {
        lessonsCompleted: data.lessonsCompleted || 0,
        quizPoints: data.quizPoints || 0,
        currentLevel,
        quizzesPassed: data.quizzesPassed || 0,
        weakAreas: data.weakAreas || [],
        currentAbility: data.currentAbility || 0.5,
        highestAbility: data.highestAbility || 0.5,
        totalQuizAttempts: data.totalQuizAttempts || 0,
        subjectYearAbilities: data.subjectYearAbilities || [],
        quizHistory: data.quizHistory || [],
        abilityProgression: data.abilityProgression || [],
        lessonHistory: data.lessonHistory || []
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

  async getStudentPrestasiById(studentId: number): Promise<DashboardData> {
    try {
      const response = await apiClient.get(`/dashboard/admin/student/${studentId}/prestasi`);
      const data = response.data.data;

      // Check if data exists and has the expected structure
      if (!data) {
        console.warn('No data received from student prestasi API, using defaults');
        throw new Error('No data received');
      }

      // Convert level system from Tingkatan to Malay Year-based
      let currentLevel = data.currentLevel || 'Tahun 1';
      if (currentLevel === 'Tingkatan 1') {
        currentLevel = 'Tahun 1';
      } else if (currentLevel === 'Tingkatan 2') {
        currentLevel = 'Tahun 2';
      } else if (currentLevel === 'Tingkatan 3') {
        currentLevel = 'Tahun 3';
      }

      return {
        lessonsCompleted: data.lessonsCompleted || 0,
        quizPoints: data.quizPoints || 0,
        currentLevel,
        quizzesPassed: data.quizzesPassed || 0,
        weakAreas: data.weakAreas || [],
        currentAbility: data.currentAbility || 0.5,
        highestAbility: data.highestAbility || 0.5,
        totalQuizAttempts: data.totalQuizAttempts || 0,
        subjectYearAbilities: data.subjectYearAbilities || []
      };
    } catch (error) {
      console.error('Error fetching student prestasi data:', error);
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
