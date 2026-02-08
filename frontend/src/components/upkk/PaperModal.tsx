/** @format */


import { X, Download } from "lucide-react";
const API_URL = import.meta.env.VITE_API_URL;

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

interface PaperModalProps {
  paper: Paper | null;
  onClose: () => void;
  onDownload: (paper: Paper) => void;
}

const PaperModal: React.FC<PaperModalProps> = ({
  paper,
  onClose,
  onDownload,
}) => {
  if (!paper) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              Kertas Soalan {paper.subject} {paper.year}
            </h2>
            <p className="text-sm text-gray-600 mt-1">UPKK {paper.year}</p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
            aria-label="Tutup modal"
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        {/* Modal Content - PDF Preview */}
        <div className="flex-1 overflow-hidden bg-gray-100">
          {paper.file_path ? (
            <iframe
              src={`${API_URL}/upkk/${paper.id}/view`}
              className="w-full h-full"
              title="Preview PDF"
            />
          ) : (
            <div className="flex items-center justify-center h-full p-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📄</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Fail Tidak Tersedia
                </h3>
                <p className="text-gray-600">
                  Kertas soalan ini belum dimuat naik.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-6 border-t border-gray-200 bg-white flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
            aria-label="Tutup modal"
          >
            Tutup
          </button>
          <button
            onClick={() => onDownload(paper)}
            className="flex-1 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            aria-label="Muat turun PDF"
          >
            <Download className="h-5 w-5" />
            Muat Turun PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaperModal;
