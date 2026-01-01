/** @format */

"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Edit,
  Trash2,
  MoreHorizontal,
} from "lucide-react";

export type Lesson = {
  id: number;
  subject: string;
  title: string;
  description: string;
  materials: {
    id: number;
    type: "PDF" | "PPT" | "Video" | "Audio" | "Link";
    title: string;
    url?: string;
  }[];
  yearLevel: string;
  status: string;
  order: number;
};

interface LessonTableProps {
  lessons: Lesson[];
  onUpdateStatus: (lessonId: number, newStatus: string) => void;
  onDeleteLesson?: (lessonId: number) => void;
  onEditLesson?: (lesson: Lesson) => void;
}

export function LessonTable({ lessons, onUpdateStatus, onDeleteLesson, onEditLesson }: LessonTableProps) {
  return (
    <>
      <div className="bg-card rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted/50">
          <tr>
            <th className="p-4 text-left">Susunan</th>
            <th className="p-4 text-left">Tajuk Pelajaran</th>
            <th className="p-4 text-left">Kandungan</th>
            <th className="p-4 text-left">Tahap</th>
            <th className="p-4 text-left">Status</th>
            <th className="p-4 text-left">Tindakan</th>
          </tr>
        </thead>
        <tbody>
          {lessons.map((lesson) => (
            <tr key={lesson.id} className="border-b hover:bg-muted/30">
              <td className="p-4">{lesson.order}</td>
              <td className="p-4">
                <div className="font-medium">{lesson.title}</div>
                <div className="text-sm text-muted-foreground">
                  {lesson.description}
                </div>
              </td>
              <td className="p-4">
                <div className="flex gap-3 text-sm">
                  {lesson.materials && lesson.materials.filter(m => m.type === "PDF").length > 0 && (
                    <span>📄 {lesson.materials.filter(m => m.type === "PDF").length}</span>
                  )}
                  {lesson.materials && lesson.materials.filter(m => m.type === "PPT").length > 0 && (
                    <span>📊 {lesson.materials.filter(m => m.type === "PPT").length}</span>
                  )}
                  {lesson.materials && lesson.materials.filter(m => m.type === "Video").length > 0 && (
                    <span>🎞 {lesson.materials.filter(m => m.type === "Video").length}</span>
                  )}
                  {lesson.materials && lesson.materials.filter(m => m.type === "Audio").length > 0 && (
                    <span>🔊 {lesson.materials.filter(m => m.type === "Audio").length}</span>
                  )}
                  {lesson.materials && lesson.materials.filter(m => m.type === "Link").length > 0 && (
                    <span>🔗 {lesson.materials.filter(m => m.type === "Link").length}</span>
                  )}
                </div>
              </td>
              <td className="p-4">{lesson.yearLevel}</td>
              <td className="p-4">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  lesson.status === 'diterbitkan'
                    ? 'bg-green-100 text-green-800'
                    : lesson.status === 'draf'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {lesson.status === 'diterbitkan' ? 'Diterbitkan' :
                   lesson.status === 'draf' ? 'Draf' :
                   lesson.status === 'diarkibkan' ? 'Diarkibkan' : 'Tidak Diketahui'}
                </span>
              </td>
              <td className="p-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => onEditLesson?.(lesson)}>
                      <Edit className="w-4 h-4 mr-2" /> Edit Maklumat Pelajaran
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {lesson.status !== 'draf' && (
                      <DropdownMenuItem onClick={() => onUpdateStatus(lesson.id, 'draf')}>
                        📝 Tetapkan sebagai Draf
                      </DropdownMenuItem>
                    )}
                    {lesson.status !== 'diterbitkan' && (
                      <DropdownMenuItem onClick={() => onUpdateStatus(lesson.id, 'diterbitkan')}>
                        🟢 Terbitkan Pelajaran
                      </DropdownMenuItem>
                    )}
                    {lesson.status !== 'diarkibkan' && (
                      <DropdownMenuItem onClick={() => onUpdateStatus(lesson.id, 'diarkibkan')}>
                        📦 Arkibkan Pelajaran
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-red-600"
                      onClick={() => onDeleteLesson?.(lesson.id)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" /> Padam Pelajaran
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </>
  );
}
