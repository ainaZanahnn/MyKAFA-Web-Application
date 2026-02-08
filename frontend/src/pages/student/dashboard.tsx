import React, { useState, useEffect } from 'react';
import { Megaphone, Book } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Banner } from '@/components/student/banner';
import announcementService, { type Announcement } from '@/services/announcementService';

const Dashboard: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch announcements
        const announcementsResponse = await announcementService.getAnnouncements();
        setAnnouncements(announcementsResponse.data || []);
      } catch (error) {
        console.error('Error fetching announcements:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);



  return (
    <div className="min-h-screen bg-gradient-to-r from-emerald-50 to-amber-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Banner */}
        <Banner />

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          {/* System Rules & Regulations - Purple Theme */}
          <Card className="bg-gradient-to-br from-purple-100 to-indigo-100 border-2 border-purple-300 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-purple-200 to-indigo-200 rounded-t-lg">
              <CardTitle className="flex items-center gap-3 text-xl font-bold text-gray-800">
                <Book className="h-7 w-7 text-purple-600" />
                Peraturan & Cara Sistem Berfungsi 
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-lg border-l-4 border-purple-500 shadow-md">
                  <h4 className="font-bold text-lg text-gray-900 mb-2">Sistem Pembelajaran Adaptif</h4>
                  <p className="text-base text-gray-700 mb-2">
                    MyKAFA menggunakan kaedah adaptif untuk menyesuaikan tahap kesukaran soalan mengikut tahap prestasi.
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg border-l-4 border-purple-500 shadow-md">
                  <h4 className="font-bold text-lg text-gray-900 mb-2">Pengukuran Kemahiran</h4>
                  <p className="text-base text-gray-700 mb-2">
                    MyKAFA mengukur tahap kemahiran secara berterusan.
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg border-l-4 border-purple-500 shadow-md">
                  <h4 className="font-bold text-lg text-gray-900 mb-2">Sistem Mata dan Pencapaian</h4>
                  <p className="text-base text-gray-700 mb-2">
                    Mata diperoleh melalui kuiz dan aktiviti pembelajaran. 
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Latest Announcements - Blue Theme */}
          <Card className="bg-gradient-to-br from-blue-100 to-cyan-100 border-2 border-blue-300 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-200 to-cyan-200 rounded-t-lg">
              <CardTitle className="flex items-center gap-3 text-xl font-bold text-gray-800">
                <Megaphone className="h-7 w-7 text-blue-600" />
                Berita Terkini Daripada MyKAFA
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {loading ? (
                <p className="text-lg text-gray-600 animate-pulse">Memeriksa kemas kini...</p>
              ) : announcements.length > 0 ? (
                <div className="space-y-4">
                  {announcements
                    .filter(announcement => announcement.target === 'semua' || announcement.target === 'pelajar')
                    .slice(0, 2)
                    .map((announcement, index) => (
                    <div key={index} className="bg-white p-4 rounded-lg shadow-md border-l-4 border-blue-500">
                      <h4 className="font-bold text-xl text-gray-900 mb-3">
                        {announcement.title}
                      </h4>
                      <p className="text-base text-gray-700 mb-5 leading-relaxed">
                        {announcement.content.length > 400
                          ? `${announcement.content.substring(0, 400)}...`
                          : announcement.content}
                      </p>
                      <Badge variant="secondary" className="text-sm px-3 py-1 bg-blue-100 text-blue-800">
                        {announcement.created_at ? new Date(announcement.created_at).toLocaleDateString() : 'Terkini'}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-xl font-bold text-blue-600 mb-2">Tunggu Sahaja! 👀</p>
                  <p className="text-lg text-gray-600">Tiada pengumuman baru buat masa ini. Semak semula tidak lama lagi!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
