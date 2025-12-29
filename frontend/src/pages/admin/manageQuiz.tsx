/** @format */

"use client";

import { useState } from "react";
import { ManageQuiz } from "@/components/quiz/ManageQuiz";
import { QuizTable } from "@/components/admin/quiztable";
import type { QuizData } from "@/components/admin/quiztable";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { defaultAdaptiveSettings } from "@/lib/quiz-constants";

// Dummy quiz data for demonstration
const dummyQuizzes: QuizData[] = [
  {
    year: 1,
    subject: "Matematik",
    topic: "Penambahan Asas",
    quizType: "mcq",
    bloomLevel: "Remember",
    questions: [
      {
        id: 1,
        questionText: "Berapakah 2 + 3?",
        options: ["4", "5", "6", "7"],
        correctAnswers: ["Answer2"],
        answerType: "single",
        sentenceWithBlanks: "",
        answerPool: [],
        blankMapping: [],
        instruction: "",
        items: [],
        targets: [],
        mapping: []
      }
    ],
    adaptiveSettings: defaultAdaptiveSettings
  },
  {
    year: 2,
    subject: "Bahasa Melayu",
    topic: "Tatabahasa",
    quizType: "mcq",
    bloomLevel: "Remember",
    questions: [
      {
        id: 2,
        questionText: "Apakah kata nama?",
        options: ["Pergi", "Rumah", "Besar", "Cantik"],
        correctAnswers: ["Answer2"],
        answerType: "single",
        sentenceWithBlanks: "",
        answerPool: [],
        blankMapping: [],
        instruction: "",
        items: [],
        targets: [],
        mapping: []
      }
    ],
    adaptiveSettings: defaultAdaptiveSettings
  },
  {
    year: 3,
    subject: "Sains",
    topic: "Fizik",
    quizType: "mcq",
    bloomLevel: "Application",
    questions: [
      {
        id: 3,
        questionText: "Apakah Hukum Gerakan Newton yang Pertama?",
        options: ["Objek yang berehat kekal berehat", "Daya sama dengan jisim darab pecutan", "Untuk setiap tindakan terdapat tindak balas yang sama", "Tenaga tidak boleh dicipta atau dimusnahkan"],
        correctAnswers: ["Answer1"],
        answerType: "single",
        sentenceWithBlanks: "",
        answerPool: [],
        blankMapping: [],
        instruction: "",
        items: [],
        targets: [],
        mapping: []
      }
    ],
    adaptiveSettings: defaultAdaptiveSettings
  },
  {
    year: 4,
    subject: "Matematik",
    topic: "Aljabar",
    quizType: "mcq",
    bloomLevel: "Understanding",
    questions: [
      {
        id: 4,
        questionText: "Berapakah nilai x dalam persamaan 2x + 3 = 7?",
        options: ["x = 2", "x = 3", "x = 4", "x = 5"],
        correctAnswers: ["Answer1"],
        answerType: "single",
        sentenceWithBlanks: "",
        answerPool: [],
        blankMapping: [],
        instruction: "",
        items: [],
        targets: [],
        mapping: []
      },
      {
        id: 5,
        questionText: "Yang manakah merupakan persamaan kuadratik?",
        options: ["x + 2 = 0", "x² + 2x + 1 = 0", "2x + 3y = 5", "x³ + 1 = 0"],
        correctAnswers: ["Answer2", "Answer4"],
        answerType: "multiple",
        sentenceWithBlanks: "",
        answerPool: [],
        blankMapping: [],
        instruction: "",
        items: [],
        targets: [],
        mapping: []
      }
    ],
    adaptiveSettings: defaultAdaptiveSettings
  },
  {
    year: 5,
    subject: "Mathematics",
    topic: "Calculus",
    quizType: "mcq",
    bloomLevel: "Analyze",
    questions: [
      {
        id: 6,
        questionText: "What is the derivative of x²?",
        options: ["x", "2x", "x²", "2"],
        correctAnswers: ["Answer2"],
        answerType: "single",
        sentenceWithBlanks: "",
        answerPool: [],
        blankMapping: [],
        instruction: "",
        items: [],
        targets: [],
        mapping: []
      }
    ],
    adaptiveSettings: defaultAdaptiveSettings
  },
  {
    year: 6,
    subject: "Science",
    topic: "Advanced Physics",
    quizType: "mcq",
    bloomLevel: "Create",
    questions: [
      {
        id: 7,
        questionText: "Design an experiment to measure gravitational acceleration.",
        options: ["Use a pendulum", "Drop objects from different heights", "Use a spring scale", "All of the above"],
        correctAnswers: ["Answer4"],
        answerType: "single",
        sentenceWithBlanks: "",
        answerPool: [],
        blankMapping: [],
        instruction: "",
        items: [],
        targets: [],
        mapping: []
      }
    ],
    adaptiveSettings: defaultAdaptiveSettings
  }
];

