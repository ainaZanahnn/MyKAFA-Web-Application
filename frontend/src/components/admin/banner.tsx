/** @format */

"use client";

import { GraduationCap } from "lucide-react";

export function Banner() {
  return (
    <div className="bg-primary text-primary-foreground p-6 mx-6 rounded-lg mb-6 shadow-sm px-6 py-4 flex justify-between items-center border">
      <div>
        <h1 className="text-2xl font-bold">Selamat Kembali ke MyKAFA!</h1>
        <p className="text-primary-foreground/80">
          Pantau kemajuan pelajar anda dan prestasi mereka
        </p>
      </div>

      {/* Right side - Profile */}
      <div className="w-24 h-24 bg-primary-foreground/10 rounded-lg flex items-center justify-center">
        <GraduationCap className="w-12 h-12 text-primary-foreground/60" />
      </div>
    </div>
  );
}
