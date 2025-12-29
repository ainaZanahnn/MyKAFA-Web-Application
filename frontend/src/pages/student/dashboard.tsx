/** @format */

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Banner } from "@/components/student/banner";
import {
  Users,
  BookOpen,
  HelpCircle,
  FileQuestion,
  Megaphone,
  Activity,
  UserCheck,
  Shield,
  GraduationCap,
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
      <Banner />
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
    </>
  );
}
