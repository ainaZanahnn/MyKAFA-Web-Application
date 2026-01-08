import React, { useState, useEffect } from 'react';
import { BookOpen, Trophy, Target, Book, Heart, Star, Zap, Sun, Moon, Leaf, Flame } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import dashboardService, { type DashboardData } from '@/services/dashboardService';

const Prestasi: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    lessonsCompleted: 0,
    quizPoints: 0,
    currentLevel: 'Year 1',
    quizzesPassed: 0,
    weakAreas: []
  });
  const [loading, setLoading] = useState(true);

  // Mock subject progress data (replace with API data when available)
  const subjectProgress = [
    { name: 'Al-Quran', completed: 3, total: 5, icon: Book, color: 'from-green-400 to-green-500' },
    { name: 'Fardu Ain', completed: 4, total: 6, icon: Heart, color: 'from-blue-400 to-blue-500' },
    { name: 'Jawi', completed: 2, total: 4, icon: Star, color: 'from-purple-400 to-purple-500' },
    { name: 'Sirah', completed: 5, total: 5, icon: Zap, color: 'from-orange-400 to-orange-500' },
    { name: 'Akhlak', completed: 1, total: 3, icon: Sun, color: 'from-pink-400 to-pink-500' },
    { name: 'Fiqh', completed: 3, total: 4, icon: Moon, color: 'from-indigo-400 to-indigo-500' },
    { name: 'Tauhid', completed: 2, total: 5, icon: Leaf, color: 'from-teal-400 to-teal-500' },
    { name: 'Aqidah', completed: 4, total: 4, icon: Flame, color: 'from-red-400 to-red-500' }
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch dashboard data
        const dashboardDataResponse = await dashboardService.getDashboardData();
        setDashboardData(dashboardDataResponse);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-r from-emerald-50 to-amber-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Header */}
        <div className="text-center mb-10 mt-8">
          <p className="text-3xl md:text-4xl font-bold text-center mb-1 text-gray-800">
            Prestasi Pembelajaran
          </p>
          <p className="text-gray-600 mt-2">Lihat kemajuan dan pencapaian anda!</p>
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
              <p className="text-sm opacity-90 mt-2">Tahun pembelajaran anda! 📅</p>
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
              <p className="text-sm opacity-90 mt-2">Pencapaian keseluruhan! 🏆</p>
            </CardContent>
          </Card>

          {/* Total Achievements */}
          <Card className="bg-gradient-to-r from-green-400 to-green-500 text-white shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-lg font-bold">Jumlah Pencapaian</CardTitle>
              <BookOpen className="h-6 w-6" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-extrabold">
                {loading ? '...' : dashboardData.lessonsCompleted}
              </div>
              <p className="text-sm opacity-90 mt-2">Topik yang diselesaikan! 📖</p>
            </CardContent>
          </Card>
        </div>

        {/* Subject Progress Grid */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-6 text-center">Kemajuan Subjek Tahun Ini 📚</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {subjectProgress.map((subject, index) => {
              const IconComponent = subject.icon;
              const progressPercentage = (subject.completed / subject.total) * 100;
              return (
                <Card key={index} className={`bg-gradient-to-r ${subject.color} text-white shadow-lg hover:shadow-xl transition-shadow`}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <CardTitle className="text-lg font-bold">{subject.name}</CardTitle>
                    <IconComponent className="h-6 w-6" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-extrabold mb-2">
                      {subject.completed}/{subject.total}
                    </div>
                    <Progress value={progressPercentage} className="mb-2" />
                    <p className="text-sm opacity-90">
                      {subject.completed === subject.total ? 'Selesai! 🎉' : 'Teruskan belajar! 📖'}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Prestasi;
