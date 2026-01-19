import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Clock, Lightbulb, Star } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { QuestionResponse } from '@/lib/AdaptiveQuizService';
import { playSelectSound } from '@/lib/sound';

// Function to convert ability estimate to child-friendly skill level
const getSkillLevel = (ability: number) => {
  if (ability >= 0.8) return { level: 'Sangat Bijak', stars: 5, color: 'text-yellow-400' };
  if (ability >= 0.6) return { level: 'Bijak', stars: 4, color: 'text-blue-400' };
  if (ability >= 0.4) return { level: 'Sederhana', stars: 3, color: 'text-green-400' };
  if (ability >= 0.2) return { level: 'Pemula', stars: 2, color: 'text-orange-400' };
  return { level: 'Baru Belajar', stars: 1, color: 'text-red-400' };
};

interface QuizQuestionProps {
  question: QuestionResponse;
  selectedAnswer: number | number[] | null;
  timeLeft: number;
  showHint: boolean;
  currentHint: string | null;
  onAnswerSelect: (answer: number | number[] | null) => void;
  onUseHint: () => void;
  onSubmit: () => void;
  canShowHint: boolean;
  weakTopics?: string[];
}

export function QuizQuestion({
  question,
  selectedAnswer,
  timeLeft,
  showHint,
  currentHint,
  onAnswerSelect,
  onUseHint,
  onSubmit,
  canShowHint,
  weakTopics = []
}: QuizQuestionProps) {
  const [showRemedialOverlay, setShowRemedialOverlay] = useState(false);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercentage = (timeLeft / 30) * 100;

  // Show remedial overlay when weak topic question appears (frontend calculation)
  useEffect(() => {
    const isWeakTopicQuestion = weakTopics.some(weakTopic =>
      weakTopic.includes(question.topic)
    );

    console.log('Remedial overlay check:', {
      questionTopic: question.topic,
      weakTopics,
      isWeakTopicQuestion,
      questionId: question.id
    });

    if (isWeakTopicQuestion) {
      console.log('Showing remedial overlay for question:', question.topic);
      setShowRemedialOverlay(true);
      const timer = setTimeout(() => {
        setShowRemedialOverlay(false);
      }, 4000);
      return () => clearTimeout(timer);
    } else {
      setShowRemedialOverlay(false);
    }
  }, [question.id, question.topic, weakTopics]);

  const handleSubmit = () => {
    if (selectedAnswer !== null && selectedAnswer !== undefined) {
      onSubmit();
    }
  };

  // Determine if submit button should be disabled
  const isSubmitDisabled = () => {
    // For multiple choice questions, require exact number of answers
    if (question.correct_answers && Array.isArray(question.correct_answers) && question.correct_answers.length > 1) {
      return !Array.isArray(selectedAnswer) || selectedAnswer.length !== question.correct_answers.length;
    }
    // For single choice questions, require exactly one answer
    return selectedAnswer === null;
  };

  return (
    <div className=" bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
      {/* Remedial Overlay */}
      {showRemedialOverlay && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-8 rounded-2xl border-4 border-white/20 shadow-2xl max-w-md mx-4">
            <div className="text-center">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-2xl font-black text-white mb-2">Topik Lemah Dikesan!</h3>
              <p className="text-white/90 text-lg">
                Soalan ini adalah dari topik yang anda perlukan latihan tambahan.
                Teruskan usaha yang baik!
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="mb-4">
          <div className="flex justify-between items-center text-white mb-2">
            <div className="flex items-center gap-3">
              <span className="text-lg font-black text-white">
                Soalan {question.progress.current}/{question.progress.total}
              </span>
            </div>
            <div className="flex items-center gap-2 bg-orange-500/20 px-3 py-1 rounded-xl border-2 border-orange-400/30 shadow-lg backdrop-blur-sm">
              <Clock className="w-4 h-4 text-orange-400" />
              <span className="text-lg font-black text-orange-300 tabular-nums">
                {formatTime(timeLeft)}
              </span>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm p-1 rounded-xl border-2 border-white/20 shadow-lg">
            <Progress
              value={progressPercentage}
              className={`h-2 rounded-lg ${
                timeLeft > 20
                  ? "[&>div]:bg-green-500"
                  : timeLeft > 10
                  ? "[&>div]:bg-yellow-500"
                  : "[&>div]:bg-red-500"
              }`}
            />
          </div>
        </div>

        {/* Main Quiz Card */}
        <Card className="bg-white/10 backdrop-blur-xl border-2 border-white/20 shadow-2xl overflow-hidden rounded-2xl">
          <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 p-4 border-b-2 border-white/20">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-purple-500 text-white px-2 py-1 rounded-lg font-black text-sm shadow-lg">
                  {(() => {
                    const skillLevel = getSkillLevel(question.progress.abilityEstimate ?? 0);
                    return (
                      <>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: skillLevel.stars }, (_, i) => (
                            <Star key={i} className={`w-3 h-3 ${skillLevel.color}`} fill="currentColor" />
                          ))}
                        </div>
                        <span className="text-xs ml-1">Sistem mengukur: {skillLevel.level}</span>
                      </>
                    );
                  })()}
                </div>
              </div>


            {/* difficulty level tag */}
              <div className="flex gap-1">
                <div className={`px-2 py-1 rounded-lg border-2 shadow-lg font-black text-xs backdrop-blur-sm ${
                  question.difficulty === 'easy'
                    ? "bg-green-500/20 text-green-300 border-green-400/30"
                    : question.difficulty === 'medium'
                    ? "bg-yellow-500/20 text-yellow-300 border-yellow-400/30"
                    : "bg-red-500/20 text-red-300 border-red-400/30"
                }`}>
                  {question.difficulty === 'easy' ? " Tahap Mudah 🟢" : question.difficulty === 'medium' ? "Tahap Sederhana 🟡" : "Tahap Susah 🔴"}
                </div>
                <div className={`px-2 py-1 rounded-lg border-2 shadow-lg font-black text-xs backdrop-blur-sm ${
                  Array.isArray(question.correct_answers) && question.correct_answers.length > 1
                    ? "bg-purple-500/20 text-purple-300 border-purple-400/30"
                    : "bg-blue-500/20 text-blue-300 border-blue-400/30"
                }`}>
                  {Array.isArray(question.correct_answers) && question.correct_answers.length > 1 ? "Jawapan Berbilang 🔹" : "Jawapan Tunggal 🔸"}
                </div>
              </div>
            </div>

            {/* Remedial Indicator */}
            {weakTopics.some(weakTopic => weakTopic.includes(question.topic)) && (
              <div className="flex items-center gap-2 mb-3">
                <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 rounded-full font-black text-sm shadow-lg border-2 border-white/20">
                  <span className="mr-1">🔄</span>
                  Remedial Question
                </div>
                <span className="text-white/80 text-sm font-semibold">
                  Practice for weak topic: {question.topic}
                </span>
              </div>
            )}

            {/* Question Text */}
            <h2 className="text-2xl font-black text-white leading-relaxed mb-2">{question.question}</h2>
          </div>

          <div className="p-6">
            {/* Hint Button */}
            {canShowHint && !showHint && (
              <div className="mb-6">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onUseHint}
                  className="bg-gradient-to-r from-amber-500/20 to-yellow-500/20 hover:from-amber-400/30 hover:to-yellow-400/30 text-amber-300 border-4 border-amber-400/30 py-3 px-4 rounded-2xl font-black text-base shadow-lg hover:shadow-xl transition-all hover:scale-105 backdrop-blur-sm"
                >
                  <Lightbulb className="w-5 h-5 mr-2" />
                  Petunjuk 💡
                </Button>
              </div>
            )}

            {/* Hint Display */}
            {showHint && currentHint && (
              <div className="mb-6 p-4 bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border-4 border-amber-400/20 rounded-2xl shadow-lg backdrop-blur-sm">
                <p className="text-sm text-amber-200 font-semibold">{currentHint}</p>
              </div>
            )}

            {/* Answer Options */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {question.options.map((option, index) => {
                const letters = ["A", "B", "C", "D"]
                const isMultipleChoice = Array.isArray(question.correct_answers) && question.correct_answers.length > 1;
                const isSelected = isMultipleChoice
                  ? Array.isArray(selectedAnswer) && selectedAnswer.includes(index)
                  : selectedAnswer === index;

                const handleClick = () => {
                  console.log('Button clicked:', index, 'isMultipleChoice:', isMultipleChoice);
                  // Play select sound when student clicks answer
                  playSelectSound();
                  if (isMultipleChoice) {
                    // For multiple choice: toggle selection in array
                    const currentSelections = Array.isArray(selectedAnswer) ? selectedAnswer : [];
                    const newSelections = currentSelections.includes(index)
                      ? currentSelections.filter(i => i !== index)
                      : [...currentSelections, index];
                    console.log('New selections:', newSelections);
                    onAnswerSelect(newSelections.length === 0 ? null : newSelections);
                  } else {
                    // For single choice: select this option
                    console.log('Selecting single answer:', index);
                    onAnswerSelect(index);
                  }
                };

                return (
                  <button
                    key={index}
                    type="button"
                    onClick={handleClick}
                    className={`w-full p-4 rounded-2xl text-left font-bold transition-all border-4 shadow-lg hover:shadow-xl hover:scale-[1.02] backdrop-blur-sm cursor-pointer ${
                      isSelected
                        ? `bg-gradient-to-r from-amber-400/30 to-amber-500/30 border-amber-400/50 text-white scale-[1.02] shadow-xl`
                        : `bg-gradient-to-r from-blue-500/20 to-blue-600/20 border-blue-400/30 text-white hover:from-blue-400/30 hover:to-blue-500/30`
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg flex-shrink-0 shadow-lg backdrop-blur-sm ${
                          isSelected
                            ? "bg-white text-gray-900 border-2 border-gray-300"
                            : "bg-white/80 text-gray-700 border-2 border-white"
                        }`}
                      >
                        {letters[index]}
                      </div>
                      <span className="text-lg">{option.text}</span>
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Submit Button */}
            <Button
              onClick={handleSubmit}
              disabled={isSubmitDisabled()}
              className="w-full bg-gradient-to-r from-green-500/20 to-emerald-500/20 hover:from-green-400/30 hover:to-emerald-400/30 text-white py-6 text-xl font-black rounded-2xl shadow-lg hover:shadow-xl transition-all hover:scale-105 border-4 border-green-400/30 backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:from-gray-400 disabled:to-gray-400"
            >
              <span className="mr-3 text-2xl">🚀</span>
              Hantar Jawapan!
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
