import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import type { QuizStats } from '@/types/kafaTypes';

interface QuizInfoProps {
  subject: string;
  year: number;
  stats: QuizStats | null;
  onStartQuiz: () => void;
  onExit: () => void;
}

export function QuizInfo({ subject, year, stats, onStartQuiz, onExit }: QuizInfoProps) {
  return (
    <div className=" bg-gradient-to-r from-emerald-50 to-amber-50 flex items-center justify-center p-1">
      <div className="w-full max-w-xl">
        {/* Header with fun gradient */}
        <div className="bg-gradient-to-r from-pink-400 via-purple-500 to-indigo-500 p-2 text-center rounded-t-3xl shadow-lg relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-300/20 to-pink-300/20"></div>
          <div className="relative z-10">
            <div className="text-7xl mb-2">🎯</div>
            <h2 className="text-3xl font-black text-white mb-2 drop-shadow-lg">Mari Bermain Kuiz!</h2>
            <p className="text-white/90 text-lg font-semibold">
              {subject} - Tahun {year}
            </p>
          </div>
        </div>

        {/* Content with playful design */}
        <div className="bg-white p-2 rounded-b-3xl shadow-xl border-4 border-gradient-to-r from-pink-200 to-purple-200">
          {/* Stats Cards with fun animations */}
          <div className="grid grid-cols-3 gap-4 mb-2">
            <div className="bg-gradient-to-br from-yellow-200 to-orange-300 p-5 rounded-2xl text-center border-4 border-yellow-300 shadow-lg hover:shadow-xl transition-all hover:scale-105">
              <div className="text-4xl mb-2">🏆</div>
              <p className="text-sm font-bold text-yellow-800 mb-1">Skor Terbaik</p>
              <p className="text-3xl font-black text-yellow-900">{stats?.bestScore || 0}</p>
            </div>

            <div className="bg-gradient-to-br from-blue-200 to-cyan-300 p-5 rounded-2xl text-center border-4 border-blue-300 shadow-lg hover:shadow-xl transition-all hover:scale-105">
              <div className="text-4xl mb-2">⭐</div>
              <p className="text-sm font-bold text-blue-800 mb-1">Skor Terakhir</p>
              <p className="text-3xl font-black text-blue-900">{stats?.lastScore || 0}</p>
            </div>

            <div className="bg-gradient-to-br from-purple-200 to-pink-300 p-5 rounded-2xl text-center border-4 border-purple-300 shadow-lg hover:shadow-xl transition-all hover:scale-105">
              <div className="text-4xl mb-2">📊</div>
              <p className="text-sm font-bold text-purple-800 mb-1">Jumlah Cubaan</p>
              <p className="text-3xl font-black text-purple-900">{stats?.totalAttempts || 0}</p>
            </div>
          </div>

          {/* Instructions with fun styling */}
          <div className="bg-gradient-to-r from-emerald-100 to-amber-100 p-2 rounded-2xl border-4 border-emerald-200 mb-3 shadow-lg">
            <h3 className="font-black text-emerald-800 mb-2 text-lg flex items-center justify-center gap-2">
              <span>Peraturan Kuiz!</span>
            </h3>
            <ul className="space-y-3 text-sm text-emerald-700 font-semibold">
              <li className="flex items-start gap-3 bg-white/50 p-2 rounded-xl">
                <span className="text-2xl">⏱️</span>
                <span>Masa terhad untuk setiap soalan</span>
              </li>
              <li className="flex items-start gap-3 bg-white/50 p-2 rounded-xl">
                <span className="text-2xl">💡</span>
                <span>Gunakan petunjuk jika perlu bantuan!</span>
              </li>
              <li className="flex items-start gap-3 bg-white/50 p-2 rounded-xl">
                <span className="text-2xl">❗</span>
                <span>Dapatkan sekurang-kurangnya 75% untuk lulus kuiz ini!</span>
              </li>
            </ul>
          </div>

          {/* Action buttons with fun styling */}
          <div className="flex gap-4">
            <Button
              onClick={onExit}
              variant="outline"
              className="flex-1 border-4 border-gray-300 text-gray-700 hover:bg-gray-100 py-5 text-lg font-black rounded-2xl shadow-lg hover:shadow-xl transition-all hover:scale-105 bg-gradient-to-r from-gray-50 to-gray-100"
            >
              <ArrowLeft className="w-6 h-6 mr-3" />
              Kembali
            </Button>
            <Button
              onClick={onStartQuiz}
              className="flex-1 bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-white py-5 text-xl font-black rounded-2xl shadow-lg hover:shadow-xl transition-all hover:scale-105 border-4 border-green-300"
            >
              Mula
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
