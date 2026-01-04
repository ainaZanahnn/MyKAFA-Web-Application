/** @format */

"use client";

import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { LessonTable } from "@/components/admin/lessontable";
import type { Lesson } from "@/components/admin/lessontable";
import lessonService from "@/services/lessonService";
import { toast } from "react-toastify";
import { AddLessonDialog } from "@/components/admin/AddLessonDialog";
import { EditLessonDialog } from "@/components/admin/EditLessonDialog";
import { LessonPagination } from "@/components/admin/LessonPagination";
import { kafaSubjects, yearLevels, yearMapping } from "@/constants/kafaConstants";
import type { Subject } from "@/types/kafaTypes";



export function LearningModuleManagement() {
  // Start with default selections
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null); // Default to "All" subjects
  const [selectedYear, setSelectedYear] = useState<string>("Tahun 1"); // Default to Tahun 1
  const [isAddLessonOpen, setIsAddLessonOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLessons, setTotalLessons] = useState(0);
  const itemsPerPage = 5;



  // Fetch lessons when year, subject, or page changes
  useEffect(() => {
    const fetchLessons = async () => {
      try {
        const englishYear = yearMapping[selectedYear as keyof typeof yearMapping] || selectedYear;
        const params = {
          year_level: englishYear,
          page: currentPage,
          limit: itemsPerPage,
          ...(selectedSubject && { subject: selectedSubject.name })
        };
        const response = await lessonService.getLessons(params);
        // Backend already maps yearLevel to Malay
        const mappedLessons = response.data || [];
        setLessons(mappedLessons);
        setTotalPages(response.pagination?.totalPages || 1);
        setTotalLessons(response.pagination?.total || 0);
      } catch (error) {
        console.error('Error fetching lessons:', error);
        toast.error('Gagal memuatkan pelajaran');
      }
    };

    if (selectedYear) {
      fetchLessons();
    }
  }, [selectedYear, selectedSubject, currentPage]);

  const updateLessonStatus = async (lessonId: number, newStatus: string) => {
    try {
      await lessonService.updateLessonStatus(lessonId, newStatus);
      setLessons((prev) =>
        prev.map((lesson) =>
          lesson.id === lessonId ? { ...lesson, status: newStatus } : lesson
        )
      );
      toast.success('Status pelajaran berjaya dikemaskini');
    } catch (error) {
      console.error('Error updating lesson status:', error);
      toast.error('Gagal mengemaskini status pelajaran');
    }
  };

  const handleEditLesson = (lesson: Lesson) => {
    setEditingLesson(lesson);
  };

  return (
    <div>
        {/* Show Lesson Table */}
        <div>
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
              <Select value={selectedYear} onValueChange={(value) => {
                  setSelectedYear(value);
                  setCurrentPage(1); // Reset to first page when year changes
                }}>
                <SelectTrigger className="w-[120px] bg-white/10 border-white/20 text-white"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {yearLevels.map((year) => (
                    <SelectItem key={year} value={year}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>


              <Select value={selectedSubject ? selectedSubject.name : "All"} onValueChange={(value) => {
                  if (value === "All") {
                    setSelectedSubject(null);
                  } else {
                    const subject = kafaSubjects.find(s => s.name === value);
                    if (subject) setSelectedSubject(subject);
                  }
                  setCurrentPage(1); // Reset to first page when subject changes
                }} >
                <SelectTrigger className="w-[180px] bg-white/10 border-white/20 text-white"> <SelectValue /> </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">Semua</SelectItem>
                  {kafaSubjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.name}>
                      {subject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button size="sm" className="bg-white text-primary" onClick={() => setIsAddLessonOpen(true)}>
                + Tambah Pelajaran
              </Button>
            </div>


            <AddLessonDialog
              isOpen={isAddLessonOpen}
              onOpenChange={setIsAddLessonOpen}
              onLessonAdded={(newLesson) => setLessons((prev) => [...prev, newLesson])}
              selectedYear={selectedYear}
            />

            <EditLessonDialog
              lesson={editingLesson}
              isOpen={!!editingLesson}
              onOpenChange={(open) => !open && setEditingLesson(null)}
              onLessonUpdated={(updatedLesson) =>
                setLessons((prev) =>
                  prev.map((lesson) =>
                    lesson.id === updatedLesson.id ? updatedLesson : lesson
                  )
                )
              }
            />
          </div>
          
          {/* Lesson Table Component */}
          <LessonTable
            lessons={lessons}
            onUpdateStatus={updateLessonStatus}
            onEditLesson={handleEditLesson}
            onDeleteLesson={async (lessonId: number) => {
              if (window.confirm('Are you sure you want to delete this lesson?')) {
                try {
                  await lessonService.deleteLesson(lessonId);
                  setLessons((prev) => prev.filter((lesson) => lesson.id !== lessonId));
                  toast.success('Lesson deleted successfully');
                } catch (error) {
                  console.error('Error deleting lesson:', error);
                  toast.error('Failed to delete lesson');
                }
              }
            }}
          />

          {/* Pagination */}
          {totalLessons > 0 && (
            <LessonPagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalLessons={totalLessons}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
            />
          )}
        </div>
    </div>
  );
}
