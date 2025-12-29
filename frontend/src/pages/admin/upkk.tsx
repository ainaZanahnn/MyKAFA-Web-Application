/** @format */
"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Plus, Loader2 } from "lucide-react";

type Paper = {
  id: number;
  year: string;
  subject: string;
  type: string;
  file_path?: string;
  status: string;
  downloads: number;
  created_at?: string;
  updated_at?: string;
};

export default function ManagePapers() {
  const [papers, setPapers] = useState<Paper[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [filters, setFilters] = useState({
    year: "",
    subject: "",
    type: "",
  });

  const [showModal, setShowModal] = useState(false);

  const [newPaper, setNewPaper] = useState({
    year: "",
    subject: "",
    type: "",
    file: null as File | null,
    status: "Active",
  });

  const [editingPaper, setEditingPaper] = useState<Paper | null>(null);

  // Fetch papers on component mount
  useEffect(() => {
    fetchPapers();
  }, []);

  const fetchPapers = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:5000/api/upkk");
      if (response.data.success) {
        setPapers(response.data.data);
      }
    } catch (err: unknown) {
      setError("Gagal memuatkan kertas soalan");
      console.error("Fetch papers error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async () => {
    if (
      !newPaper.year ||
      !newPaper.subject ||
      !newPaper.type ||
      (!editingPaper && !newPaper.file)
    ) {
      alert("Sila isi semua maklumat wajib!");
      return;
    }

    try {
      setSubmitting(true);
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("year", newPaper.year);
      formData.append("subject", newPaper.subject);
      formData.append("type", newPaper.type);
      if (newPaper.file) {
        formData.append("file", newPaper.file);
      }
      formData.append("status", newPaper.status);

      let response;
      if (editingPaper) {
        response = await axios.put(
          `http://localhost:5000/api/upkk/${editingPaper.id}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
      } else {
        response = await axios.post(
          "http://localhost:5000/api/upkk",
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
      }

      if (response.data.success) {
        if (editingPaper) {
          setPapers(papers.map((p) => p.id === editingPaper.id ? response.data.data : p));
          alert("Kertas soalan berjaya dikemaskini!");
        } else {
          setPapers([...papers, response.data.data]);
          alert("Kertas soalan berjaya ditambah!");
        }
        setNewPaper({
          year: "",
          subject: "",
          type: "",
          file: null,
          status: "Active",
        });
        setEditingPaper(null);
        setShowModal(false);
      }
    } catch (err: unknown) {
      console.error("Upload error:", err);
      alert("Gagal menambah kertas soalan");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Adakah anda pasti mahu memadam kertas soalan ini?")) return;

    try {
      const token = localStorage.getItem("token");
      const response = await axios.delete(`http://localhost:5000/api/upkk/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        setPapers(papers.filter((p) => p.id !== id));
        alert("Kertas soalan berjaya dipadam!");
      }
    } catch (err: unknown) {
      console.error("Delete error:", err);
      alert("Gagal memadam kertas soalan");
    }
  };

  const handleArchive = async (id: number) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.patch(`http://localhost:5000/api/upkk/${id}/archive`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        setPapers(papers.map((p) => p.id === id ? { ...p, status: "Archived" } : p));
        alert("Kertas soalan berjaya diarkib!");
      }
    } catch (err: unknown) {
      console.error("Archive error:", err);
      alert("Gagal mengarkib kertas soalan");
    }
  };

  const handleEdit = (paper: Paper) => {
    setEditingPaper(paper);
    setNewPaper({
      year: paper.year,
      subject: paper.subject,
      type: paper.type,
      file: null,
      status: paper.status,
    });
    setShowModal(true);
  };

  const filteredPapers = papers.filter(
    (p) =>
      (filters.year ? p.year === filters.year : true) &&
      (filters.subject ? p.subject === filters.subject : true) &&
      (filters.type ? p.type === filters.type : true)
  );

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8" />
        <span className="ml-2">Memuatkan kertas soalan...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Upload Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-lg font-bold mb-4">
              {editingPaper ? "Sunting Kertas Soalan" : "Muat Naik Kertas Baharu"}
            </h2>

            {/* FORM STARTS HERE */}
            <div className="space-y-4">
              {/* Year dropdown */}
              <select
                className="border rounded p-2 w-full"
                value={newPaper.year}
                onChange={(e) =>
                  setNewPaper({ ...newPaper, year: e.target.value })
                }
              >
                <option value="">Pilih Tahun</option>
                {Array.from({ length: 2024 - 1997 + 1 }, (_, i) =>
                  (2024 - i).toString()
                ).map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>

              {/* Subject dropdown */}
              <select
                className="border rounded p-2 w-full"
                value={newPaper.subject}
                onChange={(e) =>
                  setNewPaper({ ...newPaper, subject: e.target.value })
                }
              >
                <option value="">Pilih Subjek</option>
                <option value="Aqidah">Aqidah</option>
                <option value="Sirah">Sirah</option>
                <option value="Ibadah">Ibadah</option>
                <option value="Al-Quran">Al-Quran</option>
                <option value="Jawi">Jawi</option>
                <option value="Bahasa Arab">Bahasa Arab</option>
              </select>

              {/* Type dropdown */}
              <select
                className="border rounded p-2 w-full"
                value={newPaper.type}
                onChange={(e) =>
                  setNewPaper({ ...newPaper, type: e.target.value })
                }
              >
                <option value="">Pilih Jenis</option>
                <option value="Tahun Lepas">Tahun Lepas</option>
                <option value="Percubaan">Percubaan</option>
                <option value="Skema Jawapan">Skema Jawapan</option>
              </select>

              {/* File input */}
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                className="border rounded p-2 w-full"
                onChange={(e) =>
                  setNewPaper({
                    ...newPaper,
                    file: e.target.files?.[0] || null,
                  })
                }
              />
            </div>
            {/* FORM ENDS HERE */}

            {/* Buttons */}
            <div className="flex justify-end mt-6 space-x-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded border"
              >
                Batal
              </button>
              <button
                onClick={handleUpload}
                disabled={submitting}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {submitting && <Loader2 className="animate-spin h-4 w-4" />}
                {submitting ? "Menambah..." : "Tambah"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filter Section */}
      <div className="bg-white shadow rounded-lg p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">Tapis Kertas</h2>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            <Plus size={16} /> Tambah Baharu
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Year Filter */}
          <select
            className="border rounded p-2"
            value={filters.year}
            onChange={(e) => setFilters({ ...filters, year: e.target.value })}
          >
            <option value="">Semua Tahun</option>
            {[...new Set(papers.map((p) => p.year))].map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>

          {/* Subject Filter */}
          <select
            className="border rounded p-2"
            value={filters.subject}
            onChange={(e) =>
              setFilters({ ...filters, subject: e.target.value })
            }
          >
            <option value="">Semua Subjek</option>
            {[...new Set(papers.map((p) => p.subject))].map((subject) => (
              <option key={subject} value={subject}>
                {subject}
              </option>
            ))}
          </select>

          {/* Type Filter */}
          <select
            className="border rounded p-2"
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
          >
            <option value="">Semua Jenis</option>
            <option value="Tahun Lepas">Tahun Lepas</option>
            <option value="Percubaan">Percubaan</option>
            <option value="Skema Jawapan">Skema Jawapan</option>
          </select>
        </div>
      </div>

      {/* Manage Papers Section */}
      <div className="bg-white shadow rounded-lg p-4">
        <h2 className="text-lg font-bold mb-4">Urus Kertas</h2>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-200 text-sm">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="border p-2">Tahun</th>
                <th className="border p-2">Subjek</th>
                <th className="border p-2">Jenis</th>
                <th className="border p-2">Fail</th>
                <th className="border p-2">Status</th>
                <th className="border p-2">Muat Turun</th>
                <th className="border p-2">Tindakan</th>
              </tr>
            </thead>
            <tbody>
              {filteredPapers.map((paper) => (
                <tr key={paper.id} className="hover:bg-gray-50">
                  <td className="border p-2">{paper.year}</td>
                  <td className="border p-2">{paper.subject}</td>
                  <td className="border p-2">{paper.type}</td>
                  <td className="border p-2">{paper.file_path || "N/A"}</td>
                  <td className="border p-2">{paper.status}</td>
                  <td className="border p-2">{paper.downloads}</td>
                  <td className="border p-2 space-x-2">
                    <button
                      onClick={() => handleEdit(paper)}
                      className="px-2 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                    >
                      Sunting
                    </button>
                    <button
                      onClick={() => handleDelete(paper.id)}
                      className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      Padam
                    </button>
                    <button
                      onClick={() => handleArchive(paper.id)}
                      className="px-2 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
                    >
                      Arkib
                    </button>
                  </td>
                </tr>
              ))}
              {filteredPapers.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center p-4 text-gray-500">
                    Tiada kertas dijumpai untuk tapis yang dipilih.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
