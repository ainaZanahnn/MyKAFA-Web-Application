
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Trash2, Plus, ChevronDown, ChevronUp } from 'lucide-react';
import type { Question } from '@/components/admin/quiztable';

interface QuestionCardProps {
  question: Question;
  index: number;
  quizType: string;
  onRemoveQuestion: (id: number) => void;
  onUpdateQuestion: (id: number, field: string, value: unknown) => void;
}

export function QuestionCard({
  question,
  index,
  quizType,
  onRemoveQuestion,
  onUpdateQuestion
}: QuestionCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpanded = () => setIsExpanded(!isExpanded);

  return (
    <Card className={`${isExpanded ? 'p-6' : 'p-4'} bg-slate-50 border-slate-200`}>
      <div className={`flex justify-between items-start ${isExpanded ? 'mb-4' : 'mb-2'}`}>
        <div className="flex items-center gap-3">
          <h3 className="text-xl font-bold text-slate-800">Soalan {index + 1}</h3>
          <button
            onClick={toggleExpanded}
            className="p-1 hover:bg-slate-200 rounded text-slate-600"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
        <button
          onClick={() => onRemoveQuestion(question.id)}
          disabled={false} // Will be handled by parent
          className="p-2 hover:bg-red-100 rounded-lg text-red-600 disabled:opacity-50"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      {/* Summary view when collapsed */}
      {!isExpanded && (
        <div className="cursor-pointer" onClick={toggleExpanded}>
          <div className="flex justify-between items-center">
            <div className="flex-1">
              <div className="text-slate-700 font-medium truncate">
                {question.questionText || "Tiada teks soalan"}
              </div>
              <div className="text-slate-600 text-sm">
                {question.answerType === "single" ? "Jawapan Tunggal" : "Jawapan Berganda"}
              </div>
            </div>
            <div className="text-slate-500 text-xs italic ml-4">
              Klik untuk edit
            </div>
          </div>
        </div>
      )}

      {/* Full details when expanded */}
      {isExpanded && quizType === "mcq" && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Teks Soalan / Senario</label>
            <Textarea
              value={question.questionText}
              onChange={(e) => onUpdateQuestion(question.id, "questionText", e.target.value)}
              placeholder="Masukkan soalan atau senario"
              className="text-lg"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Jenis Jawapan</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={question.answerType === "single"}
                    onChange={() => onUpdateQuestion(question.id, "answerType", "single")}
                  />
                  Satu Jawapan
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={question.answerType === "multiple"}
                    onChange={() => onUpdateQuestion(question.id, "answerType", "multiple")}
                  />
                  Banyak Jawapan
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Tahap Kesukaran</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={question.difficulty === "easy"}
                    onChange={() => onUpdateQuestion(question.id, "difficulty", "easy")}
                  />
                  Mudah
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={question.difficulty === "medium"}
                    onChange={() => onUpdateQuestion(question.id, "difficulty", "medium")}
                  />
                  Sederhana
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={question.difficulty === "hard"}
                    onChange={() => onUpdateQuestion(question.id, "difficulty", "hard")}
                  />
                  Sukar
                </label>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-4 mb-3">
              <Button onClick={() => {
                const newHints = [...(question.hints || []), ""];
                onUpdateQuestion(question.id, "hints", newHints);
              }}
              variant="outline"
              size="sm"
              className="mt-2"
            ><Plus className="w-4 h-4 mr-2" />Tambah Petunjuk
            </Button>
            <p className="text-xs text-slate-500">Petunjuk membantu pelajar yang menghadapi kesukaran. Petunjuk pertama akan ditunjukkan dahulu, diikuti dengan petunjuk yang lebih terperinci jika diperlukan.</p>
            </div>
            {(question.hints || []).map((hint: string, hintIndex: number) => (
              <div key={hintIndex} className="flex gap-2 mb-2 items-center">
                <span className="text-sm font-semibold text-slate-600 w-20">Petunjuk {hintIndex + 1}:</span>
                <Textarea
                  value={hint}
                  onChange={(e) => {
                    const newHints = [...(question.hints || [])];
                    newHints[hintIndex] = e.target.value;
                    onUpdateQuestion(question.id, "hints", newHints);
                  }}
                  placeholder={`Petunjuk ${hintIndex + 1}`}
                  className="flex-1"
                  rows={2}
                />
                {(question.hints || []).length > 0 && (
                  <button
                    onClick={() => {
                      const newHints = (question.hints || []).filter((_: string, i: number) => i !== hintIndex);
                      onUpdateQuestion(question.id, "hints", newHints);
                    }}
                    className="p-2 hover:bg-red-100 rounded text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-bold text-slate-700">Pilihan Jawapan</label>
              {question.options.length < 5 && (
                <Button
                  onClick={() => {
                    const newOptions = [...question.options, ""]
                    onUpdateQuestion(question.id, "options", newOptions)
                  }}
                  variant="outline"
                  size="sm"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Tambah Pilihan
                </Button>
              )}
            </div>
            {question.options?.map((option: string, optIndex: number) => (
              <div key={optIndex} className="flex gap-2 mb-2 items-center">
                <span className="text-sm font-semibold text-slate-600 w-20">Pilihan {optIndex + 1}:</span>
                <Input
                  value={option}
                  onChange={(e) => {
                    const newOptions = [...question.options]
                    newOptions[optIndex] = e.target.value
                    onUpdateQuestion(question.id, "options", newOptions)
                  }}
                  placeholder={`Pilihan ${optIndex + 1}`}
                  className="flex-1"
                />
                {question.options.length > 3 && (
                  <button
                    onClick={() => {
                      const newOptions = question.options.filter((_: string, i: number) => i !== optIndex)
                      onUpdateQuestion(question.id, "options", newOptions)
                    }}
                    className="p-2 hover:bg-red-100 rounded text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Jawapan Betul
            </label>
            <div className="space-y-2">
              {question.options?.map((option: string, optIndex: number) => (
                <label key={optIndex} className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                  <input
                    type={question.answerType === "single" ? "radio" : "checkbox"}
                    name={`question-${question.id}`}
                    checked={
                      question.answerType === "single"
                        ? question.correctAnswers.includes(`Answer${optIndex + 1}`)
                        : question.correctAnswers.includes(`Answer${optIndex + 1}`)
                    }
                    onChange={(e) => {
                      const answerLabel = `Answer${optIndex + 1}`
                      if (question.answerType === "single") {
                        onUpdateQuestion(question.id, "correctAnswers", [answerLabel])
                      } else {
                        const newAnswers = e.target.checked
                          ? [...question.correctAnswers, answerLabel]
                          : question.correctAnswers.filter((a: string) => a !== answerLabel)
                        onUpdateQuestion(question.id, "correctAnswers", newAnswers)
                      }
                    }}
                    className="w-4 h-4"
                  />
                  <span className="font-semibold text-green-600">Jawapan{optIndex + 1}</span>
                  <span className="text-slate-600">{option || "(Kosong)"}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
