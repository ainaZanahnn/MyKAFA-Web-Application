/** @format */

"use client";

import { useEffect, useState } from "react";
import { Megaphone } from "lucide-react";
import announcementService from "@/services/announcementService";

// Local interface for component usage
interface AnnouncementItem {
  id: number;
  title: string;
  content: string;
  date: string;
  type: "announcement" | "feedback";
  author_name: string;
}

export default function Announcements() {
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const { data } = await announcementService.getAnnouncements();
        // Transform the data to match the expected format
        const transformedData: AnnouncementItem[] = data.map((item) => ({
          id: item.id,
          title: item.title,
          content: item.content,
          date: item.date,
          type: item.type as "announcement" | "feedback",
          author_name: "Tidak diketahui", // Default author name since it's not in the API response
        }));
        setAnnouncements(transformedData);
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


    </div>
  );
}
