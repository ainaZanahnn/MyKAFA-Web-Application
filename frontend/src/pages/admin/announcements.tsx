 /** @format */

"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/components/auth/useAuth";
import { ChevronDown, Plus, Send } from "lucide-react";
import announcementService from "@/services/announcementService";
import { toast } from "react-toastify";

type Announcement = {
  id: number;
  title: string;
  content: string;
  date: string;
  target: "semua" | "penjaga" | "pelajar";
  author_id?: number;
  type?: string;
};

const PER_PAGE = 4;

export default function Announcements() {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [filter, setFilter] = useState<"semua" | "penjaga" | "pelajar">(
    "semua"
  );
  const [showDropdown, setShowDropdown] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createForm, setCreateForm] = useState({
    title: "",
    content: "",
    date: new Date().toISOString().split("T")[0],
    target: "semua" as "semua" | "penjaga" | "pelajar",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const response = await announcementService.getAnnouncements();
      // For admin users, show all announcements of type "announcement"
      const adminAnnouncements = (response.data || []).filter(
        (announcement: Announcement) =>
          announcement.type === "announcement"
      );
      setAnnouncements(adminAnnouncements);
    } catch (error) {
      console.error("Error fetching announcements:", error);
      toast.error("Failed to fetch announcements: " + (error as Error).message);
    }
  };

  const handleCreateAnnouncement = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (!createForm.title.trim() || !createForm.content.trim()) {
      toast.error("Sila isi semua maklumat wajib.");
      return;
    }

    setLoading(true);
    try {
      const response = await announcementService.createAnnouncement({
        title: createForm.title,
        content: createForm.content,
        date: createForm.date,
        type: "announcement",
        target: createForm.target,
        author_id: user?.id,
      });

      if (response.success) {
        toast.success("Pengumuman berjaya dibuat!");
        setCreateForm({
          title: "",
          content: "",
          date: new Date().toISOString().split("T")[0],
          target: "semua",
        });
        setShowCreateForm(false);
        fetchAnnouncements(); // Refresh the list
      } else {
        throw new Error(response.message || "Failed to create announcement");
      }
    } catch (error) {
      console.error("Error creating announcement:", error);
      toast.error("Ralat semasa membuat pengumuman: " + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // Filter first
  const filtered = announcements.filter(
    (a) => filter === "semua" || a.target === filter
  );

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice(
    (currentPage - 1) * PER_PAGE,
    currentPage * PER_PAGE
  );

  return (
    <div>
      {/* Create Form Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">
              Buat Pengumuman Baharu
            </h3>
            <form onSubmit={handleCreateAnnouncement} className="space-y-4">
              <div>
                <Label htmlFor="title">Tajuk Pengumuman</Label>
                <Input
                  id="title"
                  value={createForm.title}
                  onChange={(e) =>
                    setCreateForm({
                      ...createForm,
                      title: e.target.value,
                    })
                  }
                  placeholder="Masukkan tajuk pengumuman"
                  required
                />
              </div>
              <div>
                <Label htmlFor="content">Kandungan Pengumuman</Label>
                <Textarea
                  id="content"
                  value={createForm.content}
                  onChange={(e) =>
                    setCreateForm({
                      ...createForm,
                      content: e.target.value,
                    })
                  }
                  placeholder="Masukkan kandungan pengumuman"
                  rows={4}
                  required
                />
              </div>
              <div>
                <Label htmlFor="date">Tarikh</Label>
                <Input
                  id="date"
                  type="date"
                  value={createForm.date}
                  onChange={(e) =>
                    setCreateForm({
                      ...createForm,
                      date: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="target">Sasaran</Label>
                <select
                  id="target"
                  value={createForm.target}
                  onChange={(e) =>
                    setCreateForm({
                      ...createForm,
                      target: e.target.value as "semua" | "penjaga" | "pelajar",
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                >
                  <option value="semua">Pengguna</option>
                  <option value="penjaga">Penjaga</option>
                  <option value="pelajar">Pelajar</option>
                </select>
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    "Menghantar..."
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Hantar Pengumuman
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateForm(false)}
                >
                  Batal
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-primary text-primary-foreground p-4 rounded-t-lg flex items-center justify-between relative">
        <h2 className="text-lg font-semibold">Pengumuman</h2>
        <div className="flex items-center gap-3">
          {/* Dropdown */}
          <div className="relative">
            <Button
              variant="secondary"
              size="sm"
              className="bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20"
              onClick={() => setShowDropdown((prev) => !prev)}
            >
              {filter === "semua"
                ? "Semua Pengguna"
                : filter === "penjaga"
                ? "Penjaga"
                : "Pelajar"}
              {filter === "semua"
                ? "semua"
                : filter === "penjaga"
                ? "Penjaga"
                : "Pelajar"}
              <ChevronDown className="w-4 h-4 ml-1" />
            </Button>

            {showDropdown && (
              <div className="absolute right-0 mt-2 w-40 bg-white border rounded-lg shadow-lg z-10">
                <button
                  className="w-full text-left px-4 py-2 hover:bg-emerald-100"
                  onClick={() => {
                    setFilter("semua");
                    setShowDropdown(false);
                    setCurrentPage(1);
                  }}
                >
                  Semua
                </button>
                <button
                  className="w-full text-left px-4 py-2 hover:bg-emerald-100"
                  onClick={() => {
                    setFilter("penjaga");
                    setShowDropdown(false);
                    setCurrentPage(1);
                  }}
                >
                  Penjaga
                </button>
                <button
                  className="w-full text-left px-4 py-2 hover:bg-emerald-100"
                  onClick={() => {
                    setFilter("pelajar");
                    setShowDropdown(false);
                    setCurrentPage(1);
                  }}
                >
                  Pelajar
                </button>
              </div>
            )}
          </div>

          {/* Add new announcement */}
          <Button
            size="sm"
            className="bg-primary-foreground text-primary hover:bg-primary-foreground/90"
            onClick={() => setShowCreateForm(true)}
          >
            <Plus className="w-4 h-4 mr-1" />
            Pengumuman Baharu
          </Button>
        </div>
      </div>

      {/* List */}
      <div className="bg-card rounded-b-lg">
        {paginated.length === 0 ? (
          <div className="p-4 text-muted-foreground text-sm">
            Tiada pengumuman untuk penapis ini.
          </div>
        ) : (
          paginated.map((announcement) => (
            <div
              key={announcement.id}
              className="flex items-start gap-4 p-4 border-b last:border-b-0 bg-purple-50/50"
            >
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-semibold text-sm flex-shrink-0">
                {announcement.id}
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-foreground mb-1">
                  {announcement.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {announcement.content}
                </p>
              </div>
              <div className="flex flex-col items-end">
                <div className="text-xs text-orange-500 font-medium bg-orange-50 px-2 py-1 rounded">
                  {announcement.date}
                </div>
                <div className="text-xs text-gray-500 mt-1 italic">
                  {announcement.target === "semua"
                    ? "Semua pengguna"
                    : announcement.target === "penjaga"
                    ? "Penjaga"
                    : "Pelajar"}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {/* Prev button */}
          <Button
            variant="outline"
            size="sm"
            className=" text-black border border-gray-400"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
          >
            Sebelum
          </Button>

          {/* Page numbers */}
          {[...Array(totalPages)].map((_, i) => {
            const isActive = currentPage === i + 1;

            return (
              <Button
                key={i}
                size="sm"
                // Don’t let "variant" override your active styles
                variant="outline"
                className={`${
                  isActive
                    ? "bg-black text-white hover:bg-black hover:text-white"
                    : "text-black hover:text-white hover:bg-gray-500  border border-gray-400"
                }`}
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </Button>
            );
          })}

          {/* Next button */}
          <Button
            variant="outline"
            size="sm"
            className=" text-black border border-gray-400"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
          >
            Seterusnya
          </Button>
        </div>
      )}
    </div>
  );
}
