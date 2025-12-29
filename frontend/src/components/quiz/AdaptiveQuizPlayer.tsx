"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Clock, ArrowRight, ArrowLeft, Lightbulb } from 'lucide-react';
import { adaptiveQuizService } from '@/lib/AdaptiveQuizService';
import { AdaptiveQuizEngine } from '@/lib/AdaptiveQuizEngine';
import type { AdaptiveQuizSettings, QuizSummary, QuizSession } from '@/lib/AdaptiveQuizEngine';

interface AdaptiveQuizPlayerProps {
  settings: AdaptiveQuizSettings;
  questions: unknown[]; // For compatibility, though we use backend
  onComplete: (summary: QuizSummary) => void;
  onExit: () => void;
}

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  hints: string[];
  isWeakTopicQuestion: boolean;
  progress: {
    current: number;
    total: number;
    abilityEstimate: number;
  };
}

export function AdaptiveQuizPlayer({ settings, onComplete, onExit }: AdaptiveQuizPlayerProps) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<QuizQuestion | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [questionStartTime, setQuestionStartTime] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);

  // Session state for adaptive hints
  const [session, setSession] = useState<QuizSession | null>(null);

  // Hint state management
  const [currentHint, setCurrentHint] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);

  // Answer feedback state
  const [lastAnswerResult, setLastAnswerResult] = useState<{
    isCorrect: boolean;
    score: number;
    timeBonus: number;
    partialCredit: number;
    totalPoints: number;
    answeredWithinTime: boolean;
    feedback: string;
  } | null>(null);
  const [showAnswerFeedback, setShowAnswerFeedback] = useState(false);
  

  // Mock user ID - in real app, get from auth context
  const userId = "student123";

  useEffect(() => {
    startQuiz();
  },);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && selectedAnswer !== null && !isLoading) {
      // Auto-submit when time runs out and user has selected an answer
      submitAnswer();
    }
  }, [timeLeft, selectedAnswer, isLoading]);

  const startQuiz = async () => {
    try {
      setIsLoading(true);
      // Use sample data for now - replace with actual subject/year/topic
      const sessionData = await adaptiveQuizService.startQuiz(userId, 1, "Mathematics", "Algebra", settings.maxQuestions);
      setSessionId(sessionData.sessionId);

      // Initialize frontend session state for adaptive hints
      const initialSession: QuizSession = {
        sessionId: sessionData.sessionId,
        userId,
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
        currentQuestion: null
      };

      setSession(initialSession);
      await loadNextQuestion(sessionData.sessionId);
    } catch (error) {
      console.error('Failed to start quiz:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadNextQuestion = async (sid: string) => {
    try {
      setIsLoading(true);
      const response = await adaptiveQuizService.getNextQuestion(sid);

      if ('completed' in response) {
        await finishQuiz(sid);
        return;
      }

      setCurrentQuestion(response);
      setSelectedAnswer(null);
      setQuestionStartTime(Date.now());
      setTimeLeft(settings.timeLimit ? settings.timeLimit * 60 : 0); // Convert minutes to seconds

      // Reset hint state for new question
      setCurrentHint(null);
      setShowHint(false);
    } catch (error) {
      console.error('Failed to load question:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const submitAnswer = async () => {
    if (!sessionId || !currentQuestion || selectedAnswer === null) return;

    try {
      setIsLoading(true);
      const timeSpent = Math.round((Date.now() - questionStartTime) / 1000);

      const result = await adaptiveQuizService.submitAnswer(sessionId, currentQuestion.id, selectedAnswer, timeSpent);

      // Show answer feedback
      setLastAnswerResult({
        isCorrect: result.isCorrect,
        score: result.score,
        timeBonus: result.timeBonus,
        partialCredit: result.partialCredit,
        totalPoints: result.totalPoints,
        answeredWithinTime: result.answeredWithinTime,
        feedback: result.feedback
      });
      setShowAnswerFeedback(true);

      // Auto-advance to next question after 2 seconds
      setTimeout(() => {
        setShowAnswerFeedback(false);
        setLastAnswerResult(null);
        loadNextQuestion(sessionId);
      }, 2000);

    } catch (error) {
      console.error('Failed to submit answer:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const finishQuiz = async (sid: string) => {
    try {
      const results = await adaptiveQuizService.getResults(sid);

      // Convert backend results to QuizSummary format
      const summary: QuizSummary = {
        totalQuestions: results.totalQuestions,
        correctAnswers: results.currentTopicScore,
        totalScore: results.totalScore,
        answers: [], // Not available from backend
        averageTime: results.timeSpent / results.questionsAnswered,
        timeSpent: results.timeSpent,
        abilityEstimate: results.abilityEstimate,
        difficultyDistribution: {
          easy: 0, // Not available from backend
          medium: 0,
          hard: 0
        },
        questionHistory: [] // Not available from backend
      };

      onComplete(summary);
    } catch (error) {
      console.error('Failed to get results:', error);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle hint usage
  const handleUseHint = () => {
    if (!currentQuestion || !session || !sessionId) return;

    // Use adaptive hint logic
    const hint = AdaptiveQuizEngine.getNextHint(session);
    if (hint) {
      const result = AdaptiveQuizEngine.consumeHint(session, settings);
      setSession(result.session);
      setCurrentHint(hint);
      setShowHint(true);
    }
  };

  // Check if hints are available
  const canShowHint = () => {
    if (!currentQuestion || !session || !sessionId) return false;
    return AdaptiveQuizEngine.shouldShowHint(session, settings);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Memuatkan...</p>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Card className="p-8 text-center">
          <p className="text-slate-600 mb-4">Memulakan kuiz...</p>
          <Button onClick={onExit} variant="outline">
            Kembali
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button onClick={onExit} variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Keluar
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Kuiz Adaptif</h1>
            <p className="text-slate-600">Soalan {currentQuestion.progress.current} daripada {currentQuestion.progress.total}</p>
          </div>
        </div>

        {settings.timeLimit && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>Masa Tinggal</span>
              </div>
              <span className="font-mono font-semibold">{formatTime(timeLeft)}</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
              <div
                className={`h-full transition-all duration-1000 ease-linear rounded-full ${
                  timeLeft > settings.timeLimit * 60 * 0.6
                    ? 'bg-green-500'
                    : timeLeft > settings.timeLimit * 60 * 0.3
                    ? 'bg-yellow-500'
                    : 'bg-red-500'
                }`}
                style={{
                  width: `${(timeLeft / (settings.timeLimit * 60)) * 100}%`,
                  transformOrigin: 'right'
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <Progress value={(currentQuestion.progress.current / currentQuestion.progress.total) * 100} className="h-2" />
        <div className="flex justify-between text-sm text-slate-600">
          <span>Tahap Kemahiran: {Math.round(currentQuestion.progress.abilityEstimate * 100)}%</span>
          <span>{currentQuestion.progress.current} / {currentQuestion.progress.total}</span>
        </div>
      </div>

      {/* Answer Feedback */}
      {showAnswerFeedback && lastAnswerResult && (
        <Card className={`p-6 ${lastAnswerResult.isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <div className="text-center space-y-4">
            <div className={`text-4xl ${lastAnswerResult.isCorrect ? 'text-green-600' : 'text-red-600'}`}>
              {lastAnswerResult.isCorrect ? '✓' : '✗'}
            </div>
            <div>
              <h3 className={`text-lg font-semibold ${lastAnswerResult.isCorrect ? 'text-green-800' : 'text-red-800'}`}>
                {lastAnswerResult.isCorrect ? 'Betul!' : 'Salah'}
              </h3>
              <div className="text-sm text-slate-600 mt-2">
                <div className="flex justify-center items-center gap-4">
                  {!lastAnswerResult.isCorrect && lastAnswerResult.partialCredit > 0 ? (
                    <>
                      <span>Markah: {lastAnswerResult.partialCredit}</span>
                      <span className="text-orange-600 font-medium">Jawapan hampir betul!</span>
                    </>
                  ) : (
                    <span>Markah: {lastAnswerResult.score}</span>
                  )}
                  {lastAnswerResult.timeBonus > 0 && (
                    <span className="text-green-600 font-medium">
                      + Markah Bonus: {lastAnswerResult.timeBonus}
                    </span>
                  )}
                  <span className="font-bold">Jumlah: {lastAnswerResult.totalPoints}</span>
                </div>
                {!lastAnswerResult.answeredWithinTime && lastAnswerResult.isCorrect && (
                  <p className="text-yellow-600 mt-2">Markah Bonus: 0 (lewat masa)</p>
                )}
                {!lastAnswerResult.isCorrect && lastAnswerResult.partialCredit === 0 && (
                  <p className="text-red-600 mt-2">Markah: 0</p>
                )}
              </div>
            </div>
            <p className="text-slate-700">{lastAnswerResult.feedback}</p>
          </div>
        </Card>
      )}

      {/* Question Card */}
      <Card className="p-8">
        <div className="space-y-6">
          {/* Question */}
          <div>
            <h2 className="text-xl font-semibold text-slate-800 mb-4">
              {currentQuestion.question}
            </h2>

            {currentQuestion.isWeakTopicQuestion && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                <p className="text-yellow-800 text-sm">
                  💡 Soalan ini adalah untuk topik yang memerlukan penambahbaikan
                </p>
              </div>
            )}
          </div>

          {/* Hint Button */}
          {canShowHint() && !showHint && (
            <div className="flex justify-center">
              <Button
                onClick={handleUseHint}
                variant="outline"
                className="border-yellow-500 text-yellow-700 hover:bg-yellow-50"
              >
                <Lightbulb className="w-4 h-4 mr-2" />
                Dapatkan Petunjuk
              </Button>
            </div>
          )}

          {/* Hint Display */}
          {showHint && currentHint && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-blue-900 mb-2">Petunjuk</h3>
                  <p className="text-blue-800">{currentHint}</p>
                </div>
              </div>
            </div>
          )}

          {/* Options */}
          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                onClick={() => setSelectedAnswer(index)}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                  selectedAnswer === index
                    ? 'border-blue-500 bg-blue-50 text-blue-900'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    selectedAnswer === index ? 'border-blue-500 bg-blue-500' : 'border-slate-300'
                  }`}>
                    {selectedAnswer === index && (
                      <div className="w-3 h-3 bg-white rounded-full"></div>
                    )}
                  </div>
                  <span className="font-medium">
                    {String.fromCharCode(65 + index)}. {option}
                  </span>
                </div>
              </button>
            ))}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-4">
            <Button
              onClick={submitAnswer}
              disabled={selectedAnswer === null}
              className="bg-green-600 hover:bg-green-700"
            >
              Jawab
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
