/** @format */

"use client";

import { useState, useEffect } from "react";
import { ManageQuiz } from "@/components/quiz/ManageQuiz";
import { QuizTable } from "@/components/admin/quiztable";
import type { QuizData, Question } from "@/components/admin/quiztable";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { defaultAdaptiveSettings } from "@/lib/quiz-constants";
import axios from "@/lib/axios";
import { AxiosError } from "axios";

interface BackendQuiz {
  id: number;
  year: number;
  subject: string;
  topic: string;
  status: string;
  created_at: string;
}

interface BackendQuestion {
  id: number;
  questionText: string;
  options: string[] | string;
  correctAnswers: string[] | string;
  difficulty: string;
  hints: string[] | string | null;
}

export default function ManageQuizPage() {
  const [quizzes, setQuizzes] = useState<QuizData[]>([]);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<QuizData | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);

  // Fetch quizzes from API on component mount
  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const response = await axios.get('/admin/quizzes');
        // Transform backend data to match QuizData interface
        const transformedQuizzes: QuizData[] = (response.data.quizzes || []).map((quiz: BackendQuiz & { question_count?: number }) => ({
          id: quiz.id,
          year: quiz.year,
          subject: quiz.subject,
          topic: quiz.topic,
          quizType: 'mcq', // Default, can be updated based on actual data
          questions: [], // Will be populated when needed
          questionCount: quiz.question_count,
          adaptiveSettings: defaultAdaptiveSettings,
          status: quiz.status as 'draf' | 'diterbitkan' | 'diarkibkan'
        }));
        setQuizzes(transformedQuizzes);
      } catch (error) {
        console.error('Error fetching quizzes:', error);
      }
    };

    fetchQuizzes();
  }, []);

  const handleSaveQuiz = async (quizData: QuizData) => {
    try {
      // Call backend API to create quiz
      await axios.post('/admin/quizzes', {
        year: quizData.year,
        subject: quizData.subject,
        topic: quizData.topic,
        quizType: quizData.quizType,
        questions: quizData.questions
      });

      // Refresh the quizzes list to get updated question counts
      const refreshResponse = await axios.get('/admin/quizzes');
      const transformedQuizzes: QuizData[] = (refreshResponse.data.quizzes || []).map((quiz: BackendQuiz & { question_count?: number }) => ({
        id: quiz.id,
        year: quiz.year,
        subject: quiz.subject,
        topic: quiz.topic,
        quizType: 'mcq', // Default, can be updated based on actual data
        questions: [], // Will be populated when needed
        questionCount: quiz.question_count,
        adaptiveSettings: defaultAdaptiveSettings,
        status: quiz.status as 'draf' | 'diterbitkan' | 'diarkibkan'
      }));
      setQuizzes(transformedQuizzes);

      setShowCreateForm(false);
    } catch (error: unknown) {
      console.error('Error creating quiz:', error);

      // Handle 409 error (quiz already exists)
      if (error instanceof AxiosError && error.response?.status === 409) {
        alert('Kuiz untuk topik ini sudah wujud. Sila cari kuiz tersebut dalam jadual dan edit untuk menambah soalan baharu.');
        return;
      }

      // Other error - re-throw to let ManageQuiz handle it
      throw error;
    }
  };

  const handleCancel = () => {
    setShowCreateForm(false);
  };

  const handleDeleteQuiz = async (id: number) => {
    if (!confirm('Are you sure you want to delete this quiz? This action cannot be undone.')) {
      return;
    }

    try {
      await axios.delete(`/admin/quizzes/${id}`);
      // Remove from local state
      setQuizzes(quizzes.filter(quiz => quiz.id !== id));
    } catch (error) {
      console.error('Error deleting quiz:', error);
      alert('Failed to delete quiz. Please try again.');
    }
  };

  const handleEditQuiz = async (quiz: QuizData, index: number) => {
    try {
      // Fetch full quiz data including questions
      const response = await axios.get(`/admin/quizzes/${quiz.id}`);
      const fullQuiz = response.data.quiz;

      // Transform backend data to match QuizData interface
      const transformedQuestions: Question[] = (fullQuiz.questions || []).map((q: BackendQuestion) => ({
        id: q.id,
        questionText: q.questionText || '',
        options: q.options && q.options.length > 0 ? q.options : ['', '', '', ''],
        correctAnswers: q.correctAnswers || [],
        answerType: (q.correctAnswers || []).length > 1 ? 'multiple' : 'single',
        sentenceWithBlanks: '',
        answerPool: [],
        blankMapping: [],
        instruction: '',
        items: [],
        targets: [],
        mapping: [],
        difficulty: q.difficulty || 'medium',
        hints: q.hints || []
      }));

      const transformedQuiz: QuizData = {
        id: fullQuiz.id,
        year: fullQuiz.year,
        subject: fullQuiz.subject,
        topic: fullQuiz.topic,
        quizType: fullQuiz.quiz_type || 'mcq',
        questions: transformedQuestions,
        questionCount: transformedQuestions.length,
        adaptiveSettings: defaultAdaptiveSettings
      };

      setEditingQuiz(transformedQuiz);
      setEditingIndex(index);
      setShowEditForm(true);
    } catch (error) {
      console.error('Error fetching quiz for editing:', error);
      alert('Failed to load quiz for editing. Please try again.');
    }
  };

  const handleUpdateQuiz = async (quizData: QuizData) => {
    try {
      if (editingIndex !== null && quizzes[editingIndex].id) {
        // Call backend API to update quiz
        await axios.put(`/admin/quizzes/${quizzes[editingIndex].id}`, {
          year: quizData.year,
          subject: quizData.subject,
          topic: quizData.topic,
          quizType: quizData.quizType,
          status: 'draft', // Default status
          questions: quizData.questions
        });

        // Update local state
        const updatedQuizzes = [...quizzes];
        updatedQuizzes[editingIndex] = quizData;
        setQuizzes(updatedQuizzes);
      }
      setShowEditForm(false);
      setEditingQuiz(null);
      setEditingIndex(null);
    } catch (error) {
      console.error('Error updating quiz:', error);
      throw error; // Re-throw to let ManageQuiz handle it
    }
  };

  const handleCancelEdit = () => {
    setShowEditForm(false);
    setEditingQuiz(null);
    setEditingIndex(null);
  };

  // Get unique years and subjects for filter options
  const availableYears = Array.from(new Set(quizzes.map(q => q.year).filter((year): year is number => year !== null))).sort((a, b) => b - a);
  const availableSubjects = Array.from(new Set(quizzes.map(q => q.subject))).sort();

  const handleStatusChange = async (id: number, status: 'draf' | 'diterbitkan' | 'diarkibkan') => {
    try {
      await axios.put(`/admin/quizzes/${id}`, { status });

      // Update local state
      setQuizzes(quizzes.map(quiz =>
        quiz.id === id ? { ...quiz, status } : quiz
      ));
    } catch (error) {
      console.error('Error updating quiz status:', error);
      alert('Failed to update quiz status. Please try again.');
    }
  };

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
                : "Tiada kuiz yang sepadan."
              }
            </p>
          </div>
        ) : (
          <QuizTable
            quizzes={filteredQuizzes}
            onDeleteQuiz={handleDeleteQuiz}
            onEditQuiz={handleEditQuiz}
            onStatusChange={handleStatusChange}
          />
        )}
      </div>
    </div>
  );
}
