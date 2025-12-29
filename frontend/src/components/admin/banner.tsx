/** @format */

"use client";

import { GraduationCap } from "lucide-react";

export function Banner() {
  return (
    <div className="bg-primary text-primary-foreground p-6 mx-6 rounded-lg mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">Welcome Back Admin!</h1>
            <p className="text-primary-foreground/80">
              Monitor student progress and course performance.
            </p>
          </div>
          <div className="w-24 h-24 bg-primary-foreground/10 rounded-lg flex items-center justify-center">
            <GraduationCap className="w-12 h-12 text-primary-foreground/60" />
          </div>
        </div>
      </div>
    </div>
  );
}
