import { adaptiveQuizService } from '@/lib/AdaptiveQuizService';
import type { QuizSummary, AdaptiveQuizSettings } from '@/lib/AdaptiveQuizEngine';

/**
 * Service for handling quiz flow business logic
 * Separates complex quiz logic from UI components
 */
export class QuizFlowService {
  /**
   * Complete a quiz and get results
   */
  static async completeQuiz(sessionId: string): Promise<QuizSummary> {
    try {
      const results = await adaptiveQuizService.getResults(sessionId);

      // Use current topic data (excluding remedial questions)
      const correctAnswers = results.currentTopicScore || 0;
      const totalQuestions = results.currentTopicQuestions || results.totalQuestions || 0;

      // Convert backend results to QuizSummary format
      const summary: QuizSummary = {
        totalQuestions: totalQuestions, // Use current topic questions count (excludes remedial)
        correctAnswers: Math.max(0, correctAnswers), // Ensure non-negative
        totalScore: results.totalScore || 0, // This is already adjusted in backend
        questionScores: results.questionScores || [], // Add question scores
        answers: [], // Not available from backend
        averageTime: results.questionsAnswered > 0 ? results.timeSpent / results.questionsAnswered : 0,
        timeSpent: results.timeSpent || 0,
        abilityEstimate: results.abilityEstimate || 0,
        difficultyDistribution: {
          easy: 0, // Not available from backend
          medium: 0,
          hard: 0
        },
        questionHistory: [] // Not available from backend
      };

      return summary;
    } catch (error) {
      console.error('Failed to get quiz results:', error);
      throw error;
    }
  }

  /**
   * Calculate time spent on a question
   */
  static calculateTimeSpent(questionStartTime: number): number {
    return Math.round((Date.now() - questionStartTime) / 1000);
  }

  /**
   * Validate quiz settings before starting
   */
  static validateQuizSettings(settings: AdaptiveQuizSettings): { isValid: boolean; error?: string } {
    if (!settings.maxQuestions || settings.maxQuestions <= 0) {
      return { isValid: false, error: 'Maximum questions must be greater than 0' };
    }

    if (settings.maxQuestions > 50) {
      return { isValid: false, error: 'Maximum questions cannot exceed 50' };
    }

    if (settings.timeLimit && (settings.timeLimit <= 0 || settings.timeLimit > 120)) {
      return { isValid: false, error: 'Time limit must be between 1 and 120 minutes' };
    }

    return { isValid: true };
  }

  /**
   * Determine if quiz should auto-advance to next screen
   */
  static shouldAutoAdvance(currentScreen: string, lastAction: string): boolean {
    const autoAdvanceScreens = ['countdown', 'feedback'];
    return autoAdvanceScreens.includes(currentScreen) && lastAction === 'submit';
  }

  /**
   * Get countdown duration based on quiz settings
   */
  static getCountdownDuration(settings: AdaptiveQuizSettings): number {
    // Shorter countdown for quick quizzes
    if (settings.maxQuestions <= 5) return 2;
    if (settings.maxQuestions <= 15) return 3;
    return 5;
  }

  /**
   * Check if user can retry the quiz
   */
  static canRetryQuiz(stats: { passed?: boolean; totalAttempts?: number }): boolean {
    // Allow retry if they haven't reached max attempts or haven't passed
    const maxRetries = 3;
    return !stats?.passed && (stats?.totalAttempts || 0) < maxRetries;
  }

  /**
   * Generate quiz completion message based on performance
   */
  static getCompletionMessage(summary: QuizSummary): string {
    const percentage = (summary.correctAnswers / summary.totalQuestions) * 100;

    if (percentage >= 90) {
      return 'Cemerlang! Anda telah menguasai topik ini dengan baik.';
    } else if (percentage >= 75) {
      return 'Bagus! Anda telah menunjukkan pemahaman yang baik.';
    } else if (percentage >= 60) {
      return 'Baik! Teruskan usaha untuk meningkatkan prestasi.';
    } else {
      return 'Anda perlu lebih banyak latihan untuk menguasai topik ini.';
    }
  }

  /**
   * Calculate recommended study time based on performance
   */
  static getRecommendedStudyTime(summary: QuizSummary): number {
    const percentage = (summary.correctAnswers / summary.totalQuestions) * 100;

    if (percentage >= 80) return 15; // 15 minutes review
    if (percentage >= 60) return 30; // 30 minutes review
    return 60; // 1 hour additional study
  }
}
