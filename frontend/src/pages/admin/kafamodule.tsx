/** @format */

"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LessonTable } from "@/components/admin/lessontable";
import type { Lesson } from "@/components/admin/lessontable";
import { Textarea } from "@/components/ui/textarea";
import axios from "@/lib/axios";
import { toast } from "react-toastify";


const kafaSubjects = [
  { id: 1, name: "Al-Quran", nameEn: "Quran", icon: "📖", color: "bg-blue-500" },
  { id: 2, name: "Akidah", nameEn: "Aqidah", icon: "🕌", color: "bg-green-500" },
  { id: 3, name: "Ibadah", nameEn: "Ibadah", icon: "🤲", color: "bg-purple-500" },
  { id: 4, name: "Sirah", nameEn: "Sirah", icon: "📚", color: "bg-orange-500" },
  { id: 5, name: "Adab", nameEn: "Adab", icon: "🌟", color: "bg-pink-500" },
  { id: 6, name: "Bahasa Arab", nameEn: "Arabic Language", icon: "🔤", color: "bg-red-500" },
  { id: 7, name: "Jawi dan Khat", nameEn: "Jawi and Khat", icon: "✍️", color: "bg-indigo-500" },
  { id: 8, name: "Tahfiz al-Quran", nameEn: "Tahfiz Al-Quran", icon: "🎵", color: "bg-teal-500" },
];

const yearLevels = ["Tahun 1", "Tahun 2", "Tahun 3", "Tahun 4", "Tahun 5", "Tahun 6"];

const yearMapping = {
  "Tahun 1": "Year 1",
  "Tahun 2": "Year 2",
  "Tahun 3": "Year 3",
  "Tahun 4": "Year 4",
  "Tahun 5": "Year 5",
  "Tahun 6": "Year 6",
};

const reverseYearMapping = {
  "Year 1": "Tahun 1",
  "Year 2": "Tahun 2",
  "Year 3": "Tahun 3",
  "Year 4": "Tahun 4",
  "Year 5": "Tahun 5",
  "Year 6": "Tahun 6",
};

