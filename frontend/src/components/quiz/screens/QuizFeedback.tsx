import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Zap, Minus, X } from 'lucide-react';
import { playCorrectSound, playLoseSound } from '@/lib/sound';
import { useEffect } from 'react';

interface QuizFeedbackProps {
  isCorrect: boolean;
  baseScore: number;
  timeBonus: number;
  partialCredit: number;
  hintPenalty: number;
  totalPoints: number;
  feedback: string;
  onClose: () => void;
}

export function QuizFeedback({
  isCorrect,
  baseScore,
  timeBonus,
  partialCredit,
  hintPenalty,
  totalPoints,
  feedback,
  onClose
}: QuizFeedbackProps) {
  // Play lose sound when student gets wrong answer during feedback
  useEffect(() => {
    if (!isCorrect) {
      playLoseSound();
    } else {
      playCorrectSound();
    }
  }, [isCorrect]);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 flex items-center justify-center z-50 p-4">
      <Card
        className={`p-8 text-center shadow-2xl max-w-lg w-full backdrop-blur-sm border-2 ${
          isCorrect ? "bg-green-500/10 border-green-500/30" : "bg-red-500/10 border-red-500/30"
        }`}
      >
        {isCorrect ? (
          <CheckCircle2 className="w-20 h-20 mx-auto mb-4 text-green-400 animate-bounce drop-shadow-lg" />
        ) : (
          <XCircle className="w-20 h-20 mx-auto mb-4 text-red-400 animate-pulse drop-shadow-lg" />
        )}

        <h3 className={`text-4xl font-black mb-4 ${isCorrect ? "text-green-300" : "text-red-300"}`}>
          {isCorrect ? "Betul! 🎉" : "Tidak Tepat 😔"}
        </h3>

        <p className="text-lg text-white/90 mb-6 leading-relaxed">
          {feedback}
        </p>

        {/* Score Breakdown */}
        <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20 mb-4">
          <div className="space-y-3">
            <div className="flex justify-between items-center text-white">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-400" />
                Skor Soalan
              </span>
              <span className="font-bold text-xl">+{baseScore}</span>
            </div>

            {timeBonus > 0 && (
              <div className="flex justify-between items-center text-emerald-300">
                <span className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Bonus Cepat
                </span>
                <span className="font-bold text-xl">+{timeBonus}</span>
              </div>
            )}

            {partialCredit > 0 && !isCorrect && (
              <div className="flex justify-between items-center text-orange-300">
                <span className="flex items-center gap-2">
                  <Minus className="w-5 h-5" />
                  Kredit Separa
                </span>
                <span className="font-bold text-xl">+{partialCredit}</span>
              </div>
            )}

            {hintPenalty > 0 && (
              <div className="flex justify-between items-center text-red-300">
                <span className="flex items-center gap-2">
                  <X className="w-5 h-5" />
                  Penalti Petunjuk
                </span>
                <span className="font-bold text-xl">-{hintPenalty}</span>
              </div>
            )}

            <div className="h-px bg-white/20 my-2"></div>

            <div className="flex justify-between items-center text-white text-xl">
              <span className="font-bold">Jumlah Skor</span>
              <span className="font-black text-2xl text-yellow-300">{totalPoints}</span>
            </div>
          </div>
        </div>

        {/* Close Button */}
        <Button
          onClick={onClose}
          className="w-full mt-6 bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-sm"
          size="lg"
        >
          Teruskan
        </Button>
      </Card>
    </div>
  );
}
