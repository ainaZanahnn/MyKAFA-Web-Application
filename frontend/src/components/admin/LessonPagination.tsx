import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface LessonPaginationProps {
  currentPage: number;
  totalPages: number;
  totalLessons: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

export function LessonPagination({
  currentPage,
  totalPages,
  totalLessons,
  itemsPerPage,
  onPageChange,
}: LessonPaginationProps) {
  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 shadow-sm">
      <div className="flex items-center text-sm text-gray-700">
        <span>
          Menunjukkan {((currentPage - 1) * itemsPerPage) + 1} hingga {Math.min(currentPage * itemsPerPage, totalLessons)} daripada {totalLessons} pelajaran
        </span>
        <span className="ml-4 text-xs text-gray-500">
          (Halaman {currentPage} daripada {totalPages})
        </span>
      </div>
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="h-4 w-4" />
          Sebelumnya
        </Button>

        <div className="flex items-center space-x-1">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <Button
              key={page}
              variant={currentPage === page ? "default" : "outline"}
              size="sm"
              onClick={() => onPageChange(page)}
              className="w-8 h-8 p-0"
            >
              {page}
            </Button>
          ))}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
          disabled={currentPage === totalPages}
        >
          Seterusnya
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
