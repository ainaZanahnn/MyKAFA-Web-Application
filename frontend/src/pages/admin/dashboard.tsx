/** @format */

"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  BookOpen,
  HelpCircle,
  UserCheck,
  Trophy,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import adminDashboardService, { type AdminDashboardData } from "@/services/adminDashboardService";

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await adminDashboardService.getDashboardData();
        setDashboardData(data);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading || !dashboardData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Memuatkan data...</div>
      </div>
    );
  }

  const pieData = [
    { name: "Pelajar Aktif", value: dashboardData.activeStudents, color: "hsl(var(--chart-1))" },
    { name: "Pelajar Tidak Aktif", value: dashboardData.totalStudents - dashboardData.activeStudents, color: "hsl(var(--chart-2))" },
  ];

  return (
    <>
      {/* Top Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Jumlah Pelajar</p>
              <p className="text-2xl font-bold">{dashboardData.totalStudents}</p>
            </div>
            <Users className="w-8 h-8 text-chart-1" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Jumlah Kuiz Dijawab
              </p>
              <p className="text-2xl font-bold">{dashboardData.totalQuizzes}</p>
            </div>
            <BookOpen className="w-8 h-8 text-chart-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Pelajar Aktif Hari Ini</p>
              <p className="text-2xl font-bold">{dashboardData.activeStudents}</p>
            </div>
            <UserCheck className="w-8 h-8 text-chart-3" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Pelajar Perlu Perhatian</p>
              <p className="text-2xl font-bold">{dashboardData.studentsNeedingAttention}</p>
            </div>
            <HelpCircle className="w-8 h-8 text-chart-4" />
          </CardContent>
        </Card>
      </div>

      {/* Charts + Top Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Charts */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Status Aktiviti Pelajar</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-8">
                <div className="w-32 h-32">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={30}
                        outerRadius={60}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-chart-1"></div>
                    <span className="text-sm">Pelajar Aktif ({dashboardData.activeStudents})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-chart-2"></div>
                    <span className="text-sm">Pelajar Tidak Aktif ({dashboardData.totalStudents - dashboardData.activeStudents})</span>
                  </div>
                </div>
                <div className="ml-auto">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-muted-foreground">
                      Jumlah
                    </div>
                    <div className="text-3xl font-bold">{dashboardData.totalStudents}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Aktiviti Pengguna Harian (Minggu Ini)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dashboardData.dailyUserData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Bar dataKey="users" fill="hsl(var(--chart-1))" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Performers */}
        <div>
          <Card>
            <CardHeader className="bg-primary text-primary-foreground">
              <CardTitle>Pelajar Terbaik</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {dashboardData.topPerformers.length > 0 ? (
                dashboardData.topPerformers.map((student, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-4 border-b last:border-b-0"
                  >
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-semibold text-sm">
                      <Trophy className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{student.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Purata: {student.avgScore}% ({student.quizzesTaken} kuiz)
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-muted-foreground">
                  Tiada data pelajar terbaik
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