export default function ManageQuizPage() {
  const [quizzes, setQuizzes] = useState<QuizData[]>(dummyQuizzes);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<QuizData | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);

  const handleSaveQuiz = (quizData: QuizData) => {
    console.log('Quiz saved:', quizData);
    // Add to quizzes list
    setQuizzes([...quizzes, quizData]);
    setShowCreateForm(false);
  };

  const handleCancel = () => {
    setShowCreateForm(false);
  };

  const handleDeleteQuiz = (index: number) => {
    // Placeholder for delete functionality
    console.log('Delete quiz at index:', index);
    setQuizzes(quizzes.filter((_, i) => i !== index));
  };

  const handleEditQuiz = (quiz: QuizData, index: number) => {
    setEditingQuiz(quiz);
    setEditingIndex(index);
    setShowEditForm(true);
  };

  const handleUpdateQuiz = (quizData: QuizData) => {
    console.log('Quiz updated:', quizData);
    if (editingIndex !== null) {
      const updatedQuizzes = [...quizzes];
      updatedQuizzes[editingIndex] = quizData;
      setQuizzes(updatedQuizzes);
    }
    setShowEditForm(false);
    setEditingQuiz(null);
    setEditingIndex(null);
  };

  const handleCancelEdit = () => {
    setShowEditForm(false);
    setEditingQuiz(null);
    setEditingIndex(null);
  };

  // Get unique years and subjects for filter options
  const availableYears = Array.from(new Set(quizzes.map(q => q.year).filter((year): year is number => year !== null))).sort((a, b) => b - a);
  const availableSubjects = Array.from(new Set(quizzes.map(q => q.subject))).sort();

  // Filter quizzes based on selected filters
  const filteredQuizzes = quizzes.filter(quiz => {
    const yearMatch = selectedYear === null || quiz.year === selectedYear;
    const subjectMatch = selectedSubject === '' || quiz.subject === selectedSubject;
    return yearMatch && subjectMatch;
  });

  if (showCreateForm) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <Button onClick={handleCancel} variant="outline">
              ← Kembali ke Pengurusan Kuiz
            </Button>
          </div>
          <ManageQuiz onSave={handleSaveQuiz} onCancel={handleCancel} />
        </div>
      </div>
    );
  }

  if (showEditForm && editingQuiz) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <Button onClick={handleCancelEdit} variant="outline">
              ← Kembali ke Pengurusan Kuiz
            </Button>
          </div>
          <ManageQuiz
            onSave={handleUpdateQuiz}
            onCancel={handleCancelEdit}
            initialQuiz={editingQuiz}
            isEditing={true}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Existing Quizzes */}
      <div className="max-w-7xl mx-auto px-6 pb-8">
        <div className="bg-primary text-primary-foreground p-4 rounded-t-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <h2 className="text-lg font-semibold">
                Pengurusan Kuiz
              </h2>
              <p className="text-sm text-primary-foreground/80">
                Urus kuiz dan kandungan
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Select value={selectedYear?.toString() ?? 'All'} onValueChange={(value) => setSelectedYear(value === 'All' ? null : Number(value))}>
              <SelectTrigger className="w-[120px] bg-white/10 border-white/20 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">Semua Tahun</SelectItem>
                {availableYears.map(year => (
                  <SelectItem key={year!.toString()} value={year!.toString()}>
                    Tahun {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedSubject || 'All'} onValueChange={(value) => setSelectedSubject(value === 'All' ? '' : value)}>
              <SelectTrigger className="w-[180px] bg-white/10 border-white/20 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">Semua Subjek</SelectItem>
                {availableSubjects.map(subject => (
                  <SelectItem key={subject} value={subject}>
                    {subject}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button size="sm" className="bg-white text-primary" onClick={() => setShowCreateForm(true)}>
              + Tambah Kuiz
            </Button>
          </div>
        </div>

        {filteredQuizzes.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-b-lg shadow-sm border border-t-0">
            <p className="text-gray-600">
              {quizzes.length === 0
                ? "Tiada kuiz yang dibuat lagi. Gunakan butang di atas untuk membuat kuiz pertama anda."
                : "Tiada kuiz yang sepadan dengan penapis yang dipilih."
              }
            </p>
          </div>
        ) : (
          <QuizTable
            quizzes={filteredQuizzes}
            onDeleteQuiz={handleDeleteQuiz}
            onEditQuiz={handleEditQuiz}
          />
        )}
      </div>
    </div>
  );
}
