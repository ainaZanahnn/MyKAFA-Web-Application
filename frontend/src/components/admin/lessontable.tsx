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
                <Select
                  value={lesson.status}
                  onValueChange={(value) => onUpdateStatus(lesson.id, value)}
                >
                  <SelectTrigger className="w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Published">Diterbitkan</SelectItem>
                    <SelectItem value="Unpublished">Tidak Diterbitkan</SelectItem>
                    <SelectItem value="Draft">Draf</SelectItem>
                  </SelectContent>
                </Select>
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
