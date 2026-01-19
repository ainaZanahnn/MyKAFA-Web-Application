import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Trophy, CheckCircle2, XCircle, Star, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

// Function to convert ability estimate to child-friendly skill level
const getSkillLevel = (ability: number) => {
  if (ability >= 0.8) return { level: 'Sangat Bijak', stars: 5, color: 'text-yellow-400' };
  if (ability >= 0.6) return { level: 'Bijak', stars: 4, color: 'text-blue-400' };
  if (ability >= 0.4) return { level: 'Sederhana', stars: 3, color: 'text-green-400' };
  if (ability >= 0.2) return { level: 'Pemula', stars: 2, color: 'text-orange-400' };
  return { level: 'Baru Belajar', stars: 1, color: 'text-red-400' };
};

interface QuestionScore {
  questionId: number;
  question: string;
  difficulty: 'easy' | 'medium' | 'hard';
  isCorrect: boolean;
  points: number;
  timeSpent: number;
  attempts?: number;
  hintsUsed?: number;
  baseScore?: number;
  timeBonus?: number;
  partialCredit?: number;
  hintPenalty?: number;
  answeredWithinTime?: boolean;
  isRemedial?: boolean;
}

interface QuizSummaryProps {
  totalQuestions: number;
  correctAnswers: number;
  totalScore: number;
  questionScores?: QuestionScore[];
  abilityEstimate?: number;
  onRetry: () => void;
  onComplete: () => void;
}

function QuestionFeedbackCard({ score, questionNumber }: { score: QuestionScore; questionNumber: number }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'Mudah';
      case 'medium': return 'Sederhana';
      case 'hard': return 'Susah';
      default: return difficulty;
    }
  };

  return (
    <div className={`bg-white p-4 rounded-lg border shadow-sm ${score.isRemedial ? 'border-orange-300 bg-orange-50' : 'border-indigo-200'}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          {score.isCorrect ? (
            <CheckCircle2 className="w-5 h-5 text-green-600" />
          ) : (
            <XCircle className="w-5 h-5 text-red-600" />
          )}
          <span className="font-semibold text-indigo-800">Soalan {questionNumber}</span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(score.difficulty)}`}>
            {getDifficultyText(score.difficulty)}
          </span>
          {score.isRemedial && (
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
              Latihan Semula
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className={`font-bold ${score.points > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {score.points} mata
          </span>
          {score.isRemedial && (
            <span className="text-xs text-orange-600 font-medium">
              (Tidak dikira dalam markah akhir)
            </span>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 h-6 w-6"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-indigo-100 space-y-2">
          <div className="text-sm">
            <p className="font-medium text-indigo-800 mb-2">{score.question}</p>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-600">Masa Dijawab:</span>
                  <span className="font-medium">{Math.round(score.timeSpent)}s</span>
                </div>
                {score.attempts && score.attempts > 1 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Percubaan:</span>
                    <span className="font-medium">{score.attempts}x</span>
                  </div>
                )}
                {score.hintsUsed && score.hintsUsed > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Petunjuk Diguna:</span>
                    <span className="font-medium">{score.hintsUsed}x</span>
                  </div>
                )}
              </div>

              <div className="space-y-1">
                {score.baseScore !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Markah Asas:</span>
                    <span className="font-medium text-green-600">+{Math.round(score.baseScore)}</span>
                  </div>
                )}
                {score.timeBonus && score.timeBonus > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Bonus Masa:</span>
                    <span className="font-medium text-blue-600">+{Math.round(score.timeBonus)}</span>
                  </div>
                )}
                {score.hintPenalty && score.hintPenalty > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Penalti Petunjuk:</span>
                    <span className="font-medium text-red-600">-{Math.round(score.hintPenalty)}</span>
                  </div>
                )}
                {score.partialCredit && score.partialCredit > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Markah Separa:</span>
                    <span className="font-medium text-orange-600">+{Math.round(score.partialCredit)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function QuizSummary({
  totalQuestions,
  correctAnswers,
  totalScore,
  questionScores,
  abilityEstimate,
  onRetry,
  onComplete
}: QuizSummaryProps) {
  // Calculate percentage based on current topic questions only (excluding remedial)
  const percentage = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="p-8 bg-white shadow-xl">
        <div className="text-center mb-8">
          <Trophy className="w-20 h-20 mx-auto mb-4 text-yellow-500" />
          <h2 className="text-4xl font-bold text-indigo-900 mb-2">Tahniah!</h2>
        </div>

        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-8 rounded-2xl mb-8">
          <div className="text-center mb-6">
            <p className="text-gray-600 mb-2">Keputusan Kuiz</p>
            <p className="text-6xl font-bold text-indigo-600 mb-2">{percentage}%</p>
            <p className="text-2xl text-gray-700">{totalScore} mata</p>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="bg-white p-8 rounded-xl text-center">
              <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-green-600" />
              <p className="text-2xl font-bold text-green-600">{correctAnswers}</p>
            </div>
            <div className="bg-white p-8 rounded-xl text-center">
              <XCircle className="w-8 h-8 mx-auto mb-2 text-red-600" />
              <p className="text-2xl font-bold text-red-600">{totalQuestions - correctAnswers}</p>
            </div>
            <div className="bg-white p-4 rounded-xl text-center">
              <p className="text-sm text-gray-600 mb-1">Kemahiran Status Semasa</p>
               <div className="flex items-center justify-center mb-2">
                {abilityEstimate !== undefined && (() => {
                  const skillLevel = getSkillLevel(abilityEstimate);
                  return (
                    <div className="flex items-center gap-1">
                      {Array.from({ length: skillLevel.stars }, (_, i) => (
                        <Star key={i} className={`w-6 h-6 ${skillLevel.color}`} fill="currentColor" />
                      ))}
                    </div>
                  );
                })()}
              </div>
              <p className="text-lg font-bold text-purple-600">
                {abilityEstimate !== undefined ? getSkillLevel(abilityEstimate).level : 'Tidak Tersedia'}
              </p>
            </div>
          </div>

          <div className="bg-white/70 p-4 rounded-xl">
            <h4 className="font-bold text-indigo-800 mb-3 text-center">Rekod Soalan Untuk Kuiz Ini</h4>
            <div className="space-y-3 text-sm text-indigo-700">
              {questionScores && questionScores.length > 0 ? (
                <div className="space-y-3">
                  {questionScores
                    .filter(score => !score.isRemedial) // Only show non-remedial questions
                    .filter((score, index, self) => {
                      // Remove duplicates - if same question appears multiple times, show only the last attempt
                      const lastIndex = self.reduce((last, current, currentIndex) =>
                        current.questionId === score.questionId ? currentIndex : last, -1);
                      return index === lastIndex;
                    })
                    .map((score, index) => (
                      <QuestionFeedbackCard key={`${score.questionId}-${index}`} score={score} questionNumber={index + 1} />
                    ))}
                </div>
              ) : (
                <div className="bg-white p-3 rounded-lg text-center">
                  <p className="text-indigo-700">Maklumat soalan tidak tersedia</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <Button
            onClick={onRetry}
            className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-6 text-lg font-semibold rounded-xl shadow-lg"
          >
            Cuba Lagi
          </Button>
          <Button
            onClick={onComplete}
            variant="outline"
            className="flex-1 border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 py-6 text-lg font-semibold rounded-xl"
          >
            Selesai
          </Button>
        </div>
      </Card>
    </div>
  );
}
