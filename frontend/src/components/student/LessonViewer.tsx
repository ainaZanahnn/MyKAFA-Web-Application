/** @format */

"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CheckCircle, FileText, Video, AudioLines, Link, Presentation } from "lucide-react";
import axios from "@/lib/axios";

export type Lesson = {
  id: number;
  subject: string;
  title: string;
  description: string;
  materials: {
    id: number;
    type: "PDF" | "PPT" | "Video" | "Audio" | "Link";
    title: string;
    url?: string;
  }[];
  yearLevel: string;
  status: string;
  order: number;
};

interface LessonViewerProps {
  lesson: Lesson | null;
  isOpen: boolean;
  onClose: () => void;
  onComplete: (lessonId: number) => void;
}

export function LessonViewer({ lesson, isOpen, onClose, onComplete }: LessonViewerProps) {
  const [viewedMaterials, setViewedMaterials] = useState<Set<number>>(new Set());

  // Load previously viewed materials when lesson opens
  useEffect(() => {
    if (lesson && isOpen) {
      const loadViewedMaterials = async () => {
        try {
          const response = await axios.get(`/progress/material-progress?year=${parseInt(lesson.yearLevel.replace('Year ', ''))}&subject=${lesson.subject}&topic=${lesson.title}`);
          const materialsViewed = response.data.materialsViewed || [];
          setViewedMaterials(new Set(materialsViewed));
        } catch (error) {
          console.error('Error loading material progress:', error);
          // Reset to empty set if error
          setViewedMaterials(new Set());
        }
      };
      loadViewedMaterials();
    }
  }, [lesson, isOpen]);

  if (!lesson) return null;

  const handleViewMaterial = async (materialId: number) => {
    try {
      await axios.post('/progress/mark-material-viewed', {
        year: parseInt(lesson.yearLevel.replace('Year ', '')),
        subject: lesson.subject,
        topic: lesson.title,
        materialId
      });
      setViewedMaterials(prev => new Set(prev).add(materialId));
    } catch (error) {
      console.error('Error marking material as viewed:', error);
      // Still mark as viewed locally for better UX
      setViewedMaterials(prev => new Set(prev).add(materialId));
    }
  };

  const handleCompleteLesson = () => {
    onComplete(lesson.id);
    onClose();
  };

  const getMaterialIcon = (type: string) => {
    switch (type) {
      case "PDF": return <FileText className="w-5 h-5" />;
      case "Video": return <Video className="w-5 h-5" />;
      case "Audio": return <AudioLines className="w-5 h-5" />;
      case "PPT": return <Presentation className="w-5 h-5" />;
      case "Link": return <Link className="w-5 h-5" />;
      default: return <FileText className="w-5 h-5" />;
    }
  };

  const handleMaterialClick = async (material: Lesson['materials'][0]) => {
    if (material.url) {
      try {
        // For uploaded files, use the backend route
        if (material.type !== "Link") {
          const response = await axios.get(`/lessons/${lesson.id}/materials/${material.id}/view`, {
            responseType: 'blob'
          });
          const blob = new Blob([response.data], { type: response.headers['content-type'] });
          const url = window.URL.createObjectURL(blob);
          window.open(url, '_blank');
        } else {
          // For external links, open directly
          window.open(material.url, '_blank');
        }
        handleViewMaterial(material.id);
      } catch (error) {
        console.error('Error viewing material:', error);
        // Fallback: try opening the URL directly
        if (material.url) {
          window.open(material.url, '_blank');
          handleViewMaterial(material.id);
        }
      }
    }
  };

  const allMaterialsViewed = lesson.materials.length > 0 && lesson.materials.every(m => viewedMaterials.has(m.id));

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center font-bold text-sm">
              {lesson.order}
            </div>
            <div>
              <h2 className="text-xl font-bold">{lesson.title}</h2>
              <p className="text-sm text-gray-600">{lesson.subject} - {lesson.yearLevel}</p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Lesson Description */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Penerangan</h3>
            <p className="text-gray-700">{lesson.description}</p>
          </div>

          {/* Materials Section */}
          {lesson.materials && lesson.materials.length > 0 ? (
            <div>
              <h3 className="font-semibold mb-4">Bahan Pembelajaran</h3>
              <div className="grid gap-3">
                {lesson.materials.map((material) => {
                  const isViewed = viewedMaterials.has(material.id);
                  return (
                    <div
                      key={material.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                        isViewed ? 'border-green-300 bg-green-50' : 'border-gray-200 hover:border-blue-300'
                      }`}
                      onClick={() => handleMaterialClick(material)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${isViewed ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                            {getMaterialIcon(material.type)}
                          </div>
                          <div>
                            <h4 className="font-medium">{material.title}</h4>
                            <Badge variant="outline" className="text-xs">
                              {material.type}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {isViewed && <CheckCircle className="w-5 h-5 text-green-600" />}
                          <span className="text-sm text-gray-500">Klik untuk buka</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>Tiada bahan pembelajaran untuk pelajaran ini.</p>
            </div>
          )}

          {/* Completion Section */}
          <div className="border-t pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold mb-1">Status Pembelajaran</h4>
                <p className="text-sm text-gray-600">
                  {allMaterialsViewed
                    ? "Anda telah melihat semua bahan. Anda boleh menandakan pelajaran ini sebagai selesai."
                    : lesson.materials.length > 0
                    ? `Sila lihat semua bahan pembelajaran (${viewedMaterials.size}/${lesson.materials.length} dilihat)`
                    : "Pelajaran ini tidak mempunyai bahan tambahan."
                  }
                </p>
              </div>
              <Button
                onClick={handleCompleteLesson}
                className="bg-green-600 hover:bg-green-700 text-white"
                disabled={!allMaterialsViewed && lesson.materials.length > 0}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Tandakan Selesai
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
