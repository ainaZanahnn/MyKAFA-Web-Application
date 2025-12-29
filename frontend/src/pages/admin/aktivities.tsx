/** @format */

"use client";

import { useState } from "react";
import { Upload, FileText, Trash2, Eye, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { H5PUploader } from "@/components/admin/h5p_uploader";

const H5P_TYPES_MAP: Record<
  string,
  {
    nameEn: string;
    nameMy: string;
    nameJawi: string;
    icon: string;
    color: string;
  }
> = {
  quiz: {
    nameEn: "Quiz",
    nameMy: "Kuiz",
    nameJawi: "کويز",
    icon: "📝",
    color: "blue",
  },
  "drag-drop": {
    nameEn: "Drag & Drop",
    nameMy: "Seret & Lepas",
    nameJawi: "سرت دن لپس",
    icon: "🎯",
    color: "purple",
  },
  memory: {
    nameEn: "Memory Game",
    nameMy: "Permainan Ingatan",
    nameJawi: "پرمئينن انگتن",
    icon: "🧠",
    color: "pink",
  },
  timeline: {
    nameEn: "Timeline",
    nameMy: "Garis Masa",
    nameJawi: "ڬاريس ماسا",
    icon: "📅",
    color: "green",
  },
  video: {
    nameEn: "Interactive Video",
    nameMy: "Video Interaktif",
    nameJawi: "ۏيديو انترتيف",
    icon: "🎬",
    color: "red",
  },
  hotspot: {
    nameEn: "Image Hotspot",
    nameMy: "Titik Panas Gambar",
    nameJawi: "تيتيک پنس ڬمبر",
    icon: "🖼️",
    color: "yellow",
  },
  branching: {
    nameEn: "Branching Scenario",
    nameMy: "Senario Bercabang",
    nameJawi: "سناريو برچابڠ",
    icon: "🌳",
    color: "cyan",
  },
  flashcard: {
    nameEn: "Flashcard",
    nameMy: "Kad Kilat",
    nameJawi: "کد کيلت",
    icon: "🎴",
    color: "indigo",
  },
  accordion: {
    nameEn: "Accordion",
    nameMy: "Akordion",
    nameJawi: "اکورديون",
    icon: "📚",
    color: "orange",
  },
  other: {
    nameEn: "Other",
    nameMy: "Lain-lain",
    nameJawi: "لئين-لئين",
    icon: "❓",
    color: "gray",
  },
};

interface H5PActivity {
  id?: string;
  title: string;
  description: string;
  subject: string;
  year: number;
  fileName: string;
  h5pType: string;
  h5pContent: string;
  uploadDate: string;
}

const SUBJECTS = [
  "Quran",
  "Hadith",
  "Fiqh",
  "Islamic History",
  "Arabic Language",
];

export function Activities() {
  const [showUploader, setShowUploader] = useState(false);
  const [activities, setActivities] = useState<H5PActivity[]>([
    {
      id: "1",
      title: "Quranic Verses Interactive Quiz",
      subject: "Quran",
      year: 1,
      fileName: "quran-verses.h5p",
      uploadDate: "2025-01-15",
      description: "Interactive learning activity for Quranic verses",
      h5pContent:
        '<iframe src="https://example.h5p.com/1" width="100%" height="500"></iframe>',
      h5pType: "quiz",
    },
  ]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSubject, setFilterSubject] = useState<string>("");
  const [filterType, setFilterType] = useState<string>("");

  const handleActivityAdded = (newActivity: H5PActivity) => {
    setActivities([
      ...activities,
      { ...newActivity, id: Date.now().toString() },
    ]);
    setShowUploader(false);
  };

  const handleDeleteActivity = (id: string) => {
    setActivities(activities.filter((a) => a.id !== id));
  };

  const filteredActivities = activities.filter((activity) => {
    const matchesSearch =
      activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = !filterSubject || activity.subject === filterSubject;
    const matchesType = !filterType || activity.h5pType === filterType;

    return matchesSearch && matchesSubject && matchesType;
  });

  if (showUploader) {
    return (
      <H5PUploader
        onSave={handleActivityAdded}
        onCancel={() => setShowUploader(false)}
      />
    );
  }



  const getH5PTypeName = (h5pType: string) => {
    const typeInfo = H5P_TYPES_MAP[h5pType || "other"];
    return typeInfo?.nameMy;
  };

  return (
    <div className="p-6">
      <div className="bg-primary text-primary-foreground p-4 rounded-t-lg flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Portal Admin</h2>
          <p className="text-sm text-primary-foreground/80 mt-1">
            Urus aktiviti H5P interaktif untuk pelajar
          </p>
        </div>
        <Button
          onClick={() => setShowUploader(true)}
          className="bg-primary-foreground text-primary hover:bg-primary-foreground/90"
        >
          <Upload className="w-4 h-4 mr-2" />
          Muat Naik Aktiviti H5P
        </Button>
      </div>

      <div className="bg-card rounded-b-lg p-6">
        {/* Filters */}
        <Card className="p-6 mb-8 border-2 border-gray-200 hover:border-gray-300 transition-colors">
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">
                Cari Aktiviti
              </label>
              <Input
                placeholder="Cari mengikut tajuk atau penerangan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                Tapis mengikut Subjek
              </label>
              <select
                value={filterSubject}
                onChange={(e) => setFilterSubject(e.target.value)}
                className="w-full px-4 py-2 border border-input bg-background rounded-lg"
              >
                <option value="">Semua Subjek</option>
                {SUBJECTS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                Tapis mengikut Jenis
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-4 py-2 border border-input bg-background rounded-lg"
              >
                <option value="">Semua Jenis</option>
                {Object.entries(H5P_TYPES_MAP).map(([key, type]) => (
                  <option key={key} value={key}>
                    {type.icon} {getH5PTypeName(key)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Card>

        {/* Activities List */}
        <div className="space-y-4">
          {filteredActivities.length === 0 ? (
            <Card className="p-8 text-center">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg">Tiada aktiviti H5P dijumpai</p>
              <p className="text-sm text-muted-foreground mt-1">
                Muat naik aktiviti H5P pertama anda untuk bermula
              </p>
            </Card>
          ) : (
            filteredActivities.map((activity) => {
              const typeInfo = H5P_TYPES_MAP[activity.h5pType || "other"];
              return (
                <Card
                  key={activity.id}
                  className="border-2 border-gray-100 hover:border-gray-300 hover:shadow-lg transition-all p-6"
                >
                  <div className="flex items-start justify-between gap-6">
                    {/* Left side - Icon and Type */}
                    <div className="flex flex-col items-center gap-4 min-w-fit">
                      <span className="text-7xl">{typeInfo?.icon}</span>
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">
                          {getH5PTypeName(activity.h5pType || "other")}
                        </p>
                      </div>
                    </div>

                    {/* Middle - Information */}
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-2">
                        {activity.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        {activity.description}
                      </p>
                      <div className="flex flex-wrap gap-3">
                        <div className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-semibold">
                          {activity.subject}
                        </div>
                        <div className="px-3 py-1 bg-muted text-muted-foreground rounded-full text-sm">
                          {activity.fileName}
                        </div>
                        <div className="px-3 py-1 bg-muted text-muted-foreground rounded-full text-sm">
                          {activity.uploadDate}
                        </div>
                      </div>
                    </div>

                    {/* Right side - Actions */}
                    <div className="flex flex-col gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="hover:bg-primary hover:text-primary-foreground transition-colors"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Pratonton
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="hover:bg-primary hover:text-primary-foreground transition-colors"
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Eksport
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors"
                        onClick={() => handleDeleteActivity(activity.id!)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
