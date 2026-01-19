import { useState, useEffect } from 'react';
import { adaptiveQuizService, type QuestionResponse, type AnswerResponse } from '@/lib/AdaptiveQuizService';
import type { AdaptiveQuizSettings, QuizSession } from '@/lib/AdaptiveQuizEngine';
import { useAuth } from '@/components/auth/useAuth';

/**
 * Custom hook for managing adaptive quiz session state
 * Handles session initialization, question loading, and answer submission
 */
export function useQuizSession(settings: AdaptiveQuizSettings, year: number, subject: string, topic: string) {
  const { user } = useAuth();

  // Session state
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<QuestionResponse | null>(null);
  const [session, setSession] = useState<QuizSession | null>(null);
  const [weakTopics, setWeakTopics] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingQuestion, setIsLoadingQuestion] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);

  // Hint state
  const [currentHint, setCurrentHint] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);

  // Answer feedback state
  const [lastAnswerResult, setLastAnswerResult] = useState<AnswerResponse | null>(null);

  // Track per-question attempts for hint logic
  const [questionAttempts, setQuestionAttempts] = useState<Map<number, { attempts: number; correct: boolean; hintsUsed: number }>>(new Map());

  /**
   * Initialize quiz session when component mounts
   */
  useEffect(() => {
    if (!quizStarted && user?.id) {
      startQuiz();
    }
  }, [user?.id, quizStarted]);

  /**
   * Start a new quiz session
   */
  const startQuiz = async () => {
    if (!user || !user.id) return;

    try {
      setIsLoading(true);
      setQuizStarted(true);

      const sessionData = await adaptiveQuizService.startQuiz(
        user.id.toString(),
        year,
        subject,
        topic,
        settings.maxQuestions
      );

      setSessionId(sessionData.sessionId);
      setWeakTopics(sessionData.weakTopics || []);

      // Initialize frontend session state for adaptive hints
      const initialSession: QuizSession = {
        sessionId: sessionData.sessionId,
        userId: user.id.toString(),
        abilityEstimate: sessionData.initialAbility,
        consecutiveWrongAnswers: 0,
        currentHintsUsed: 0,
        questionsAnswered: 0,
        totalScore: 0,
        timeSpent: 0,
        isCompleted: false,
        hintsUsed: 0,
        totalQuestions: settings.maxQuestions,
        questionHistory: [],
        currentQuestion: null,
        weakTopics: sessionData.weakTopics || []
      };

      setSession(initialSession);
      await loadNextQuestion(sessionData.sessionId);
    } catch (error) {
      console.error('Failed to start quiz:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Load the next question in the session
   */
  const loadNextQuestion = async (sid: string) => {
    if (isLoadingQuestion || !sid) return;

    try {
      setIsLoadingQuestion(true);
      setIsLoading(true);

      const response = await adaptiveQuizService.getNextQuestion(sid);

      if ('completed' in response) {
        // Quiz is completed, handle in parent component
        return { completed: true };
      }

      setCurrentQuestion(response);

      // Reset hint state for new question
      setCurrentHint(null);
      setShowHint(false);

      return response;
    } catch (error) {
      console.error('Failed to load question:', error);
      throw error; // Re-throw to allow parent component to handle
    } finally {
      setIsLoading(false);
      setIsLoadingQuestion(false);
    }
  };

  /**
   * Submit an answer for the current question
   */
  const submitAnswer = async (answer: number | number[], timeSpent: number) => {
    if (!sessionId || !currentQuestion) return;

    try {
      setIsLoading(true);

      // Convert answer indices to option IDs for backend compatibility
      let backendAnswer: string | string[];
      if (Array.isArray(answer)) {
        // Multiple choice: convert indices to option IDs
        backendAnswer = answer.map(index => currentQuestion.options[index]?.id || index.toString());
      } else {
        // Single choice: convert index to option ID
        backendAnswer = currentQuestion.options[answer]?.id || answer.toString();
      }

      const result = await adaptiveQuizService.submitAnswer(
        sessionId,
        currentQuestion.id,
        backendAnswer,
        timeSpent
      );

      setLastAnswerResult(result);

      // Update per-question attempts for hint logic
      const questionId = currentQuestion.id;
      const existingAttempts = questionAttempts.get(questionId) || { attempts: 0, correct: false, hintsUsed: 0 };
      const newAttempts = existingAttempts.attempts + 1;
      setQuestionAttempts(prev => new Map(prev).set(questionId, {
        attempts: newAttempts,
        correct: result.isCorrect,
        hintsUsed: existingAttempts.hintsUsed
      }));

      // Update session ability estimate and weak topics
      if (session) {
        setSession({
          ...session,
          abilityEstimate: result.abilityEstimate
        });
      }

      // Update weak topics from backend response
      if (result.weakTopics) {
        setWeakTopics(result.weakTopics);
      }

      return result;
    } catch (error) {
      console.error('Failed to submit answer:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle hint usage with adaptive logic
   */
  const handleUseHint = async () => {
    if (!currentQuestion || !sessionId) return;

    try {
      setIsLoading(true);

      const hintResponse = await adaptiveQuizService.requestHint(sessionId);

      setCurrentHint(hintResponse.hint);
      setShowHint(true);

      // Update per-question hints used
      const questionId = currentQuestion.id;
      const existingAttempts = questionAttempts.get(questionId) || { attempts: 0, correct: false, hintsUsed: 0 };
      setQuestionAttempts(prev => new Map(prev).set(questionId, {
        ...existingAttempts,
        hintsUsed: existingAttempts.hintsUsed + 1
      }));

      // Update session score after hint penalty
      if (session) {
        setSession({
          ...session,
          totalScore: hintResponse.totalScore
        });
      }
    } catch (error) {
      console.error('Failed to get hint:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Check if hints are available for current question
   * This function determines when the hint button appears on the student interface
   */
  const canShowHint = () => {
    if (!currentQuestion || !sessionId || !session) return false;

    // Check if question has hints available
    if (!currentQuestion.hints || currentQuestion.hints.length === 0) return false;

    // This tracks how many times the student has tried this specific question
    const questionId = currentQuestion.id;
    const attempts = questionAttempts.get(questionId) || { attempts: 0, correct: false, hintsUsed: 0 };
    const wrongAttemptsForQuestion = attempts.attempts - (attempts.correct ? 1 : 0);

    // Hints are available after wrong answer attempt
    // This triggers the hint button to appear on the student interface
    return wrongAttemptsForQuestion >= 1;
  };

  /**
   * Reset session state (for retry functionality)
   */
  const resetSession = () => {
    setSessionId(null);
    setCurrentQuestion(null);
    setSession(null);
    setWeakTopics([]);
    setQuizStarted(false);
    setCurrentHint(null);
    setShowHint(false);
    setLastAnswerResult(null);
    setQuestionAttempts(new Map());
  };

  return {
    // State
    sessionId,
    currentQuestion,
    session,
    weakTopics,
    isLoading,
    isLoadingQuestion,
    quizStarted,
    currentHint,
    showHint,
    lastAnswerResult,

    // Actions
    startQuiz,
    loadNextQuestion,
    submitAnswer,
    handleUseHint,
    canShowHint,
    resetSession
  };
}
