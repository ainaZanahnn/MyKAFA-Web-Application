/** @format */

"use client";

import { useEffect, useState } from "react";
import { MessageSquare, Megaphone } from "lucide-react";

type Announcement = {
  id: number;
  title: string;
  content: string;
  date: string;
  type: "announcement" | "feedback";
  author_name?: string;
};

const PER_PAGE = 4;

export default function Announcements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/announcements");
        if (!response.ok) {
          throw new Error("Failed to fetch announcements");
        }
        const data = await response.json();
        if (data.success) {
          // Transform the data to match the expected format
          const transformedData = data.data.map((item: Record<string, unknown>) => ({
            id: item.id as number,
            title: item.title as string,
            content: item.content as string,
            date: item.date as string,
            type: item.type as "announcement" | "feedback",
            author_name: item.author_name as string,
          }));
          setAnnouncements(transformedData);
        } else {
          throw new Error(data.message || "Failed to fetch announcements");
        }
      } catch (err: unknown) {
        console.error("Error fetching announcements:", err);
      }
    };

    fetchAnnouncements();
  }, []);

  // Get latest announcement from admin
  const latestAnnouncement = announcements
    .filter((a) => a.type === "announcement")
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

  // Get feedback from guardians
  const feedbackList = announcements
    .filter((a) => a.type === "feedback")
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const totalPages = Math.ceil(feedbackList.length / PER_PAGE);
  const paginatedFeedback = feedbackList.slice(
    (currentPage - 1) * PER_PAGE,
    currentPage * PER_PAGE
  );

  return (
    <div>
      {/* Header */}
      <div className=" bg-amber-200 text-primary-foreground p-4 rounded-t-lg">
        <h2 className="  bg-amber-200 text-black text-lg font-semibold">
          Pengumuman & Maklum Balas
        </h2>
      </div>

      {/* Latest Announcement from Admin */}
      {latestAnnouncement && (
        <div className="bg-blue-100 border-l-4 border-amber-200 p-4 mb-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center text-white flex-shrink-0">
              <Megaphone className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-amber-800 mb-2">
                {latestAnnouncement.title}
              </h3>
              <p className="text-sm text-amber-600 mb-2">
                {latestAnnouncement.content}
              </p>
              <div className="text-xs text-amber-900">
                {latestAnnouncement.date}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Feedback from Guardians */}
      <div className="bg-card rounded-lg p-4 shadow-2xl">
        <h3 className="text-md font-semibold mb-4 flex items-center gap-2">
          <Megaphone className="w-5 h-5 text-yellow-500" />
          Maklum Balas dari Penjaga
        </h3>
        {paginatedFeedback.length === 0 ? (
          <div className="p-4 text-muted-foreground text-sm">
            Tiada maklum balas buat masa ini.
          </div>
        ) : (
          paginatedFeedback.map((feedback) => (
            <div
              key={feedback.id}
              className="flex items-start gap-4 p-4 border-b last:border-b-0 bg-blue-50/100 mb-4 rounded"
            >
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-foreground mb-1">
                  {feedback.title}
                </h4>
                <p className="text-sm text-muted-foreground mb-2">
                  {feedback.content}
                </p>
                <div className="text-xs text-gray-400">
                  Oleh {feedback.author_name || "Tidak diketahui"} •{" "}
                  {feedback.date}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination for Feedback */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          <button
            className="px-3 py-1 text-sm border rounded disabled:opacity-50"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
          >
            Prev
          </button>
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              className={`px-3 py-1 text-sm border rounded ${
                currentPage === i + 1 ? "bg-blue-500 text-white" : ""
              }`}
              onClick={() => setCurrentPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}
          <button
            className="px-3 py-1 text-sm border rounded disabled:opacity-50"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
