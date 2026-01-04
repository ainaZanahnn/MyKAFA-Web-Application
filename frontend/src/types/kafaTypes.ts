export interface Subject {
  id: number;
  name: string;
  icon: string;
  color: string;
}

export interface QuizStats {
  totalAttempts: number;
  bestScore: number;
  lastScore: number;
  passed: boolean;
  lastActivity: string | null;
}
