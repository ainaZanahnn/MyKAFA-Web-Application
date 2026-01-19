import React, { useState, useEffect } from 'react';
import { Trophy, Target, /*Book, Heart,*/ Star, /*Zap, Sun, Moon, Leaf, Flame, */ RefreshCw, AlertCircle, BookOpen } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
//import { Progress } from '@/components/ui/progress';
import dashboardService, { type DashboardData } from '@/services/dashboardService';
import { useRealTimeUpdates } from '@/hooks/useRealTimeUpdates';

// Function to determine skill level based on ability estimate
const getSkillLevel = (ability: number) => {
  if (ability >= 0.8) {
    return { level: 'Pakar', stars: 5, color: 'text-yellow-300' };
  } else if (ability >= 0.7) {
    return { level: 'Mahir', stars: 4, color: 'text-yellow-200' };
  } else if (ability >= 0.6) {
    return { level: 'Baik', stars: 3, color: 'text-yellow-100' };
  } else if (ability >= 0.4) {
    return { level: 'Sederhana', stars: 2, color: 'text-gray-200' };
  } else {
    return { level: 'Pemula', stars: 1, color: 'text-gray-300' };
  }
};

const Prestasi: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    lessonsCompleted: 0,
    quizPoints: 0,
    currentLevel: 'Year 1',
    quizzesPassed: 0,
    weakAreas: [],
    currentAbility: 0.5,
    highestAbility: 0.5,
    totalQuizAttempts: 0,
    subjectYearAbilities: []
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) {
        setRefreshing(true);
      }
      // Fetch dashboard data
      const dashboardDataResponse = await dashboardService.getDashboardData();
      setDashboardData(dashboardDataResponse);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
      if (isManualRefresh) {
        setRefreshing(false);
      }
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchData();

    // Set up auto-refresh every 30 seconds
    const intervalId = setInterval(() => {
      fetchData();
    }, 30000);

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  // Listen for real-time quiz completion updates
  useRealTimeUpdates('quiz-completed', () => {
    console.log('Real-time update: Quiz completed, refreshing dashboard data...');
    fetchData();
  });



  return (
    <div className="min-h-screen bg-gradient-to-r from-emerald-50 to-amber-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Header */}
        <div className="text-center mb-10 mt-8">
          <div className="flex items-center justify-center gap-4 mb-4">
            <p className="text-3xl md:text-4xl font-bold text-center mb-1 text-gray-800">
              Prestasi Pembelajaran
            </p>
            <button
              onClick={() => fetchData(true)}
              disabled={refreshing}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50"
              title="Refresh data"
            >
              <RefreshCw className={`w-5 h-5 text-gray-600 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {/* Current Year */}
          <Card className="bg-gradient-to-r from-purple-400 to-purple-500 text-white shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-lg font-bold">Tahun Semasa</CardTitle>
              <Target className="h-6 w-6" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-extrabold">
                {loading ? '...' : dashboardData.currentLevel}
              </div>
              <p className="text-sm opacity-95 mt-2">Tahun pembelajaran anda!</p>
            </CardContent>
          </Card>

          {/* Total Quiz Points */}
          <Card className="bg-gradient-to-r from-blue-400 to-blue-500 text-white shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-lg font-bold">Jumlah Mata Kuiz</CardTitle>
              <Trophy className="h-6 w-6" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-extrabold">
                {loading ? '...' : dashboardData.quizPoints}
              </div>
              <p className="text-sm opacity-95 mt-2">Pencapaian keseluruhan!</p>
            </CardContent>
          </Card>

          {/* Current Ability Estimate */}
          <Card className="bg-gradient-to-r from-green-400 to-green-500 text-white shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-lg font-bold">Purata Kemahiran Anda</CardTitle>
              <div className="flex items-center gap-1">
                {loading ? '...' : (() => {
                  const skillLevel = getSkillLevel(dashboardData.currentAbility);
                  return Array.from({ length: skillLevel.stars }, (_, i) => (
                    <Star key={i} className={`w-4 h-4 ${skillLevel.color}`} fill="currentColor" />
                  ));
                })()}
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-extrabold mb-1">
                {loading ? '...' : getSkillLevel(dashboardData.currentAbility).level}
              </div>
              <p className="text-sm opacity-95">
                {dashboardData.totalQuizAttempts > 0
                  ? `Berdasarkan ${dashboardData.totalQuizAttempts} percubaan kuiz`
                  : 'Belum ada data kuiz'
                }
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Subject-Specific Ability Breakdown */}
        {dashboardData.subjectYearAbilities.length > 0 && (
          <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-300 shadow-lg mb-10">
            <CardHeader className="bg-gradient-to-r from-blue-200 to-cyan-200 rounded-t-lg">
              <CardTitle className="flex items-center gap-3 text-xl font-bold text-gray-800">
                <BookOpen className="h-7 w-7 text-blue-600" />
                Penilaian Kemahiran Mengikut Mata Pelajaran
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {loading ? (
                <p className="text-lg text-gray-600 animate-pulse">Memuatkan data kemahiran...</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {dashboardData.subjectYearAbilities.map((subjectAbility, index) => (
                    <div key={index} className="bg-white p-4 rounded-lg border border-blue-200 shadow-md">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-bold text-lg text-gray-900">
                          {subjectAbility.subject}
                        </h4>
                        <span className="text-sm text-gray-500 bg-blue-100 px-2 py-1 rounded">
                          Tahun {subjectAbility.year}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex items-center gap-1">
                          {Array.from({ length: getSkillLevel(subjectAbility.ability).stars }, (_, i) => (
                            <Star key={i} className={`w-4 h-4 ${getSkillLevel(subjectAbility.ability).color}`} fill="currentColor" />
                          ))}
                        </div>
                        <span className="text-sm font-semibold text-gray-700">
                          {getSkillLevel(subjectAbility.ability).level}
                        </span>
                      </div>

                      <div className="text-sm text-gray-600 space-y-1">
                        <p>Kemahiran: {(subjectAbility.ability * 100).toFixed(1)}%</p>
                        <p>Percubaan: {subjectAbility.attempts}</p>
                        <p>Terbaik: {(subjectAbility.maxAbility * 100).toFixed(1)}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Weak Areas - Purple Theme */}
        <Card className="bg-gradient-to-br from-purple-100 to-indigo-100 border-2 border-purple-300 shadow-lg mb-10">
          <CardHeader className="bg-gradient-to-r from-purple-200 to-indigo-200 rounded-t-lg">
            <CardTitle className="flex items-center gap-3 text-xl font-bold text-gray-800">
              <AlertCircle className="h-7 w-7 text-purple-600" />
              Topik Yang Perlu Diperbaiki
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {loading ? (
              <p className="text-lg text-gray-600 animate-pulse">Memuatkan kemajuan anda...</p>
            ) : dashboardData.weakAreas.length > 0 ? (
              <div className="space-y-4">
                {dashboardData.weakAreas.map((area, index) => (
                  <div key={index} className="bg-white p-4 rounded-lg border-l-4 border-purple-500 shadow-md">
                    <h4 className="font-bold text-lg text-gray-900 mb-2">
                      {area.subject} - {area.topic}
                    </h4>
                    <p className="text-base text-gray-700 mb-2">{area.issue}</p>
                    <p className="text-base text-purple-700 font-semibold">{area.recommendation} 💡</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-xl font-bold text-green-600 mb-2">Kerja Hebat! 🎉</p>
                <p className="text-lg text-gray-600">Tiada Topik yang lemah dikenal pasti</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Prestasi;
