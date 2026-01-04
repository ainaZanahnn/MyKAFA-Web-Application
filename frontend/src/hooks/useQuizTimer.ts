import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for managing quiz timer functionality
 * Handles countdown timer with auto-submit capability
 */
export function useQuizTimer(
  initialTime: number,
  onTimeUp?: () => void,
  autoSubmitOnTimeUp: boolean = true
) {
  const [timeLeft, setTimeLeft] = useState<number>(initialTime);
  const [isActive, setIsActive] = useState(false);
  const [hasAutoSubmitted, setHasAutoSubmitted] = useState(false);

  /**
   * Start the timer
   */
  const startTimer = useCallback(() => {
    setIsActive(true);
    setTimeLeft(initialTime);
    setHasAutoSubmitted(false);
  }, [initialTime]);

  /**
   * Stop the timer
   */
  const stopTimer = useCallback(() => {
    setIsActive(false);
  }, []);

  /**
   * Reset the timer
   */
  const resetTimer = useCallback(() => {
    setIsActive(false);
    setTimeLeft(initialTime);
    setHasAutoSubmitted(false);
  }, [initialTime]);

  /**
   * Update timer when initial time changes (for new questions)
   */
  useEffect(() => {
    setTimeLeft(initialTime);
    setHasAutoSubmitted(false);
  }, [initialTime]);

  /**
   * Timer countdown effect
   */
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(time => {
          const newTime = time - 1;

          // When time reaches 0
          if (newTime <= 0) {
            setIsActive(false);
            if (autoSubmitOnTimeUp && !hasAutoSubmitted) {
              setHasAutoSubmitted(true);
              onTimeUp?.();
            }
            return 0;
          }

          return newTime;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft, onTimeUp, autoSubmitOnTimeUp, hasAutoSubmitted]);

  /**
   * Format time as MM:SS
   */
  const formatTime = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  /**
   * Get progress percentage for UI display
   */
  const getProgressPercentage = useCallback((totalTime: number = initialTime): number => {
    return (timeLeft / totalTime) * 100;
  }, [timeLeft, initialTime]);

  /**
   * Check if timer is in warning state (last 10 seconds)
   */
  const isWarning = timeLeft <= 10 && timeLeft > 0;

  /**
   * Check if timer is critical (last 5 seconds)
   */
  const isCritical = timeLeft <= 5 && timeLeft > 0;

  return {
    // State
    timeLeft,
    isActive,
    hasAutoSubmitted,
    isWarning,
    isCritical,

    // Actions
    startTimer,
    stopTimer,
    resetTimer,

    // Utilities
    formatTime,
    getProgressPercentage
  };
}
