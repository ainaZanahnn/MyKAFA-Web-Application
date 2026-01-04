/** @format */

"use client";

import { Button } from "../../components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import {
  Edit,
  Trash2,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import type { AdaptiveQuizSettings } from '../../lib/AdaptiveQuizEngine';

export interface Question {
  id?: number;
  questionText: string;
  options: string[];
  correctAnswers: string[];
  answerType: 'single' | 'multiple';
  difficulty: 'easy' | 'medium' | 'hard';
  hints?: string[];
  targets?: Record<string, unknown>[];
}

export interface QuizData {
  id?: number;
  year: number;
  subject: string;
  topic: string;
  quizType: string;
  questions: Question[];
  questionCount?: number;
  adaptiveSettings: AdaptiveQuizSettings;
  status?: 'draf' | 'diterbitkan' | 'diarkibkan';
}

interface QuizTableProps {
  quizzes: QuizData[];
  onDeleteQuiz?: (id: number) => void;
  onEditQuiz?: (quiz: QuizData, index: number) => void;
  onStatusChange?: (id: number, status: 'draf' | 'diterbitkan' | 'diarkibkan') => void;
  currentPage?: number;
  totalPages?: number;
  totalQuizzes?: number;
  onPageChange?: (page: number) => void;
  itemsPerPage?: number;
}

export function QuizTable({
  quizzes,
  onDeleteQuiz,
  onEditQuiz,
  onStatusChange,
  currentPage = 1,
  totalPages = 1,
  totalQuizzes = 0,
  onPageChange,
  itemsPerPage = 10
}: QuizTableProps) {
  
  return (
    <div className="bg-card rounded-lg overflow-hidden">
      <table className="w-full">
        <thead className="bg-muted/50">
          <tr>
            <th className="p-4 text-left">Tahun</th>
            <th className="p-4 text-left">Mata Pelajaran</th>
            <th className="p-4 text-left">Topik</th>
            <th className="p-4 text-left">Jenis</th>
            <th className="p-4 text-left">Bilangan Kuiz</th>
            <th className="p-4 text-left">Status</th>
            <th className="p-4 text-left">Tindakan</th>
          </tr>
        </thead>
        <tbody>
          {quizzes.map((quiz, index) => (
            <tr key={index} className="border-b hover:bg-muted/30">
              <td className="p-4">{quiz.year || 'N/A'}</td>
              <td className="p-4">{quiz.subject}</td>
              <td className="p-4">{quiz.topic}</td>
              <td className="p-4">{quiz.quizType}</td>
              <td className="p-4">{quiz.questionCount ?? quiz.questions.length}</td>
              <td className="p-4">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  quiz.status === 'diterbitkan'
                    ? 'bg-green-100 text-green-800'
                    : quiz.status === 'draf'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {quiz.status === 'diterbitkan' ? 'Diterbitkan' :
                   quiz.status === 'draf' ? 'Draf' :
                   quiz.status === 'diarkibkan' ? 'Diarkibkan' : 'Tidak Diketahui'}
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
                    <DropdownMenuItem onClick={() => onEditQuiz?.(quiz, index)}>
                      <Edit className="w-4 h-4 mr-2" /> Sunting Kuiz
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {quiz.status !== 'draf' && (
                      <DropdownMenuItem onClick={() => onStatusChange?.(quiz.id!, 'draf')}>
                        📝 Tetapkan sebagai Draf
                      </DropdownMenuItem>
                    )}
                    {quiz.status !== 'diterbitkan' && (
                      <DropdownMenuItem onClick={() => onStatusChange?.(quiz.id!, 'diterbitkan')}>
                        🟢 Terbitkan Kuiz
                      </DropdownMenuItem>
                    )}
                    {quiz.status !== 'diarkibkan' && (
                      <DropdownMenuItem onClick={() => onStatusChange?.(quiz.id!, 'diarkibkan')}>
                        📦 Arkibkan Kuiz
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-red-600"
                      onClick={() => onDeleteQuiz?.(quiz.id!)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" /> Padam Kuiz
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="flex items-center justify-between p-4 border-t">
        <div className="text-sm text-muted-foreground">
          Menunjukkan {((currentPage - 1) * itemsPerPage) + 1} hingga{" "}
          {Math.min(currentPage * itemsPerPage, totalQuizzes)} daripada {totalQuizzes}
        </div>
        <div className="flex gap-2">
          <Button
            variant={currentPage === 1 ? "ghost" : "secondary"}
            size="sm"
            disabled={currentPage === 1}
            onClick={() => onPageChange?.(currentPage - 1)}
            className={
              currentPage === 1
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-secondary/80"
            }
          >
            <ChevronLeft /> Sebelum
          </Button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Button
              key={p}
              variant={p === currentPage ? "default" : "secondary"}
              size="sm"
              onClick={() => onPageChange?.(p)}
              className={
                p === currentPage
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "hover:bg-secondary/80"
              }
            >
              {p}
            </Button>
          ))}
          <Button
            variant={currentPage === totalPages ? "ghost" : "secondary"}
            size="sm"
            disabled={currentPage === totalPages}
            onClick={() => onPageChange?.(currentPage + 1)}
            className={
              currentPage === totalPages
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-secondary/80"
            }
          >
            Seterusnya <ChevronRight />
          </Button>
        </div>
      </div>
    </div>
  );
}
