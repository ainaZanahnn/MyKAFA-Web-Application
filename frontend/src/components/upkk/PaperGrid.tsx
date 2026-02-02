/** @format */


import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Eye,
  Download,
  Heart,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  FileText,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface Paper {
  id: string;
  year: number;
  subject: string;
  type?: string;
  file_path?: string;
  status?: string;
  downloads?: number;
  color: string;
  created_at?: string;
  updated_at?: string;
}

interface PaperGridProps {
  papers: Paper[];
  favorites: Set<string>;
  currentPage: number;
  totalPages: number;
  onToggleFavorite: (paperId: string) => void;
  onView: (paper: Paper) => void;
  onDownload: (paper: Paper) => void;
  onPageChange: (page: number) => void;
}

const PaperGrid: React.FC<PaperGridProps> = ({
  papers,
  favorites,
  currentPage,
  totalPages,
  onToggleFavorite,
  onView,
  onDownload,
  onPageChange,
}) => {
  if (papers.length === 0) {
    return (
      <Card className="bg-muted/50 border-border">
        <CardContent className="p-12 text-center">
          <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Tiada Kertas Soalan Dijumpai
          </h3>
          <p className="text-muted-foreground">
            Cuba ubah pilihan tahun, subjek, atau kata carian anda
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="bg-card rounded-lg overflow-hidden">
      <table className="w-full">
        <thead className="bg-muted/50">
          <tr>
            <th className="p-4 text-left">Tahun</th>
            <th className="p-4 text-left">Subjek</th>
            <th className="p-4 text-left">Jenis</th>
            <th className="p-4 text-left">Muat Turun</th>
            <th className="p-4 text-left">Tindakan</th>
          </tr>
        </thead>
        <tbody>
          {papers.map((paper) => (
            <tr key={paper.id} className="border-b hover:bg-muted/30">
              <td className="p-4">{paper.year}</td>
              <td className="p-4">{paper.subject}</td>
              <td className="p-4">{paper.type || 'N/A'}</td>
              <td className="p-4">{paper.downloads || 0}</td>
              <td className="p-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => onView(paper)}>
                      <Eye className="w-4 h-4 mr-2" /> Lihat
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onDownload(paper)}>
                      <Download className="w-4 h-4 mr-2" /> Muat Turun
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => onToggleFavorite(paper.id)}>
                      <Heart className={`w-4 h-4 mr-2 ${favorites.has(paper.id) ? 'fill-red-500 text-red-500' : ''}`} />
                      {favorites.has(paper.id) ? 'Alih Keluar Kegemaran' : 'Tambah Kegemaran'}
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
          Menunjukkan {((currentPage - 1) * 10) + 1} hingga{" "}
          {Math.min(currentPage * 10, papers.length)} daripada {papers.length}
        </div>
        <div className="flex gap-2">
          <Button
            variant={currentPage === 1 ? "ghost" : "secondary"}
            size="sm"
            disabled={currentPage === 1}
            onClick={() => onPageChange(currentPage - 1)}
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
              onClick={() => onPageChange(p)}
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
            onClick={() => onPageChange(currentPage + 1)}
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
};

export default PaperGrid;
