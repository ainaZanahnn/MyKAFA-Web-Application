
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Trash2, Plus } from 'lucide-react';

interface MCQQuestionData {
  questionText: string;
  answerType: 'single' | 'multiple';
  options: string[];
  correctAnswers: string[];
}

interface MCQQuestionProps {
  question: MCQQuestionData;
  onUpdate: (field: keyof MCQQuestionData, value: string | string[]) => void;
}

export function MCQQuestion({ question, onUpdate }: MCQQuestionProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-bold text-slate-700 mb-2">Teks Soalan / Senario</label>
        <textarea
          value={question.questionText}
          onChange={(e) => onUpdate("questionText", e.target.value)}
          placeholder="Masukkan soalan atau senario"
          className="w-full px-4 py-2 border border-slate-300 rounded-lg min-h-[100px]"
        />
      </div>

      <div>
        <label className="block text-sm font-bold text-slate-700 mb-2">Jenis Jawapan</label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              checked={question.answerType === "single"}
              onChange={() => onUpdate("answerType", "single")}
            />
            Satu Jawapan
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              checked={question.answerType === "multiple"}
              onChange={() => onUpdate("answerType", "multiple")}
            />
            Banyak Jawapan
          </label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-bold text-slate-700 mb-2">Senarai Pilihan (3-5 pilihan)</label>
        {question.options?.map((option: string, optIndex: number) => (
          <div key={optIndex} className="flex gap-2 mb-2 items-center">
            <span className="text-sm font-semibold text-slate-600 w-20">Pilihan {optIndex + 1}:</span>
            <Input
              value={option}
              onChange={(e) => {
                const newOptions = [...question.options]
                newOptions[optIndex] = e.target.value
                onUpdate("options", newOptions)
              }}
              placeholder={`Pilihan ${optIndex + 1}`}
              className="flex-1"
            />
            {question.options.length > 3 && (
              <button
                onClick={() => {
                  const newOptions = question.options.filter((_, i: number) => i !== optIndex)
                  onUpdate("options", newOptions)
                }}
                className="p-2 hover:bg-red-100 rounded text-red-600"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
        {question.options.length < 5 && (
          <Button
            onClick={() => {
              const newOptions = [...question.options, ""]
              onUpdate("options", newOptions)
            }}
            variant="outline"
            size="sm"
            className="mt-2"
          >
            <Plus className="w-4 h-4 mr-2" />
            Tambah Pilihan
          </Button>
        )}
      </div>

      <div>
        <label className="block text-sm font-bold text-slate-700 mb-2">
          Jawapan Betul (Tandakan sebagai Answer1, Answer2...)
        </label>
        <div className="space-y-2">
          {question.options?.map((option: string, optIndex: number) => (
            <label key={optIndex} className="flex items-center gap-3 p-3 bg-white rounded-lg border">
              <input
                type="checkbox"
                checked={question.correctAnswers?.includes(`Answer${optIndex + 1}`)}
                onChange={(e) => {
                  const answerLabel = `Answer${optIndex + 1}`
                  const newCorrectAnswers = e.target.checked
                    ? [...(question.correctAnswers || []), answerLabel]
                    : question.correctAnswers.filter((a: string) => a !== answerLabel)
                  onUpdate("correctAnswers", newCorrectAnswers)
                }}
                className="w-4 h-4"
              />
              <span className="font-semibold text-green-600">Answer{optIndex + 1}</span>
              <span className="text-slate-600">{option || "(Kosong)"}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
