"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Users, Target, BookOpen } from 'lucide-react';
import { AdaptiveQuizPlayer } from './AdaptiveQuizPlayer';
import { defaultAdaptiveSettings } from '@/lib/quiz-constants';
import type { QuizSummary } from '@/lib/AdaptiveQuizEngine';
import { useAuth } from '@/components/auth/useAuth';

interface QuizOption {
  id: string;
  title: string;
  subject: string;
  topic: string;
  year: number;
  difficulty: 'Mudah' | 'Sederhana' | 'Sukar';
  questionsCount: number;
  estimatedTime: number;
  description: string;
  color: string;
}

const availableQuizzes: QuizOption[] = [
  {
    id: 'math-algebra-1',
    title: 'Asas Algebra',
    subject: 'Mathematics',
    topic: 'Algebra',
    year: 1,
    difficulty: 'Mudah',
    questionsCount: 10,
    estimatedTime: 15,
    description: 'Pengenalan kepada konsep asas algebra termasuk pemboleh ubah dan ungkapan algebra.',
    color: 'from-blue-400 to-blue-600'
  },
  {
    id: 'math-geometry-2',
    title: 'Geometri Asas',
    subject: 'Mathematics',
    topic: 'Geometry',
    year: 2,
    difficulty: 'Sederhana',
    questionsCount: 12,
    estimatedTime: 20,
    description: 'Belajar tentang bentuk, sudut, dan sifat-sifat geometri asas.',
    color: 'from-green-400 to-green-600'
  },
  {
    id: 'science-physics-3',
    title: 'Fizik: Gerakan dan Daya',
    subject: 'Science',
    topic: 'Physics',
    year: 3,
    difficulty: 'Sukar',
    questionsCount: 15,
    estimatedTime: 25,
    description: 'Konsep gerakan, daya, dan undang-undang Newton dalam fizik.',
    color: 'from-purple-400 to-purple-600'
  },
  {
    id: 'bahasa-arab-grammar-1',
    title: 'Saraf Bahasa Arab',
    subject: 'Bahasa Arab',
    topic: 'Grammar',
    year: 1,
    difficulty: 'Mudah',
    questionsCount: 8,
    estimatedTime: 12,
    description: 'Pengenalan kepada tatabahasa asas Bahasa Arab.',
    color: 'from-amber-400 to-orange-500'
  }
];

