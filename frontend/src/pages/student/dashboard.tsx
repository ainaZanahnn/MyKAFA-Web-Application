/** @format */

"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Banner } from "@/components/student/banner";
import { Users, BookOpen, HelpCircle, FileQuestion } from "lucide-react";

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
