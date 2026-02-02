/** @format */

"use client";


import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Upload, FileText } from "lucide-react";

const SUBJECTS = [
  "Quran",
  "Hadith",
  "Fiqh",
  "Islamic History",
  "Arabic Language",
];
const YEARS = [1, 2, 3, 4, 5, 6];

const H5P_TYPES = [
  {
    id: "quiz",
    name: "Kuiz",
    icon: "📝",
    description: "Soalan pilihan pelbagai dan isian",
  },
  {
    id: "drag-drop",
    name: "Seret dan Lepas",
    icon: "🎯",
    description: "Seret elemen ke kedudukan yang betul",
  },
  {
    id: "memory",
    name: "Permainan Memori",
    icon: "🧠",
    description: "Padankan pasangan kad",
  },
  {
    id: "timeline",
    name: "Garis Masa",
    icon: "📅",
    description: "Garis masa sejarah interaktif",
  },
  {
    id: "video",
    name: "Video Interaktif",
    icon: "🎬",
    description: "Video dengan soalan interaktif",
  },
  {
    id: "hotspot",
    name: "Titik Panas Imej",
    icon: "🖼️",
    description: "Klik pada kawasan imej untuk maklumat lanjut",
  },
  {
    id: "branching",
    name: "Senario Percabangan",
    icon: "🌳",
    description: "Senario pembelajaran berasaskan keputusan",
  },
  {
    id: "flashcard",
    name: "Kad Kilat",
    icon: "🎴",
    description: "Set kad kilat interaktif",
  },
  {
    id: "accordion",
    name: "Akordion",
    icon: "📚",
    description: "Bahagian kandungan boleh kembang",
  },
  {
    id: "other",
    name: "Lain-lain",
    icon: "❓",
    description: "Jenis kandungan H5P lain",
  },
];

interface H5PActivity {
  title: string;
  description: string;
  subject: string;
  year: number;
  fileName: string;
  h5pType: string;
  h5pContent: string;
  uploadDate: string;
}

interface H5PUploaderProps {
  onSave: (activity: H5PActivity) => void;
  onCancel: () => void;
}

