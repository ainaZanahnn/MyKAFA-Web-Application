/** @format */

"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { kafaSubjects, yearLevels } from "../../lib/kafa-config";
import type { Subject } from "../../lib/kafa-config";

interface LessonManagementHeaderProps {
  selectedYear: string;
  selectedSubject: Subject | null;
  onYearChange: (year: string) => void;
  onSubjectChange: (subject: Subject | null) => void;
  onAddLesson: () => void;
}

export function LessonManagementHeader({
  selectedYear,
  selectedSubject,
  onYearChange,
  onSubjectChange,
  onAddLesson,
}: LessonManagementHeaderProps) {
  return (
    <div className="bg-primary text-primary-foreground p-4 rounded-t-lg flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div>
          <h2 className="text-lg font-semibold">
            Pengurusan Modul Pembelajaran
          </h2>
          <p className="text-sm text-primary-foreground/80">
            Urus pelajaran dan kandungan
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Select value={selectedYear} onValueChange={onYearChange}>
          <SelectTrigger className="w-[120px] bg-white/10 border-white/20 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {yearLevels.map((year: string) => (
              <SelectItem key={year} value={year}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={selectedSubject ? selectedSubject.name : "All"}
          onValueChange={(value: string) => {
            if (value === "All") {
              onSubjectChange(null);
            } else {
              const subject = kafaSubjects.find((subject: Subject) => subject.name === value);
              if (subject) onSubjectChange(subject);
            }
          }}
        >
          <SelectTrigger className="w-[180px] bg-white/10 border-white/20 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">Semua</SelectItem>
            {kafaSubjects.map((subject: Subject) => (
              <SelectItem key={subject.id} value={subject.name}>
                {subject.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button size="sm" className="bg-white text-primary" onClick={onAddLesson}>
        + Tambah Pelajaran
      </Button>
    </div>
  );
}
