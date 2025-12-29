import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Trophy,
  Target,
  Clock,
  TrendingUp,
  BarChart3,
  RotateCcw,
  Share2,
  Star
} from 'lucide-react';
import type { QuizSummary } from '@/lib/AdaptiveQuizEngine';

interface AdaptiveQuizResultsProps {
  summary: QuizSummary;
  onRestart?: () => void;
  onExit: () => void;
  onShare?: () => void;
}

export function AdaptiveQuizResults({ summary, onRestart, onShare }: AdaptiveQuizResultsProps) {
  const [showDetailedBreakdown, setShowDetailedBreakdown] = useState(false);

  const accuracyPercentage = Math.round((summary.correctAnswers / summary.totalQuestions) * 100);
  const timePerQuestion = Math.round(summary.averageTime || 0);

  const getPerformanceLevel = (accuracy: number): { level: string; color: string; icon: string } => {
    if (accuracy >= 90) return { level: 'Cemerlang', color: 'text-green-600', icon: '🏆' };
    if (accuracy >= 80) return { level: 'Baik', color: 'text-blue-600', icon: '⭐' };
    if (accuracy >= 70) return { level: 'Memuaskan', color: 'text-yellow-600', icon: '👍' };
    if (accuracy >= 60) return { level: 'Perlu Peningkatan', color: 'text-orange-600', icon: '📈' };
    return { level: 'Perlu Bantuan', color: 'text-red-600', icon: '💪' };
  };

  const performance = getPerformanceLevel(accuracyPercentage);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  const getDifficultyColor = (difficulty: string): string => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="text-6xl">{performance.icon}</div>
        <h1 className="text-3xl font-bold text-slate-800">Keputusan Kuiz</h1>
        <div className={`text-xl font-semibold ${performance.color}`}>
          {performance.level}
        </div>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 text-center">
          <Trophy className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-slate-800">{summary.totalScore}</div>
          <div className="text-sm text-slate-600">Jumlah Mata</div>
        </Card>

        <Card className="p-4 text-center">
          <Target className="w-8 h-8 text-blue-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-slate-800">{accuracyPercentage}%</div>
          <div className="text-sm text-slate-600">Ketepatan</div>
        </Card>

        <Card className="p-4 text-center">
          <Clock className="w-8 h-8 text-green-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-slate-800">{formatTime(summary.timeSpent || 0)}</div>
          <div className="text-sm text-slate-600">Masa Diambil</div>
        </Card>

        <Card className="p-4 text-center">
          <TrendingUp className="w-8 h-8 text-purple-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-slate-800">{Math.round((summary.abilityEstimate || 0) * 100)}%</div>
          <div className="text-sm text-slate-600">Tahap Kemahiran</div>
        </Card>
      </div>

      {/* Detailed Stats */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Analisis Prestasi
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Accuracy Breakdown */}
          <div>
            <h3 className="font-medium text-slate-700 mb-2">Ketepatan Jawapan</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Betul</span>
                <span className="text-green-600">{summary.correctAnswers}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Salah</span>
                <span className="text-red-600">{summary.totalQuestions - summary.correctAnswers}</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${accuracyPercentage}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Difficulty Distribution */}
          <div>
            <h3 className="font-medium text-slate-700 mb-2">Taburan Kesukaran</h3>
            <div className="space-y-2">
              {summary.difficultyDistribution && Object.entries(summary.difficultyDistribution).map(([difficulty, count]) => (
                <div key={difficulty} className="flex justify-between items-center">
                  <Badge className={getDifficultyColor(difficulty)}>
                    {difficulty === 'easy' ? 'Mudah' :
                     difficulty === 'medium' ? 'Sederhana' : 'Susah'}
                  </Badge>
                  <span className="text-sm text-slate-600">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Time Analysis */}
          <div>
            <h3 className="font-medium text-slate-700 mb-2">Analisis Masa</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Purata</span>
                <span>{timePerQuestion}s</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Jumlah</span>
                <span>{formatTime(summary.timeSpent || 0)}</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Question History Toggle */}
      <Card className="p-4">
        <Button
          variant="outline"
          onClick={() => setShowDetailedBreakdown(!showDetailedBreakdown)}
          className="w-full"
        >
          {showDetailedBreakdown ? 'Sembunyikan' : 'Tunjukkan'} Pecahan Terperinci
        </Button>
      </Card>

      {/* Detailed Question Breakdown */}
      {showDetailedBreakdown && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Pecahan Soalan</h2>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {summary.questionHistory && summary.questionHistory.map((question, index) => (
              <div
                key={question.questionId}
                className={`p-4 rounded-lg border ${
                  question.answeredCorrectly
                    ? 'bg-green-50 border-green-200'
                    : 'bg-red-50 border-red-200'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium">Soalan {index + 1}</span>
                      <Badge className={getDifficultyColor(question.difficulty)}>
                        {question.difficulty === 'easy' ? 'Mudah' :
                         question.difficulty === 'medium' ? 'Sederhana' : 'Susah'}
                      </Badge>
                      {question.answeredCorrectly ? (
                        <Star className="w-4 h-4 text-green-600" />
                      ) : (
                        <span className="text-red-600">✗</span>
                      )}
                    </div>
                    <div className="text-sm text-slate-600">
                      Masa: {question.timeSpent}s
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        {onRestart && (
          <Button onClick={onRestart} variant="outline" className="flex items-center gap-2">
            <RotateCcw className="w-4 h-4" />
            Cuba Lagi
          </Button>
        )}

        {onShare && (
          <Button onClick={onShare} variant="outline" className="flex items-center gap-2">
            <Share2 className="w-4 h-4" />
            Kongsi
          </Button>
        )}
      </div>

      {/* Topic Mastery Status */}
      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Target className="w-5 h-5" />
          Status Penguasaan Topik
        </h3>
        <div className="space-y-3">
          <div className={`p-4 rounded-lg border-2 ${
            summary.quizPassed
              ? 'bg-green-50 border-green-300'
              : 'bg-red-50 border-red-300'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-slate-800">Topik Semasa</h4>
                <p className="text-sm text-slate-600">
                  {summary.quizPassed ? '✅ Diperolehi' : '❌ Perlu Peningkatan'}
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">
                  {summary.currentTopicPercentage}%
                </div>
                <div className="text-sm text-slate-600">
                  {summary.currentTopicScore}/{summary.currentTopicQuestions}
                </div>
              </div>
            </div>
          </div>

          {summary.weakTopics && summary.weakTopics.length > 0 && (
            <div className="p-4 bg-yellow-50 border-2 border-yellow-300 rounded-lg">
              <h4 className="font-medium text-slate-800 mb-2">Topik Lemah Dikesan</h4>
              <div className="space-y-1">
                {summary.weakTopics.map((topic, index) => (
                  <div key={index} className="text-sm text-slate-600 flex items-center gap-2">
                    <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                    {topic}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Remediation Suggestions */}
      {!summary.quizPassed && (
        <Card className="p-6 bg-orange-50 border-orange-200">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-orange-900">
            <Star className="w-5 h-5" />
            Cadangan Peningkatan
          </h3>
          <div className="space-y-3 text-orange-800">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-orange-200 rounded-full flex items-center justify-center flex-shrink-0">
                📚
              </div>
              <div>
                <h4 className="font-medium">Semak Bahan Pembelajaran</h4>
                <p className="text-sm">Kembali ke bahan pembelajaran untuk topik ini dan fokus pada bahagian yang sukar.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-orange-200 rounded-full flex items-center justify-center flex-shrink-0">
                🎯
              </div>
              <div>
                <h4 className="font-medium">Fokus pada Soalan Salah</h4>
                <p className="text-sm">Lihat penjelasan untuk soalan yang salah dan fahami mengapa jawapan itu betul.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-orange-200 rounded-full flex items-center justify-center flex-shrink-0">
                🔄
              </div>
              <div>
                <h4 className="font-medium">Cuba Lagi</h4>
                <p className="text-sm">Ambil kuiz sekali lagi selepas menyemak bahan untuk meningkatkan skor anda.</p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Performance Insights */}
      <Card className="p-6 bg-blue-50">
        <h3 className="font-semibold text-blue-900 mb-2">Pandangan Prestasi</h3>
        <div className="text-sm text-blue-800 space-y-1">
          {summary.quizPassed && accuracyPercentage >= 80 && (
            <p>🎉 Hebat! Anda telah menguasai topik ini dengan baik.</p>
          )}
          {summary.quizPassed && accuracyPercentage >= 75 && accuracyPercentage < 80 && (
            <p>✅ Tahniah! Anda telah lulus dengan baik. Teruskan pembelajaran!</p>
          )}
          {!summary.quizPassed && accuracyPercentage >= 60 && (
            <p>📈 Hampir sahaja! Cuba lagi untuk capai 75% dan perolehi topik ini.</p>
          )}
          {!summary.quizPassed && accuracyPercentage < 60 && (
            <p>💪 Jangan risau! Semak bahan pembelajaran dan cuba lagi untuk meningkatkan skor.</p>
          )}
          {(summary.abilityEstimate || 0) > 0.7 && (
            <p>⭐ Tahap kemahiran anda tinggi. Cuba kuiz yang lebih mencabar!</p>
          )}
        </div>
      </Card>
    </div>
  );
}
