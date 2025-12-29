/** @format */

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Eye, Download, Heart } from "lucide-react";

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

interface PaperCardProps {
  paper: Paper;
  isFavorite: boolean;
  onToggleFavorite: (paperId: string) => void;
  onView: (paper: Paper) => void;
  onDownload: (paper: Paper) => void;
}

const PaperCard: React.FC<PaperCardProps> = ({
  paper,
  isFavorite,
  onToggleFavorite,
  onView,
  onDownload,
}) => {
  return (
    <Card className="border-2 border-gray-100 hover:border-green-300 hover:shadow-lg transition-all">
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          {/* Paper Icon */}
          <div
            className={`w-14 h-14 ${paper.color} rounded-xl flex items-center justify-center flex-shrink-0 shadow-md`}
          >
            <BookOpen className="h-7 w-7 text-white" />
          </div>

          <div className="flex-1 min-w-0">
            {/* Header with subject and favorite button */}
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-bold text-gray-800 truncate">
                {paper.subject}
              </h3>
              <button
                onClick={() => onToggleFavorite(paper.id)}
                className={`p-1 rounded-full transition-colors ${
                  isFavorite
                    ? "text-red-500 hover:text-red-600"
                    : "text-gray-400 hover:text-red-500"
                }`}
                aria-label={
                  isFavorite
                    ? "Alih keluar dari kegemaran"
                    : "Tambah ke kegemaran"
                }
              >
                <Heart
                  className={`h-4 w-4 ${isFavorite ? "fill-current" : ""}`}
                />
              </button>
            </div>

            {/* Year */}
            <p className="text-sm text-gray-500 mb-3">UPKK {paper.year}</p>

            {/* Action buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => onView(paper)}
                className="flex-1 flex items-center justify-center gap-2 bg-green-50 hover:bg-green-100 text-green-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                aria-label={`Lihat kertas ${paper.subject} ${paper.year}`}
              >
                <Eye className="h-4 w-4" />
                <span>Lihat</span>
              </button>
              <button
                onClick={() => onDownload(paper)}
                className="flex-1 flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                aria-label={`Muat turun kertas ${paper.subject} ${paper.year}`}
              >
                <Download className="h-4 w-4" />
                <span>Muat Turun</span>
              </button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PaperCard;
