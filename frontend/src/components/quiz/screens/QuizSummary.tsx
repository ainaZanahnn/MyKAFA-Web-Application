import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Trophy, CheckCircle2, XCircle } from 'lucide-react';

interface QuizSummaryProps {
  totalQuestions: number;
  correctAnswers: number;
  totalScore: number;
  onRetry: () => void;
  onComplete: () => void;
}

export function QuizSummary({
  totalQuestions,
  correctAnswers,
  totalScore,
  onRetry,
  onComplete
}: QuizSummaryProps) {
  const percentage = Math.round((correctAnswers / totalQuestions) * 100);

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="p-8 bg-white shadow-xl">
        <div className="text-center mb-8">
          <Trophy className="w-20 h-20 mx-auto mb-4 text-yellow-500" />
          <h2 className="text-4xl font-bold text-indigo-900 mb-2">Tahniah!</h2>
          <p className="text-gray-600">Anda telah selesaikan kuiz adaptif</p>
        </div>

        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-8 rounded-2xl mb-8">
          <div className="text-center mb-6">
            <p className="text-gray-600 mb-2">Skor Akhir</p>
            <p className="text-6xl font-bold text-indigo-600 mb-2">{totalScore}</p>
            <p className="text-2xl text-gray-700">{percentage}%</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-xl text-center">
              <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-green-600" />
              <p className="text-sm text-gray-600 mb-1">Betul</p>
              <p className="text-2xl font-bold text-green-600">{correctAnswers}</p>
            </div>
            <div className="bg-white p-4 rounded-xl text-center">
              <XCircle className="w-8 h-8 mx-auto mb-2 text-red-600" />
              <p className="text-sm text-gray-600 mb-1">Salah</p>
              <p className="text-2xl font-bold text-red-600">{totalQuestions - correctAnswers}</p>
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
