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
    <div className="bg-gradient-to-r from-emerald-50 to-amber-50 flex items-center justify-center p-2">
      <div className="max-w-2xl">
        {/* Compact Header */}
        <div className="bg-gradient-to-r from-pink-400 via-purple-500 to-indigo-500 p-3 text-center rounded-t-2xl shadow-lg relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-300/20 to-pink-300/20"></div>
          <div className="relative z-10">
            <div className="text-5xl mb-1">🎯</div>
            <h2 className="text-2xl font-black text-white mb-1 drop-shadow-lg">Mari Bermain Kuiz!</h2>
            <p className="text-white/90 text-base font-semibold">
              {subject} - Tahun {year}
            </p>
          </div>
        </div>

        {/* Compact Content */}
        <div className="bg-white p-3 rounded-b-2xl shadow-xl border-2 border-gradient-to-r from-pink-200 to-purple-200">
          {/* Layout: Stats above, Rules and Scoring side by side */}
          <div className="space-y-3 mb-3">
            {/* Stats Cards - Full width on top */}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-gradient-to-br from-yellow-200 to-orange-300 p-3 rounded-xl text-center border-2 border-yellow-300 shadow-md hover:shadow-lg transition-all">
                <div className="text-2xl mb-1">🏆</div>
                <p className="text-xs font-bold text-yellow-800 mb-1">Keputusan Terbaik</p>
                <p className="text-xl font-black text-yellow-900">{stats?.bestScore || 0}%</p>
              </div>

              <div className="bg-gradient-to-br from-blue-200 to-cyan-300 p-3 rounded-xl text-center border-2 border-blue-300 shadow-md hover:shadow-lg transition-all">
                <div className="text-2xl mb-1">⭐</div>
                <p className="text-xs font-bold text-blue-800 mb-1">Keputusan Terakhir</p>
                <p className="text-xl font-black text-blue-900">{stats?.lastScore || 0}%</p>
              </div>

              <div className="bg-gradient-to-br from-purple-200 to-pink-300 p-3 rounded-xl text-center border-2 border-purple-300 shadow-md hover:shadow-lg transition-all">
                <div className="text-2xl mb-1">📊</div>
                <p className="text-xs font-bold text-purple-800 mb-1">Jumlah Cubaan</p>
                <p className="text-xl font-black text-purple-900">{stats?.totalAttempts || 0}</p>
              </div>
            </div>

            {/* Rules and Scoring side by side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Rules Section */}
              <div className="bg-gradient-to-r from-emerald-100 to-amber-100 p-3 rounded-xl border-2 border-emerald-200 shadow-md">
                <h3 className="font-black text-emerald-800 mb-2 text-base flex items-center justify-center gap-2">
                  <span>📋 Peraturan Kuiz!</span>
                </h3>
                <ul className="space-y-2 text-xs text-emerald-700 font-semibold">
                  <li className="flex items-start gap-2 bg-white/50 p-2 rounded-lg">
                    <span className="text-lg">⏱️</span>
                    <span>Masa terhad untuk setiap soalan</span>
                  </li>
                  <li className="flex items-start gap-2 bg-white/50 p-2 rounded-lg">
                    <span className="text-lg">💡</span>
                    <span>Gunakan petunjuk jika perlu bantuan!</span>
                  </li>
                  <li className="flex items-start gap-2 bg-white/50 p-2 rounded-lg">
                    <span className="text-lg">❗</span>
                    <span>Dapatkan sekurang-kurangnya 75% untuk lulus!</span>
                  </li>
                </ul>
              </div>

              {/* Scoring Section */}
              <div className="bg-gradient-to-r from-blue-100 to-indigo-100 p-3 rounded-xl border-2 border-blue-200 shadow-md">
                <h3 className="font-black text-blue-800 mb-2 text-base flex items-center justify-center gap-2">
                  <span>🎯 Cara Dapat Markah!</span>
                </h3>
                <ul className="space-y-2 text-xs text-blue-700 font-semibold">
                  <li className="flex items-start gap-2 bg-white/50 p-2 rounded-lg">
                    <span className="text-lg">🎯</span>
                    <span>Jawapan satu: Betul = markah penuh, Salah = 0</span>
                  </li>
                  <li className="flex items-start gap-2 bg-white/50 p-2 rounded-lg">
                    <span className="text-lg">📊</span>
                    <span>Jawapan banyak: Markah untuk setiap jawapan betul</span>
                  </li>
                  <li className="flex items-start gap-2 bg-white/50 p-2 rounded-lg">
                    <span className="text-lg">💡</span>
                    <span>Permarkahan juga dipengaruhi berdasarkan tahap kesukaran</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Action buttons - Compact */}
          <div className="flex gap-3">
            <Button
              onClick={onExit}
              variant="outline"
              className="flex-1 border-2 border-gray-300 text-gray-700 hover:bg-gray-100 py-3 text-base font-black rounded-xl shadow-md hover:shadow-lg hover:scale-90 hover:font-extrabold transition-all bg-gradient-to-r from-gray-50 to-gray-100"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Kembali
            </Button>
            <Button
              onClick={onStartQuiz}
              className="flex-1 bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-white py-3 text-lg font-black rounded-xl shadow-md hover:shadow-lg hover:scale-110 hover:font-extrabold transition-all border-2 border-green-300"
            >
              Mula Kuiz
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
