import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
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
import { Textarea } from "@/components/ui/textarea";
import lessonService from "@/services/lessonService";
import { toast } from "react-toastify";
import { kafaSubjects, yearLevels, yearMapping } from "@/constants/kafaConstants";
import type { Subject } from "@/types/kafaTypes";
import type { Lesson } from "@/components/admin/lessontable";

interface AddLessonDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedYear: string;
  onLessonAdded: (lesson: Lesson) => void;
}

export function AddLessonDialog({ isOpen, onOpenChange, selectedYear, onLessonAdded }: AddLessonDialogProps) {
  const [dialogYear, setDialogYear] = useState<string>(selectedYear);
  const [dialogSubject, setDialogSubject] = useState<Subject>(kafaSubjects[0]);
  const [lessonTitle, setLessonTitle] = useState<string>("");
  const [lessonDescription, setLessonDescription] = useState<string>("");
  const [lessonStatus, setLessonStatus] = useState<string>("Draft");
  const [materials, setMaterials] = useState<Array<{ type: string; title: string; file?: File; link?: string }>>([]);
  const [lessonOrder, setLessonOrder] = useState<number>(0);

  const handleSave = async () => {
    try {
      const createData = {
        subject: dialogSubject.name,
        title: lessonTitle,
        description: lessonDescription,
        year_level: yearMapping[dialogYear as keyof typeof yearMapping] || dialogYear,
        status: lessonStatus,
        lesson_order: lessonOrder || 1,
        materials: materials.map(material => ({
          type: material.type,
          title: material.title,
          url: material.link || undefined
        }))
      };

      const files = materials.filter(m => m.file).map(m => m.file!);

      const response = await lessonService.createLesson(createData, files);
      onLessonAdded(response as Lesson);

      // Reset form
      setLessonTitle("");
      setLessonDescription("");
      setLessonStatus("Draft");
      setMaterials([]);
      setLessonOrder(0);
      setDialogYear(selectedYear);
      onOpenChange(false);

      toast.success('Pelajaran berjaya dibuat');
    } catch (error) {
      console.error('Error creating lesson:', error);
      toast.error('Gagal membuat pelajaran');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="mb-4"><center>Tambah Pelajaran Baru</center></DialogTitle>
          <DialogDescription>
            Isi borang di bawah untuk menambah pelajaran baru ke dalam sistem.
          </DialogDescription>
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
              onChange={(e) => setLessonOrder(parseInt(e.target.value) || 0)}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button onClick={handleSave}>
              Simpan
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
