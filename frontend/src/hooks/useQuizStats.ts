import { useState, useEffect } from 'react';
import quizService from '@/services/quizService';
import type { QuizStats } from '@/types/kafaTypes';

/**
 * Custom hook for loading and managing quiz statistics
 * Handles fetching user quiz stats for a specific topic
 */
export function useQuizStats(year: number, subject: string, topic: string) {
  const [stats, setStats] = useState<QuizStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load quiz statistics for the current user and topic
   */
  const loadStats = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const userStats = await quizService.getQuizStats(year, subject, topic);
      setStats(userStats);
    } catch (err) {
      console.error('Failed to load quiz stats:', err);
      setError('Failed to load quiz statistics');
      // Set default stats on error
      setStats({
        totalAttempts: 0,
        bestScore: 0,
        lastScore: 0,
        passed: false,
        lastActivity: null
      });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Refresh stats (useful after quiz completion)
   */
  const refreshStats = () => {
    loadStats();
  };

  // Load stats on mount and when parameters change
  useEffect(() => {
    loadStats();
  }, [year, subject,topic]);

  return {
    stats,
    isLoading,
    error,
    refreshStats
  };
}
