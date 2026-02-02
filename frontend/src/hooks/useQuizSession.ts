import { useState, useEffect, useCallback } from 'react';
import { adaptiveQuizService, type QuestionResponse, type AnswerResponse } from '@/lib/AdaptiveQuizService';
import type { AdaptiveQuizSettings, QuizSession } from '@/lib/AdaptiveQuizEngine';
import { useAuth } from '@/components/auth/useAuth';

/**
 * Custom hook for managing adaptive quiz session state
 * Handles session initialization, question loading, and answer submission
 */
export function useQuizSession(
  settings: AdaptiveQuizSettings,
  year: number,
  subject: string,
  topic: string
) {
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
  const [questionAttempts, setQuestionAttempts] = useState<
    Map<number, { attempts: number; correct: boolean; hintsUsed: number }>
  >(new Map());

  /**
   * Load the next question in the session
   */
  const loadNextQuestion = useCallback(async (sid: string) => {
    if (isLoadingQuestion || !sid) return;

    try {
      setIsLoadingQuestion(true);
      setIsLoading(true);

      const response = await adaptiveQuizService.getNextQuestion(sid);

      if ('completed' in response) {
        return { completed: true };
      }

      setCurrentQuestion(response);
      setCurrentHint(null);
      setShowHint(false);

      return response;
    } catch (error) {
      console.error('Failed to load question:', error);
      throw error;
    } finally {
      setIsLoading(false);
      setIsLoadingQuestion(false);
    }
  }, [isLoadingQuestion]);

  /**
   * Start a new quiz session
   * Function declaration avoids use-before-define ESLint error
   */
const startQuiz = useCallback(async () => {
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
}, [
  user,
  year,
  subject,
  topic,
  settings.maxQuestions,
  loadNextQuestion
]);


  /**
   * Initialize quiz session when component mounts
   */
  useEffect(() => {
    if (!quizStarted && user?.id) {
      startQuiz();
    }
  }, [user?.id, quizStarted, startQuiz]);

  /**
   * Submit an answer for the current question
   */
  const submitAnswer = async (answer: number | number[], timeSpent: number) => {
    if (!sessionId || !currentQuestion) return;

    try {
      setIsLoading(true);

      const backendAnswer = Array.isArray(answer)
        ? answer.map(i => currentQuestion.options[i]?.id || i.toString())
        : currentQuestion.options[answer]?.id || answer.toString();

      const result = await adaptiveQuizService.submitAnswer(
        sessionId,
        currentQuestion.id,
        backendAnswer,
        timeSpent
      );

      setLastAnswerResult(result);

      const questionId = currentQuestion.id;
      const existing = questionAttempts.get(questionId) || {
        attempts: 0,
        correct: false,
        hintsUsed: 0
      };

      setQuestionAttempts(prev =>
        new Map(prev).set(questionId, {
          attempts: existing.attempts + 1,
          correct: result.isCorrect,
          hintsUsed: existing.hintsUsed
        })
      );

      if (session) {
        setSession({ ...session, abilityEstimate: result.abilityEstimate });
      }

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
   * Handle hint usage
   */
  const handleUseHint = async () => {
    if (!currentQuestion || !sessionId) return;

    try {
      setIsLoading(true);

      const hintResponse = await adaptiveQuizService.requestHint(sessionId);

      setCurrentHint(hintResponse.hint);
      setShowHint(true);

      const questionId = currentQuestion.id;
      const existing = questionAttempts.get(questionId) || {
        attempts: 0,
        correct: false,
        hintsUsed: 0
      };

      setQuestionAttempts(prev =>
        new Map(prev).set(questionId, {
          ...existing,
          hintsUsed: existing.hintsUsed + 1
        })
      );

      if (session) {
        setSession({ ...session, totalScore: hintResponse.totalScore });
      }
    } catch (error) {
      console.error('Failed to get hint:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Determine hint visibility
   */
  const canShowHint = () => {
    if (!currentQuestion || !sessionId || !session) return false;
    if (!currentQuestion.hints?.length) return false;

    const attempts = questionAttempts.get(currentQuestion.id) || {
      attempts: 0,
      correct: false,
      hintsUsed: 0
    };

    return attempts.attempts - (attempts.correct ? 1 : 0) >= 1;
  };

  /**
   * Reset session
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
    startQuiz,
    loadNextQuestion,
    submitAnswer,
    handleUseHint,
    canShowHint,
    resetSession
  };
}
