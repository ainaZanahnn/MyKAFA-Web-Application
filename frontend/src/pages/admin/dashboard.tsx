/** @format */

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  BookOpen,
  HelpCircle,
  FileQuestion,
  Megaphone,
  Activity,
  UserCheck,
  Shield,
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

const pieData = [
  { name: "Pelajar", value: 850, color: "hsl(var(--chart-1))" },
  { name: "Penjaga", value: 395, color: "hsl(var(--chart-2))" },
];

const dailyUserData = [
  { name: "Mon", users: 245 },
  { name: "Tue", users: 312 },
  { name: "Wed", users: 189 },
  { name: "Thu", users: 278 },
  { name: "Fri", users: 356 },
  { name: "Sat", users: 198 },
  { name: "Sun", users: 167 },
];

const newArrivals = [
  { id: 1, title: "Kertas UPKK Baru Ditambah", subtitle: "Modul Matematik" },
  {
    id: 2,
    title: "Keputusan Kuiz Tersedia",
    subtitle: "Kuiz Interaktif Sains",
  },
  { id: 3, title: "Pendaftaran Pengguna", subtitle: "5 Pelajar Baru Hari Ini" },
  {
    id: 4,
    title: "Modul Dikemaskini",
    subtitle: "Modul Pembelajaran Bahasa Inggeris",
  },
];

export default function Dashboard() {
  return (
    <>
      {/* Top Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Jumlah Pengguna</p>
              <p className="text-2xl font-bold">1,245</p>
            </div>
            <Users className="w-8 h-8 text-chart-1" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Modul Pembelajaran
              </p>
              <p className="text-2xl font-bold">28</p>
            </div>
            <BookOpen className="w-8 h-8 text-chart-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Kuiz Aktif</p>
              <p className="text-2xl font-bold">15</p>
            </div>
            <HelpCircle className="w-8 h-8 text-chart-3" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Kertas UPKK</p>
              <p className="text-2xl font-bold">12</p>
            </div>
            <FileQuestion className="w-8 h-8 text-chart-4" />
          </CardContent>
        </Card>
      </div>

      {/* Middle Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Pengumuman</p>
              <p className="text-2xl font-bold">8</p>
            </div>
            <Megaphone className="w-8 h-8 text-chart-1" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Aktiviti Interaktif
              </p>
              <p className="text-2xl font-bold">22</p>
            </div>
            <Activity className="w-8 h-8 text-chart-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Pelajar</p>
              <p className="text-2xl font-bold">850</p>
            </div>
            <UserCheck className="w-8 h-8 text-chart-3" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Penjaga</p>
              <p className="text-2xl font-bold">395</p>
            </div>
            <Shield className="w-8 h-8 text-chart-4" />
          </CardContent>
        </Card>
      </div>

      {/* Charts + Updates */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Charts */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Taburan Jenis Pengguna</CardTitle>
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
                    <span className="text-sm">Pelajar (850)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-chart-2"></div>
                    <span className="text-sm">Penjaga (395)</span>
                  </div>
                </div>
                <div className="ml-auto">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-muted-foreground">
                      Jumlah
                    </div>
                    <div className="text-3xl font-bold">1,245</div>
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
                  <BarChart data={dailyUserData}>
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

        {/* Updates */}
        <div>
          <Card>
            <CardHeader className="bg-primary text-primary-foreground">
              <CardTitle>Kemaskini Terkini</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {newArrivals.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-4 border-b last:border-b-0"
                >
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-semibold text-sm">
                    {item.id}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{item.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.subtitle}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