export function TestAdaptiveHints() {
  const { user: currentUser } = useAuth();
  const [selectedQuiz, setSelectedQuiz] = useState<QuizOption | null>(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizSummary, setQuizSummary] = useState<QuizSummary | null>(null);

  const handleQuizComplete = (summary: QuizSummary) => {
    setQuizSummary(summary);
    setShowQuiz(false);
  };

  const handleRestart = () => {
    setQuizSummary(null);
    setShowQuiz(false);
    setSelectedQuiz(null);
  };

  const handleStartQuiz = async (quiz: QuizOption) => {
    if (!currentUser) {
      alert('Sila log masuk terlebih dahulu');
      return;
    }

    try {
      setSelectedQuiz(quiz);
      setShowQuiz(true);
    } catch (error) {
      console.error('Error starting quiz:', error);
      alert('Ralat semasa memulakan kuiz');
    }
  };

  if (showQuiz && selectedQuiz) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6">
          <Button
            onClick={() => setShowQuiz(false)}
            variant="outline"
            className="mb-4"
          >
            ← Kembali ke Pilihan Kuiz
          </Button>

          {/* Quiz Header */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6 mb-6">
            <div className="flex items-center gap-4 mb-4">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${selectedQuiz.color} flex items-center justify-center text-white text-xl font-bold`}>
                🧠
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-800">
                  {selectedQuiz.title}
                </h1>
                <p className="text-slate-600">
                  {selectedQuiz.subject} - {selectedQuiz.topic} (Tahun {selectedQuiz.year})
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-blue-600" />
                <span className="font-medium">Kesukaran:</span>
                <Badge variant={selectedQuiz.difficulty === 'Mudah' ? 'secondary' : selectedQuiz.difficulty === 'Sederhana' ? 'default' : 'destructive'}>
                  {selectedQuiz.difficulty}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-green-600" />
                <span className="font-medium">Soalan:</span>
                <span>{selectedQuiz.questionsCount}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-orange-600" />
                <span className="font-medium">Masa Anggaran:</span>
                <span>{selectedQuiz.estimatedTime} minit</span>
              </div>
            </div>

            <p className="text-slate-600 mt-4">
              {selectedQuiz.description}
            </p>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <div className="text-yellow-600 text-lg">💡</div>
              <div>
                <h3 className="font-semibold text-yellow-900 mb-1">Sistem Petunjuk Adaptif</h3>
                <p className="text-yellow-800 text-sm">
                  Sistem ini akan memberikan petunjuk apabila anda menjawab beberapa soalan dengan salah berturut-turut.
                  Petunjuk akan membantu anda memahami konsep dengan lebih baik.
                </p>
              </div>
            </div>
          </div>
        </div>

        <AdaptiveQuizPlayer
          settings={defaultAdaptiveSettings}
          questions={[]} // Not needed - component uses backend service
          onComplete={handleQuizComplete}
          onExit={() => setShowQuiz(false)}
        />
      </div>
    );
  }

  if (quizSummary && selectedQuiz) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card className="p-8 text-center">
          <div className="mb-6">
            <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${selectedQuiz.color} flex items-center justify-center text-white text-2xl mx-auto mb-4`}>
              {quizSummary.correctAnswers >= quizSummary.totalQuestions * 0.7 ? '🎉' : quizSummary.correctAnswers >= quizSummary.totalQuestions * 0.5 ? '👍' : '💪'}
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">
              Keputusan Kuiz Selesai!
            </h2>
            <p className="text-slate-600">
              {selectedQuiz.title} - {selectedQuiz.subject}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{quizSummary.correctAnswers}</div>
              <div className="text-sm text-slate-600">Betul</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">{quizSummary.totalQuestions - quizSummary.correctAnswers}</div>
              <div className="text-sm text-slate-600">Salah</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{Math.round((quizSummary.correctAnswers / quizSummary.totalQuestions) * 100)}%</div>
              <div className="text-sm text-slate-600">Ketepatan</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">{Math.round((quizSummary.abilityEstimate || 0) * 100)}%</div>
              <div className="text-sm text-slate-600">Tahap Kemahiran</div>
            </div>
          </div>

          <div className="flex gap-3 justify-center">
            <Button onClick={handleRestart} variant="outline">
              Pilih Kuiz Lain
            </Button>
            <Button onClick={() => handleStartQuiz(selectedQuiz)} className="bg-blue-600 hover:bg-blue-700">
              Cuba Lagi
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-slate-800 mb-4">
          Kuiz Adaptif Interaktif
        </h1>
        <p className="text-lg text-slate-600 mb-2">
          Pilih kuiz yang ingin anda cuba. Sistem akan menyesuaikan kesukaran berdasarkan prestasi anda.
        </p>
        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium">
          <Users className="w-4 h-4" />
          Sistem Petunjuk Pintar Diaktifkan
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {availableQuizzes.map((quiz) => (
          <Card key={quiz.id} className="p-6 hover:shadow-lg transition-shadow cursor-pointer group" onClick={() => handleStartQuiz(quiz)}>
            <div className="flex items-start gap-4 mb-4">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${quiz.color} flex items-center justify-center text-white text-xl font-bold group-hover:scale-110 transition-transform`}>
                {quiz.subject === 'Mathematics' ? '🔢' : quiz.subject === 'Science' ? '🧪' : '📚'}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-slate-800 mb-1 group-hover:text-blue-600 transition-colors">
                  {quiz.title}
                </h3>
                <p className="text-slate-600 text-sm mb-2">
                  {quiz.subject} • Tahun {quiz.year} • {quiz.topic}
                </p>
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <Badge variant={quiz.difficulty === 'Mudah' ? 'secondary' : quiz.difficulty === 'Sederhana' ? 'default' : 'destructive'} className="text-xs">
                    {quiz.difficulty}
                  </Badge>
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-3 h-3" />
                    {quiz.questionsCount} soalan
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {quiz.estimatedTime} min
                  </span>
                </div>
              </div>
            </div>

            <p className="text-slate-600 text-sm mb-4">
              {quiz.description}
            </p>

            <Button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 group-hover:shadow-md transition-all">
              Mula Kuiz
            </Button>
          </Card>
        ))}
      </div>

      <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
          <Target className="w-5 h-5 text-blue-600" />
          Bagaimana Sistem Adaptif Berfungsi?
        </h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm text-slate-600">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">1</div>
            <p>Sistem menjejaki prestasi anda dan menyesuaikan kesukaran soalan</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">2</div>
            <p>Petunjuk automatik muncul apabila anda menghadapi kesukaran</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">3</div>
            <p>Belajar dengan lebih cekap melalui pengalaman yang diperibadikan</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">4</div>
            <p>Jejak kemajuan anda dan fokus pada topik yang memerlukan penambahbaikan</p>
          </div>
        </div>
      </div>
    </div>
  );
}
