"use client";

import { useState } from 'react';
import type { AdaptiveQuizSettings, QuizSummary } from '@/lib/AdaptiveQuizEngine';

// Screen Components
import { QuizInfo } from './screens/QuizInfo';
import { QuizCountdown } from './screens/QuizCountdown';
import { QuizQuestion } from './screens/QuizQuestion';
import { QuizFeedback } from './screens/QuizFeedback';
import { QuizSummary as QuizSummaryScreen } from './screens/QuizSummary';

// Custom Hooks
import { useQuizSession } from '@/hooks/useQuizSession';
import { useQuizTimer } from '@/hooks/useQuizTimer';
import { useQuizStats } from '@/hooks/useQuizStats';

// Services
import { QuizFlowService } from '@/services/quizFlowService';

interface AdaptiveQuizPlayerProps {
  settings: AdaptiveQuizSettings;
  year: number;
  subject: string;
  topic: string;
  onComplete: (summary: QuizSummary) => void;
  onExit: () => void;
}

type QuizScreen = 'info' | 'countdown' | 'question' | 'feedback' | 'summary';

/*
 * Main Adaptive Quiz Player Component
 */
export function AdaptiveQuizPlayer({
  settings,
  year,
  subject,
  topic,
  onComplete,
  onExit
}: AdaptiveQuizPlayerProps) {
  const [currentScreen, setCurrentScreen] = useState<QuizScreen>('info');
  const [countdown, setCountdown] = useState(3);
  const [selectedAnswer, setSelectedAnswer] = useState<number | number[] | null>(null);
  const [questionStartTime, setQuestionStartTime] = useState<number>(0);
  const [quizSummary, setQuizSummary] = useState<QuizSummary | null>(null);

  // Custom hooks for state management
  const quizSession = useQuizSession(settings, year, subject, topic);
  const quizStats = useQuizStats(year, subject, topic);

  // Timer hook with auto-submit functionality
  const timer = useQuizTimer(
    settings.timeLimit ? settings.timeLimit * 60 : 0,
    () => handleAutoSubmit(),
    true
  );

  /**
   * Handle auto-submit when timer runs out
   */
  const handleAutoSubmit = async () => {
    if (!selectedAnswer && quizSession.currentQuestion) {
      // Auto-submit with no answer selected (counts as wrong)
      await handleAnswerSubmit();
    }
  };

  /**
   * Start quiz countdown and transition to question screen
   */
  const handleStartQuiz = () => {
    setCurrentScreen('countdown');
    setCountdown(QuizFlowService.getCountdownDuration(settings));

    const countdownTimer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownTimer);
          setCurrentScreen('question');
          timer.startTimer(); // Start the question timer
          setQuestionStartTime(Date.now());
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  /**
   * Handle answer submission
   */
  const handleAnswerSubmit = async () => {
    if (!quizSession.sessionId || !quizSession.currentQuestion || selectedAnswer === null) return;

    try {
      const timeSpent = QuizFlowService.calculateTimeSpent(questionStartTime);
      timer.stopTimer();

      const result = await quizSession.submitAnswer(selectedAnswer, timeSpent);

      if (result) {
        setCurrentScreen('feedback');

        // Auto-advance to next question after 2 seconds
        setTimeout(async () => {
          setCurrentScreen('question');
          setSelectedAnswer(null);

          const nextQuestion = await quizSession.loadNextQuestion(quizSession.sessionId!);
          if (nextQuestion && 'completed' in nextQuestion && nextQuestion.completed) {
            await handleQuizComplete();
          } else {
            timer.resetTimer();
            timer.startTimer();
            setQuestionStartTime(Date.now());
          }
        }, 2000);
      }
    } catch (error) {
      console.error('Failed to submit answer:', error);
    }
  };

  /**
   * Handle quiz completion
   */
  const handleQuizComplete = async () => {
    if (!quizSession.sessionId) return;

    try {
      const summary = await QuizFlowService.completeQuiz(quizSession.sessionId);
      setQuizSummary(summary);
      setCurrentScreen('summary');
      onComplete(summary);
    } catch (error) {
      console.error('Failed to complete quiz:', error);
    }
  };

  /**
   * Handle quiz retry
   */
  const handleRetry = () => {
    setCurrentScreen('info');
    quizSession.resetSession();
    timer.resetTimer();
    setSelectedAnswer(null);
    setQuizSummary(null);
  };

  // Loading state
  if (quizSession.isLoading || quizStats.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Memuatkan...</p>
        </div>
      </div>
    );
  }

  // Main render logic
  switch (currentScreen) {
    case 'info':
      return (
        <QuizInfo
          subject={subject}
          year={year}
          stats={quizStats.stats}
          onStartQuiz={handleStartQuiz}
          onExit={onExit}
        />
      );

    case 'countdown':
      return <QuizCountdown countdown={countdown} />;

    case 'question':
      if (!quizSession.currentQuestion) {
        return (
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-slate-600">Memuatkan soalan...</p>
            </div>
          </div>
        );
      }

      return (
        <QuizQuestion
          question={quizSession.currentQuestion}
          selectedAnswer={selectedAnswer}
          timeLeft={timer.timeLeft}
          showHint={quizSession.showHint}
          currentHint={quizSession.currentHint}
          onAnswerSelect={(answer) => setSelectedAnswer(answer)}
          onUseHint={quizSession.handleUseHint}
          onSubmit={handleAnswerSubmit}
          canShowHint={quizSession.canShowHint()}
        />
      );

    case 'feedback':
      return (
        <QuizFeedback
          isCorrect={quizSession.lastAnswerResult?.isCorrect || false}
          baseScore={quizSession.lastAnswerResult?.baseScore || 0}
          timeBonus={quizSession.lastAnswerResult?.timeBonus || 0}
          partialCredit={quizSession.lastAnswerResult?.partialCredit || 0}
          totalPoints={quizSession.lastAnswerResult?.totalPoints || 0}
          feedback={quizSession.lastAnswerResult?.feedback || ''}
        />
      );

    case 'summary':
      return (
        <QuizSummaryScreen
          totalQuestions={quizSummary?.totalQuestions || 0}
          correctAnswers={quizSummary?.correctAnswers || 0}
          totalScore={quizSummary?.totalScore || 0}
          onRetry={handleRetry}
          onComplete={onExit}
        />
      );

    default:
      return null;
  }
}
