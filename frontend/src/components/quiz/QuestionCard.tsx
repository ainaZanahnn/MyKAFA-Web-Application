
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Trash2, Plus, ChevronDown, ChevronUp, GripVertical } from 'lucide-react';
import type { Question, QuestionOption } from '@/components/admin/quiztable';

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

  // Generate unique ID for new options
  const generateOptionId = () => `opt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Update option text
  const updateOptionText = (optionId: string, newText: string) => {
    const newOptions = question.options.map(opt =>
      opt.id === optionId ? { ...opt, text: newText } : opt
    );
    onUpdateQuestion(question.id || 0, "options", newOptions);

    // If the text is being filled (not emptied) and it's not already the correct answer,
    // automatically set it as the correct answer
    if (newText.trim() !== '' && !question.correctAnswers.includes(optionId)) {
      if (question.answerType === "single") {
        onUpdateQuestion(question.id || 0, "correctAnswers", [optionId]);
      } else {
        // For multiple answers, add it to correct answers
        const newCorrectAnswers = [...question.correctAnswers, optionId];
        onUpdateQuestion(question.id || 0, "correctAnswers", newCorrectAnswers);
      }
    }
  };

  // Add new option
  const addOption = () => {
    const newOption: QuestionOption = {
      id: generateOptionId(),
      text: ""
    };
    const newOptions = [...question.options, newOption];
    onUpdateQuestion(question.id || 0, "options", newOptions);
  };

  // Remove option
  const removeOption = (optionId: string) => {
    const newOptions = question.options.filter(opt => opt.id !== optionId);
    // Also remove from correct answers if it was selected
    const newCorrectAnswers = question.correctAnswers.filter(id => id !== optionId);
    onUpdateQuestion(question.id || 0, "options", newOptions);
    if (newCorrectAnswers.length !== question.correctAnswers.length) {
      onUpdateQuestion(question.id || 0, "correctAnswers", newCorrectAnswers);
    }
  };

  // Toggle correct answer
  const toggleCorrectAnswer = (optionId: string) => {
    if (question.answerType === "single") {
      onUpdateQuestion(question.id || 0, "correctAnswers", [optionId]);
    } else {
      const newAnswers = question.correctAnswers.includes(optionId)
        ? question.correctAnswers.filter(id => id !== optionId)
        : [...question.correctAnswers, optionId];
      onUpdateQuestion(question.id || 0, "correctAnswers", newAnswers);
    }
  };

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
          onClick={() => onRemoveQuestion(question.id || 0)}
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
              onChange={(e) => onUpdateQuestion(question.id || 0, "questionText", e.target.value)}
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
                    onChange={() => onUpdateQuestion(question.id || 0, "answerType", "single")}
                  />
                  Satu Jawapan
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={question.answerType === "multiple"}
                    onChange={() => onUpdateQuestion(question.id || 0, "answerType", "multiple")}
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
                    onChange={() => onUpdateQuestion(question.id || 0, "difficulty", "easy")}
                  />
                  Mudah
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={question.difficulty === "medium"}
                    onChange={() => onUpdateQuestion(question.id || 0, "difficulty", "medium")}
                  />
                  Sederhana
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={question.difficulty === "hard"}
                    onChange={() => onUpdateQuestion(question.id || 0, "difficulty", "hard")}
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
                onUpdateQuestion(question.id || 0, "hints", newHints);
              }}
              variant="outline"
              size="sm"
              className="mt-2"
            ><Plus className="w-4 h-4 mr-2" />Tambah Petunjuk
            </Button>
            <p className="text-xs text-slate-500">Petunjuk membantu pelajar yang menghadapi kesukaran. Petunjuk pertama akan ditunjukkan dahulu, diikuti dengan petunjuk yang lebih terperinci jika diperlukan.</p>
            </div>
            {(question.hints || []).map((hint: string, hintIndex: number) => (
              <div key={`hint-${index}-${hintIndex}`} className="flex gap-2 mb-2 items-center">
                <span className="text-sm font-semibold text-slate-600 w-20">Petunjuk {hintIndex + 1}:</span>
                <Textarea
                  value={hint}
                  onChange={(e) => {
                    const newHints = [...(question.hints || [])];
                    newHints[hintIndex] = e.target.value;
                    onUpdateQuestion(question.id || 0, "hints", newHints);
                  }}
                  placeholder={`Petunjuk ${hintIndex + 1}`}
                  className="flex-1"
                  rows={2}
                />
                {(question.hints || []).length > 0 && (
                  <button
                    onClick={() => {
                      const newHints = (question.hints || []).filter((_: string, i: number) => i !== hintIndex);
                      onUpdateQuestion(question.id || 0, "hints", newHints);
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
                  onClick={addOption}
                  variant="outline"
                  size="sm"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Tambah Pilihan
                </Button>
              )}
            </div>
            {question.options?.map((option: QuestionOption, optIndex: number) => (
              <div key={`option-${index}-${optIndex}`} className="flex gap-2 mb-2 items-center">
                <GripVertical className="w-4 h-4 text-slate-400 cursor-move" />
                <span className="text-sm font-semibold text-slate-600 w-20">Pilihan {optIndex + 1}:</span>
                <Input
                  value={option.text}
                  onChange={(e) => updateOptionText(option.id, e.target.value)}
                  placeholder={`Pilihan ${optIndex + 1}`}
                  className="flex-1"
                  autoComplete="off"
                />
                {question.options.length > 3 && (
                  <button
                    onClick={() => removeOption(option.id)}
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
              {question.options?.map((option: QuestionOption, optIndex: number) => (
                <label key={`correct-${index}-${optIndex}`} className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                  <input
                    type={question.answerType === "single" ? "radio" : "checkbox"}
                    name={`question-${question.id || index}`}
                    checked={question.correctAnswers.includes(option.id)}
                    onChange={() => toggleCorrectAnswer(option.id)}
                    className="w-4 h-4"
                  />
                  <span className="font-semibold text-green-600">Jawapan{optIndex + 1}</span>
                  <span className="text-slate-600">{option.text || "(Kosong)"}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
