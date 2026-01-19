/** @format */

"use client";

import { GraduationCap } from "lucide-react";

export function Banner() {
  return (
    <header className="w-full bg-gradient-to-r from-amber-200 to-amber-200 shadow-sm px-6 py-4 flex justify-between items-center border border-amber-500 rounded-lg mb-6">
      {/* Left side - App Title */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-4xl font-bold text-amber-950/80">Selamat Datang ke MyKAFA</h1>
          </div>
        </div>
      </div>

      {/* Right side - Profile */}
      <div className="w-24 h-24 bg-primary-foreground/10 rounded-lg flex items-center justify-center">
        <GraduationCap className="w-12 h-12 text-black/60" />
      </div>
    </header>
  );
}