export function LearningModuleManagement() {
  // Define subject type
  type Subject = {
    id: number;
    name: string;
    nameEn: string;
    icon: string;
    color: string;
  };

  // Start with default selections
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null); // Default to "All" subjects
  const [selectedYear, setSelectedYear] = useState<string>("Tahun 1"); // Default to Tahun 1
  const [isAddLessonOpen, setIsAddLessonOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);

  // Form state variables
  const [dialogYear, setDialogYear] = useState<string>(selectedYear);
  const [dialogSubject, setDialogSubject] = useState<Subject>(kafaSubjects[0]);
  const [lessonTitle, setLessonTitle] = useState<string>("");
  const [lessonDescription, setLessonDescription] = useState<string>("");
  const [lessonStatus, setLessonStatus] = useState<string>("Draft");
  const [materials, setMaterials] = useState<Array<{ type: string; title: string; file?: File; link?: string }>>([]);
  const [lessonOrder, setLessonOrder] = useState<number>(0);

  // Fetch lessons when year or subject changes
  useEffect(() => {
    const fetchLessons = async () => {
      try {
        const englishYear = yearMapping[selectedYear as keyof typeof yearMapping] || selectedYear;
        let url = `lessons?year_level=${englishYear}`;
        if (selectedSubject) {
          url += `&subject=${selectedSubject.name}`;
        }
        const response = await axios.get(url);
        // Map yearLevel back to Malay for display
        const mappedLessons = response.data.map((lesson: Lesson) => ({
          ...lesson,
          yearLevel: reverseYearMapping[lesson.yearLevel as keyof typeof reverseYearMapping] || lesson.yearLevel
        }));
        setLessons(mappedLessons);
      } catch (error) {
        console.error('Error fetching lessons:', error);
        toast.error('Gagal memuatkan pelajaran');
      }
    };

    if (selectedYear) {
      fetchLessons();
    }
  }, [selectedYear, selectedSubject]);

  const updateLessonStatus = async (lessonId: number, newStatus: string) => {
    try {
      await axios.patch(`lessons/${lessonId}/status`, { status: newStatus });
      setLessons((prev) =>
        prev.map((lesson) =>
          lesson.id === lessonId ? { ...lesson, status: newStatus } : lesson
        )
      );
      toast.success('Status pelajaran berjaya dikemaskini');
    } catch (error) {
      console.error('Error updating lesson status:', error);
      toast.error('Gagal mengemaskini status pelajaran');
    }
  };

  const handleEditLesson = (lesson: Lesson) => {
    setEditingLesson(lesson);
    setDialogYear(lesson.yearLevel);
    setDialogSubject(kafaSubjects.find(s => s.name === lesson.subject) || kafaSubjects[0]);
    setLessonTitle(lesson.title);
    setLessonDescription(lesson.description);
    setLessonStatus(lesson.status);
    setLessonOrder(lesson.order);
    setMaterials(lesson.materials.map(m => ({ type: m.type, title: m.title, link: m.url, file: undefined })));
  };

  const handleUpdateLesson = async () => {
    if (!editingLesson) return;

    try {
      const formData = new FormData();

                        // Add lesson data
                        formData.append('subject', dialogSubject.nameEn);
      formData.append('title', lessonTitle);
      formData.append('description', lessonDescription);
      formData.append('year_level', yearMapping[dialogYear as keyof typeof yearMapping] || dialogYear);
      formData.append('status', lessonStatus);
      formData.append('lesson_order', (lessonOrder || 1).toString());

      // Add materials data
      materials.forEach((material, index) => {
        formData.append(`materials[${index}][type]`, material.type);
        formData.append(`materials[${index}][title]`, material.title);
        if (material.link) {
          formData.append(`materials[${index}][url]`, material.link);
        }
        if (material.file) {
          formData.append('files', material.file);
        }
      });

      const response = await axios.put(`lessons/${editingLesson.id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setLessons((prev) =>
        prev.map((lesson) =>
          lesson.id === editingLesson.id ? response.data : lesson
        )
      );

      // Reset form
      setLessonTitle("");
      setLessonDescription("");
      setLessonStatus("Draft");
      setMaterials([]);
      setLessonOrder(0);
      setEditingLesson(null);

      toast.success('Pelajaran berjaya dikemaskini');
    } catch (error) {
      console.error('Error updating lesson:', error);
      toast.error('Gagal mengemaskini pelajaran');
    }
  };

  return (
    <div>
        {/* Show Lesson Table */}
        <div>
          <div className="bg-primary text-primary-foreground p-4 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div>
                <h2 className="text-lg font-semibold">
                  Pengurusan Modul Pembelajaran
                </h2>
                <p className="text-sm text-primary-foreground/80">
                  Urus pelajaran dan kandungan
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-[120px] bg-white/10 border-white/20 text-white"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {yearLevels.map((year) => (
                    <SelectItem key={year} value={year}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>


              <Select value={selectedSubject ? selectedSubject.name : "All"} onValueChange={(value) => {
                  if (value === "All") {
                    setSelectedSubject(null);
                  } else {
                    const subject = kafaSubjects.find(s => s.name === value);
                    if (subject) setSelectedSubject(subject);
                  }
                }} >
                <SelectTrigger className="w-[180px] bg-white/10 border-white/20 text-white"> <SelectValue /> </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">Semua</SelectItem>
                  {kafaSubjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.name}>
                      {subject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>


            <Dialog open={isAddLessonOpen} onOpenChange={setIsAddLessonOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-white text-primary">
                  + Tambah Pelajaran
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle className="mb-4"><center>Tambah Pelajaran Baru</center></DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="mb-2">Tahap Tahun</Label>
                      <Select value={dialogYear} onValueChange={setDialogYear}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {yearLevels.map((year) => (
                            <SelectItem key={year} value={year}>
                              {year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="mb-2">Subjek</Label>
                      <Select
                        value={dialogSubject.name}
                        onValueChange={(value) => {
                          const subject = kafaSubjects.find(s => s.name === value);
                          if (subject) setDialogSubject(subject);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {kafaSubjects.map((subject) => (
                            <SelectItem key={subject.id} value={subject.name}>
                              {subject.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label className="mb-2">Tajuk Pelajaran</Label>
                    <Input
                      placeholder="Masukkan tajuk"
                      value={lessonTitle}
                      onChange={(e) => setLessonTitle(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="mb-2">Penerangan</Label>
                    <Textarea
                      placeholder="Penerangan ringkas"
                      value={lessonDescription}
                      onChange={(e) => setLessonDescription(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="mb-2">Status</Label>
                    <Select value={lessonStatus} onValueChange={setLessonStatus}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Draft">Draf</SelectItem>
                        <SelectItem value="Published">Diterbitkan</SelectItem>
                        <SelectItem value="Unpublished">Tidak Diterbitkan</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="mb-2">Bahan</Label>
                    {materials.map((material, index) => (
                      <div key={index} className="flex gap-2 items-end mb-2">
                        <div className="flex-1">
                          <Select value={material.type} onValueChange={
                            (value) =>
                                setMaterials((prev) =>
                                prev.map((m, i) =>
                                  i === index ? { ...m, type: value } : m
                                ))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Jenis" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="PDF">PDF</SelectItem>
                              <SelectItem value="PPT">PPT</SelectItem>
                              <SelectItem value="Video">Video</SelectItem>
                              <SelectItem value="Audio">Audio</SelectItem>
                              <SelectItem value="Link">Link</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex-1">
                          <Input
                            placeholder="Tajuk"
                            value={material.title}
                            onChange={(e) =>
                              setMaterials((prev) =>
                                prev.map((m, i) =>
                                  i === index ? { ...m, title: e.target.value } : m
                                )
                              )
                            }
                          />
                        </div>
                        <div className="flex-1">
                          {material.type === "Link" ? (
                            <Input
                              placeholder="URL"
                              value={material.link || ""}
                              onChange={(e) =>
                                setMaterials((prev) =>
                                  prev.map((m, i) =>
                                    i === index ? { ...m, link: e.target.value } : m
                                  )
                                )
                              }
                            />
                          ) : (
                            <Input
                              type="file"
                              accept={
                                material.type === "PDF" ? ".pdf" :
                                material.type === "PPT" ? ".ppt,.pptx" :
                                material.type === "Video" ? ".mp4,.avi" :
                                ".mp3,.wav"
                              }
                              onChange={(e) =>
                                setMaterials((prev) =>
                                  prev.map((m, i) =>
                                    i === index ? { ...m, file: e.target.files?.[0] } : m
                                  )
                                )
                              }
                            />
                          )}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setMaterials((prev) => prev.filter((_, i) => i !== index))
                          }
                        >
                          Buang
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="outline" onClick={() =>
                        setMaterials((prev) => [
                          ...prev, { type: "PDF", title: "", file: undefined, link: "" },
                        ])
                      }
                    > + Tambah Bahan
                    </Button>
                  </div>
                  <div>
                    <Label >Susunan</Label>
                    <Input
                      type="number"
                      placeholder="Susunan (pilihan)"
                      value={lessonOrder}
                      onChange={(e) => setLessonOrder(Number(e.target.value))}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsAddLessonOpen(false)}>
                      Batal
                    </Button>
                    <Button onClick={async () => {
                      try {
                        const formData = new FormData();

                        // Add lesson data
                        formData.append('subject', dialogSubject.nameEn);
                        formData.append('title', lessonTitle);
                        formData.append('description', lessonDescription);
                        formData.append('year_level', yearMapping[dialogYear as keyof typeof yearMapping] || dialogYear);
                        formData.append('status', lessonStatus);
                        formData.append('lesson_order', (lessonOrder || 1).toString());

                        // Add materials data
                        materials.forEach((material, index) => {
                          formData.append(`materials[${index}][type]`, material.type);
                          formData.append(`materials[${index}][title]`, material.title);
                          if (material.link) {
                            formData.append(`materials[${index}][url]`, material.link);
                          }
                          if (material.file) {
                            formData.append('files', material.file);
                          }
                        });

                        const response = await axios.post('lessons', formData, {
                          headers: {
                            'Content-Type': 'multipart/form-data',
                          },
                        });
                        setLessons((prev) => [...prev, response.data]);

                        // Reset form
                        setLessonTitle("");
                        setLessonDescription("");
                        setLessonStatus("Draft");
                        setMaterials([]);
                        setLessonOrder(0);
                        setDialogYear(selectedYear);
                        setIsAddLessonOpen(false);

                        toast.success('Pelajaran berjaya dibuat');
                      } catch (error) {
                        console.error('Error creating lesson:', error);
                        toast.error('Gagal membuat pelajaran');
                      }
                    }}>
                      Simpan
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={!!editingLesson} onOpenChange={(open) => !open && setEditingLesson(null)}>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle className="mb-4"><center>Edit Pelajaran</center></DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="mb-2">Tahap Tahun</Label>
                      <Select value={dialogYear} onValueChange={setDialogYear}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {yearLevels.map((year) => (
                            <SelectItem key={year} value={year}>
                              {year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="mb-2">Subjek</Label>
                      <Select
                        value={dialogSubject.name}
                        onValueChange={(value) => {
                          const subject = kafaSubjects.find(s => s.name === value);
                          if (subject) setDialogSubject(subject);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {kafaSubjects.map((subject) => (
                            <SelectItem key={subject.id} value={subject.name}>
                              {subject.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label className="mb-2">Tajuk Pelajaran</Label>
                    <Input
                      placeholder="Masukkan tajuk"
                      value={lessonTitle}
                      onChange={(e) => setLessonTitle(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="mb-2">Penerangan</Label>
                    <Textarea
                      placeholder="Penerangan ringkas"
                      value={lessonDescription}
                      onChange={(e) => setLessonDescription(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="mb-2">Status</Label>
                    <Select value={lessonStatus} onValueChange={setLessonStatus}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Draft">Draf</SelectItem>
                        <SelectItem value="Published">Diterbitkan</SelectItem>
                        <SelectItem value="Unpublished">Tidak Diterbitkan</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="mb-2">Bahan</Label>
                    {materials.map((material, index) => (
                      <div key={index} className="flex gap-2 items-end mb-2">
                        <div className="flex-1">
                          <Select value={material.type} onValueChange={
                            (value) =>
                                setMaterials((prev) =>
                                prev.map((m, i) =>
                                  i === index ? { ...m, type: value } : m
                                ))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Jenis" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="PDF">PDF</SelectItem>
                              <SelectItem value="PPT">PPT</SelectItem>
                              <SelectItem value="Video">Video</SelectItem>
                              <SelectItem value="Audio">Audio</SelectItem>
                              <SelectItem value="Link">Link</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex-1">
                          <Input
                            placeholder="Tajuk"
                            value={material.title}
                            onChange={(e) =>
                              setMaterials((prev) =>
                                prev.map((m, i) =>
                                  i === index ? { ...m, title: e.target.value } : m
                                )
                              )
                            }
                          />
                        </div>
                        <div className="flex-1">
                          {material.type === "Link" ? (
                            <Input
                              placeholder="URL"
                              value={material.link || ""}
                              onChange={(e) =>
                                setMaterials((prev) =>
                                  prev.map((m, i) =>
                                    i === index ? { ...m, link: e.target.value } : m
                                  )
                                )
                              }
                            />
                          ) : (
                            <Input
                              type="file"
                              accept={
                                material.type === "PDF" ? ".pdf" :
                                material.type === "PPT" ? ".ppt,.pptx" :
                                material.type === "Video" ? ".mp4,.avi" :
                                ".mp3,.wav"
                              }
                              onChange={(e) =>
                                setMaterials((prev) =>
                                  prev.map((m, i) =>
                                    i === index ? { ...m, file: e.target.files?.[0] } : m
                                  )
                                )
                              }
                            />
                          )}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setMaterials((prev) => prev.filter((_, i) => i !== index))
                          }
                        >
                          Buang
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="outline" onClick={() =>
                        setMaterials((prev) => [
                          ...prev, { type: "PDF", title: "", file: undefined, link: "" },
                        ])
                      }
                    > + Tambah Bahan
                    </Button>
                  </div>
                  <div>
                    <Label >Susunan</Label>
                    <Input
                      type="number"
                      placeholder="Susunan (pilihan)"
                      value={lessonOrder}
                      onChange={(e) => setLessonOrder(Number(e.target.value))}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setEditingLesson(null)}>
                      Batal
                    </Button>
                    <Button onClick={handleUpdateLesson}>
                      Kemaskini
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>



          {/* Lesson Table Component */}
          <LessonTable
            lessons={lessons}
            onUpdateStatus={updateLessonStatus}
            onEditLesson={handleEditLesson}
            onDeleteLesson={async (lessonId: number) => {
              if (window.confirm('Are you sure you want to delete this lesson?')) {
                try {
                  await axios.delete(`lessons/${lessonId}`);
                  setLessons((prev) => prev.filter((lesson) => lesson.id !== lessonId));
                  toast.success('Lesson deleted successfully');
                } catch (error) {
                  console.error('Error deleting lesson:', error);
                  toast.error('Failed to delete lesson');
                }
              }
            }}
          />
        </div>
    </div>
  );
}