export function H5PUploader({ onSave, onCancel }: H5PUploaderProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [subject, setSubject] = useState("Quran");
  const [year, setYear] = useState(1);
  const [fileName, setFileName] = useState("");
  const [h5pContent, setH5pContent] = useState("");
  const [h5pType, setH5pType] = useState("quiz");
  const [file, setFile] = useState<File | null>(null);
  const [uploadMethod, setUploadMethod] = useState<"file" | "url" | "embed">(
    "file"
  );
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFileName(selectedFile.name);
      if (selectedFile.name.endsWith(".h5p")) {
        setUploadProgress(100);
      }
    }
  };

  const handleUpload = async () => {
    if (!title.trim() || !subject || !fileName || !h5pType) {
      alert("Sila isi semua medan yang diperlukan");
      return;
    }

    setIsUploading(true);
    for (let i = 0; i <= 100; i += 10) {
      setUploadProgress(i);
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    onSave({
      title,
      description,
      subject,
      year,
      fileName,
      h5pType,
      h5pContent: h5pContent || `<div class="h5p-content">${title}</div>`,
      uploadDate: new Date().toISOString().split("T")[0],
    });

    setIsUploading(false);
    setUploadProgress(0);
  };

  const selectedTypeInfo = H5P_TYPES.find((t) => t.id === h5pType);

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Button onClick={onCancel} variant="outline">
            ← Kembali ke Papan Pemuka
          </Button>
        </div>

        <Card className="p-8 border-gray-300 hover:border-gray-600 transition-colors">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Muat Naik Aktiviti H5P
          </h1>
          <p className="text-muted-foreground mb-8">
            Tambah kandungan H5P interaktif ke platform pembelajaran anda
          </p>

          {/* Basic Information */}
          <div className="space-y-6 mb-8 pb-8 border-b border-border">
            <h2 className="text-2xl font-bold text-foreground">
              Maklumat Aktiviti
            </h2>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Tajuk Aktiviti
              </label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="cth: Modul Pembelajaran Quran Interaktif"
                className="bg-background border-border text-foreground"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Penerangan
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Penerangan ringkas aktiviti..."
                rows={3}
                className="w-full px-4 py-2 bg-background border border-border text-foreground rounded-lg"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Subjek
                </label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-4 py-2 bg-background border border-border text-foreground rounded-lg"
                >
                  {SUBJECTS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Tahun
                </label>
                <select
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  className="w-full px-4 py-2 bg-background border border-border text-foreground rounded-lg"
                >
                  {YEARS.map((y) => (
                    <option key={y} value={y}>
                      Tahun {y}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-6 mb-8 pb-8 border-b border-border">
            <h2 className="text-2xl font-bold text-foreground">
              Jenis Aktiviti H5P
            </h2>
            <p className="text-muted-foreground text-sm">
              Pilih jenis aktiviti interaktif
            </p>

            <div className="grid md:grid-cols-2 gap-4">
              {H5P_TYPES.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setH5pType(type.id)}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    h5pType === type.id
                      ? "border-primary bg-primary/10"
                      : "border-border bg-muted/50 hover:border-primary"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{type.icon}</span>
                    <div>
                      <p className="font-semibold text-foreground">
                        {type.name}
                      </p>
                      <p className="text-muted-foreground text-sm">
                        {type.description}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {selectedTypeInfo && (
              <div className="bg-primary/10 border border-primary/30 rounded-lg p-4">
                <p className="text-primary">
                  <span className="font-semibold">Dipilih:</span>{" "}
                  {selectedTypeInfo.name}
                </p>
              </div>
            )}
          </div>

          {/* Upload Method Selection */}
          <div className="space-y-6 mb-8 pb-8 border-b border-slate-700">
            <h2 className="text-2xl font-bold text-white">Kandungan H5P</h2>

            <div className="flex gap-4">
              {[
                { id: "file", label: "Muat Naik Fail", icon: "📁" },
                { id: "url", label: "Daripada URL", icon: "🔗" },
                { id: "embed", label: "Kod Embed", icon: "💻" },
              ].map((method) => (
                <button
                  key={method.id}
                  onClick={() => setUploadMethod(method.id as "file" | "url" | "embed")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
                    uploadMethod === method.id
                      ? "bg-emerald-500 text-white"
                      : "bg-black text-white hover:bg-gray-800"
                  }`}
                >
                  <span>{method.icon}</span>
                  {method.label}
                </button>
              ))}
            </div>

            {uploadMethod === "file" && (
              <div className="space-y-4">
                <div className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center hover:border-slate-500 transition-all cursor-pointer group">
                  <input
                    type="file"
                    accept=".h5p"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="h5p-file"
                  />
                  <label htmlFor="h5p-file" className="cursor-pointer block">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2 group-hover:text-gray-300" />
                    <p className="text-white font-semibold mb-1">
                      Seret fail H5P anda di sini
                    </p>
                    <p className="text-gray-400 text-sm">atau klik untuk menyemak imbas</p>
                  </label>
                </div>

                {file && (
                  <div className="bg-slate-700 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <FileText className="w-5 h-5 text-blue-400" />
                      <div className="flex-1">
                        <p className="text-white font-semibold">{file.name}</p>
                        <p className="text-gray-400 text-sm">
                          {(file.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                    </div>
                    <div className="w-full bg-slate-600 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2 rounded-full transition-all"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    <p className="text-gray-400 text-sm mt-2">
                      {uploadProgress}%
                    </p>
                  </div>
                )}
              </div>
            )}

            {uploadMethod === "url" && (
              <Input
                value={h5pContent}
                onChange={(e) => setH5pContent(e.target.value)}
                placeholder="https://example.h5p.com/content/123"
                className="bg-white border-slate-600 text-gray-900 w-full px-4 py-2 "
              />
            )}

            {uploadMethod === "embed" && (
              <textarea
                value={h5pContent}
                onChange={(e) => setH5pContent(e.target.value)}
                placeholder="Tampal kod embed H5P anda di sini..."
                rows={6}
                className="w-full px-4 py-2 bg-white border border-slate-600 text-gray-900 rounded-lg font-mono text-sm"
              />
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-4 justify-end">
            <Button variant="outline" onClick={onCancel}>
              Batal
            </Button>
            <Button
              onClick={handleUpload}
              disabled={isUploading}
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold disabled:opacity-50"
            >
              {isUploading ? "Memuat naik..." : "Muat Naik Aktiviti"}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
