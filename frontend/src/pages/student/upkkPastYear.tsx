/** @format */

import { useState, useEffect, useMemo } from "react";
import upkkService, { type ApiPaper, type Paper } from "@/services/upkkService";
import { Card, CardContent } from "@/components/ui/card";
import {
  BookOpen,
  Eye,
  Download,
  FileText,
  Filter,
  Star,
  X,
  Heart,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import PaperModal from "@/components/upkk/PaperModal";



const ITEMS_PER_PAGE = 9;

export default function KertasSoalanUPKK() {
  // State for filters
  const [selectedYear, setSelectedYear] = useState<string>("semua");
  const [selectedSubject, setSelectedSubject] = useState<string>("semua");
  const [selectedType, setSelectedType] = useState<string>("semua");

  // State for data and UI
  const [papers, setPapers] = useState<Paper[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewingPaper, setViewingPaper] = useState<Paper | null>(null);

  // Fetch papers from API on component mount
  useEffect(() => {
    fetchPapers();
  }, []);

  // Load favorites from localStorage on mount
  useEffect(() => {
    const savedFavorites = localStorage.getItem("upkk-favorites");
    if (savedFavorites) {
      setFavorites(new Set(JSON.parse(savedFavorites)));
    }
  }, []);

  // Save favorites to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("upkk-favorites", JSON.stringify([...favorites]));
  }, [favorites]);

  // Fetch papers from the API
  const fetchPapers = async () => {
    try {
      setIsLoading(true);
      const response = await upkkService.getPapers();

      if (response.success && Array.isArray(response.data) && response.data.length > 0) {
        // Map API data to our Paper interface
        setPapers(
          response.data.map((paper: ApiPaper) => ({
            ...paper,
            id: paper.id.toString(), // Convert id to string
            year: parseInt(paper.year), // Convert year to number
            color: paper.color || "bg-blue-500", // Default color if not provided
          }))
        );
      } else {
        setPapers([]);
      }
    } catch {
      console.error("Fetch papers error");
      setError("Gagal memuatkan kertas soalan dari pangkalan data");
      setPapers([]);
    } finally {
      setIsLoading(false);
    }
  };



  const yearOptions = ["semua", ...Array.from({ length: 2024 - 1997 + 1 }, (_, i) => (2024 - i).toString())];
  const subjectOptions = ["semua", "Aqidah", "Sirah", "Ibadah", "Al-Quran", "Jawi", "Bahasa Arab"];
  const typeOptions = ["semua", "Tahun Lepas", "Percubaan", "Skema Jawapan"];

  // Filter papers based on selected criteria
  const filteredPapers = useMemo(() => {
    return papers.filter((paper: Paper) => {
      const yearMatch = selectedYear === "semua" || paper.year.toString() === selectedYear;
      const subjectMatch = selectedSubject === "semua" || paper.subject === selectedSubject;
      const typeMatch = selectedType === "semua" || paper.type === selectedType;
      return yearMatch && subjectMatch && typeMatch;
    });
  }, [selectedYear, selectedSubject, selectedType, papers]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredPapers.length / ITEMS_PER_PAGE);
  const paginatedPapers = filteredPapers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Handle favorite toggle
  const toggleFavorite = (paperId: string) => {
    setFavorites((prev) => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(paperId)) {
        newFavorites.delete(paperId);
      } else {
        newFavorites.add(paperId);
      }
      return newFavorites;
    });
  };

  // Handle view paper (opens in modal for preview)
  const handleView = async (paper: Paper) => {
    try {
      if (paper.file_path) {
        // Open paper in modal for preview
        setViewingPaper(paper);
      } else {
        setError("Fail tidak tersedia untuk dilihat");
      }
    } catch  {
      setError("Gagal memuatkan kertas soalan");
    }
  };

  // Handle download paper (triggers download and increments count)
  const handleDownload = async (paper: Paper) => {
    try {
      if (paper.file_path) {
        // Trigger download via POST request (increments download count)
        const blob = await upkkService.downloadPaper(paper.id);

        // Create download link and trigger download
        const url = window.URL.createObjectURL(new Blob([blob]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute(
          "download",
          `Kertas_${paper.subject}_${paper.year}.pdf`
        );
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      } else {
        setError("Fail tidak tersedia untuk muat turun");
      }
    } catch {
      setError("Gagal memuat turun kertas soalan");
    }
  };



  // Show loading spinner
  if (isLoading) {
    return (
      <div className="flex-1 p-6 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-green-600" />
          <p className="text-gray-600">Memuatkan kertas soalan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 overflow-y-auto">
      {/* Page Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground">
          Kertas Soalan UPKK
        </h1>
        <p className="text-muted-foreground mt-2 mb-12">
          Akses dan muat turun kertas soalan tahun lepas untuk latihan
        </p>
      </div>



      {/* Filter Section */}
      <Card className="mb-6 bg-gradient-to-r from-blue-50 to-blue-50 border-blue-250">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Filter className="h-5 w-5 text-blue-600" />
            <h2 className="font-bold text-gray-800">Tapis Kertas Soalan</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <select
                id="year-select"
                value={selectedYear}
                onChange={(e) => {
                  setSelectedYear(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-3 rounded-lg border-2 border-blue-200 focus:border-green-200 focus:outline-none bg-white text-gray-800 font-medium"
                aria-label="Pilih tahun"
              >
                <option value="semua">Semua Tahun</option>
                {yearOptions.slice(1).map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <select
                id="subject-select"
                value={selectedSubject}
                onChange={(e) => {
                  setSelectedSubject(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-3 rounded-lg border-2  border-blue-200 focus:border-green-200 focus:outline-none bg-white text-gray-800 font-medium"
                aria-label="Pilih subjek"
              >
                <option value="semua">Semua Subjek</option>
                {subjectOptions.slice(1).map((subject) => (
                  <option key={subject} value={subject}>
                    {subject}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <select
                id="type-select"
                value={selectedType}
                onChange={(e) => {
                  setSelectedType(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-3 rounded-lg border-2 b border-blue-200 focus:border-green-200 focus:outline-none bg-white text-gray-800 font-medium"
                aria-label="Pilih jenis"
              >
                <option value="semua">Semua Jenis</option>
                {typeOptions.slice(1).map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4 text-sm text-gray-600">
            Menunjukkan <span className="font-bold text-green-600">{filteredPapers.length}</span> kertas soalan
          </div>
        </CardContent>
      </Card>

      {/* Error Message */}
      {error && (
        <Card className="mb-6 bg-red-50 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <X className="h-5 w-5 text-red-600" />
              <p className="text-red-800">{error}</p>
              <button
                onClick={() => setError(null)}
                className="ml-auto text-red-600 hover:text-red-800"
                aria-label="Tutup mesej ralat"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Papers Grid */}
      {paginatedPapers.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {paginatedPapers.map((paper) => (
              <Card
                key={paper.id}
                className="border-2 border-gray-100 hover:border-green-300 hover:shadow-lg transition-all"
              >
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-14 h-14 ${paper.color} rounded-xl flex items-center justify-center flex-shrink-0 shadow-md`}
                    >
                      <BookOpen className="h-7 w-7 text-white" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-bold text-gray-800 truncate">{paper.subject}</h3>
                        <button
                          onClick={() => toggleFavorite(paper.id)}
                          className={`p-1 rounded-full transition-colors ${
                            favorites.has(paper.id)
                              ? "text-red-500 hover:text-red-600"
                              : "text-gray-400 hover:text-red-500"
                          }`}
                          aria-label={favorites.has(paper.id) ? "Alih keluar dari kegemaran" : "Tambah ke kegemaran"}
                        >
                          <Heart className={`h-4 w-4 ${favorites.has(paper.id) ? "fill-current" : ""}`} />
                        </button>
                      </div>
                      <p className="text-sm text-gray-500 mb-3">UPKK {paper.year}</p>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleView(paper)}
                          className="flex-1 flex items-center justify-center gap-2 bg-green-50 hover:bg-green-100 text-green-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                          aria-label={`Lihat kertas ${paper.subject} ${paper.year}`}
                        >
                          <Eye className="h-4 w-4" />
                          <span>Lihat</span>
                        </button>
                        <button
                          onClick={() => handleDownload(paper)}
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
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Halaman sebelumnya"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              <div className="flex gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-2 rounded-lg border ${
                      currentPage === page
                        ? "bg-green-500 text-white border-green-500"
                        : "border-gray-300 hover:bg-gray-50"
                    }`}
                    aria-label={`Halaman ${page}`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Halaman seterusnya"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          )}
        </>
      ) : (
        <Card className="bg-gray-50 border-gray-200">
          <CardContent className="p-12 text-center">
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Tiada Kertas Soalan Dijumpai</h3>
            <p className="text-gray-600">Cuba ubah pilihan tahun atau subjek anda</p>
          </CardContent>
        </Card>
      )}

      {/* Tips Section */}
      <Card className="mt-8 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
              <Star className="h-6 w-6 text-white fill-white" />
            </div>
            <div>
              <h3 className="font-bold text-gray-800 mb-2">
                Tips Menggunakan Kertas Soalan
              </h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>
                  • Gunakan kertas soalan untuk latihan sebelum peperiksaan
                </li>
                <li>
                  • Cuba jawab soalan tanpa melihat jawapan terlebih dahulu
                </li>
                <li>• Semak jawapan anda selepas selesai menjawab</li>
                <li>• Ulang kaji topik yang anda kurang faham</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal for viewing paper details */}
      <PaperModal
        paper={viewingPaper}
        onClose={() => setViewingPaper(null)}
        onDownload={handleDownload}
      />
    </div>
  );
}
