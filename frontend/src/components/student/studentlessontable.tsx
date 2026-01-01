/** @format */

"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Play, CheckCircle, Star, Trophy, Lock, Smile } from "lucide-react";
import { LessonViewer } from "./LessonViewer";
import { AdaptiveQuizPlayer } from "@/components/quiz/AdaptiveQuizPlayer";
import { defaultAdaptiveSettings } from "@/lib/quiz-constants";
import type { QuizSummary, Question } from "@/lib/AdaptiveQuizEngine";
import axios from "@/lib/axios";
import { toast } from "react-toastify";
import { useAuth } from "@/components/auth/useAuth";

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

export type Quiz = {
  id: number;
  level: string;
  name: string;
  description: string;
  icon: string;
  color: string;
};

export interface StudentProgress {
  id?: number;
  user_id: number;
  year: number;
  subject: string;
  topic: string;
  lesson_completed?: boolean;
  lesson_completed_at?: Date | null;
  topic_completed?: boolean;
  created_at?: Date;
  updated_at?: Date;
}

interface StudentLessonTableProps {
  lessons: Lesson[];
  selectedYear?: number;
  selectedSubject?: string;
  onProgressUpdate?: () => void;
  progressRefreshTrigger?: number;
}

export function StudentLessonTable({ lessons, selectedSubject, selectedYear, onProgressUpdate, progressRefreshTrigger }: StudentLessonTableProps) {
  const { user: currentUser, refreshTrigger } = useAuth();
  const [completedLessons, setCompletedLessons] = useState<Set<number>>(new Set());
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [materialProgress, setMaterialProgress] = useState<{ [lessonId: number]: { viewed: number; total: number } }>({});
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<Question[]>([]);
  const [selectedQuizLesson, setSelectedQuizLesson] = useState<Lesson | null>(null);
  const [quizSummary, setQuizSummary] = useState<QuizSummary | null>(null);

  // Fetch progress on mount and when selectedYear changes
  useEffect(() => {
    const fetchProgress = async () => {
      // Only fetch progress if user is authenticated and is a student
      if (!currentUser || currentUser.role !== 'student') {
        return;
      }

      try {
        const response = await axios.get(`/api/progress?t=${Date.now()}`);
        const progress: StudentProgress[] = response.data.progress;

        // Filter progress for the selected year and subject
        const relevantProgress = progress.filter((p: StudentProgress) =>
          p.year === selectedYear && (!selectedSubject || p.subject === selectedSubject)
        );

        // Set completed lessons based on progress
        const completedLessonIds = new Set<number>();
        relevantProgress.forEach((p: StudentProgress) => {
          if (p.lesson_completed) {
            // Find the lesson with matching title (assuming topic is lesson title)
            const lesson = lessons.find(l => l.title === p.topic);
            if (lesson) {
              completedLessonIds.add(lesson.id);
            }
          }
        });

        // Merge with existing completed lessons to preserve local state
        setCompletedLessons(prev => new Set([...prev, ...completedLessonIds]));

        // Fetch material progress for each lesson
        const materialProgressData: { [lessonId: number]: { viewed: number; total: number } } = {};
        for (const lesson of lessons) {
          try {
            const materialResponse = await axios.get(`/api/progress/material-progress?year=${selectedYear}&subject=${selectedSubject}&topic=${lesson.title}`);
            const materialsViewed = materialResponse.data.materialsViewed || [];
            materialProgressData[lesson.id] = {
              viewed: materialsViewed.length,
              total: lesson.materials?.length || 0
            };
          } catch (error) {
            console.error(`Error fetching material progress for lesson ${lesson.id}:`, error);
            materialProgressData[lesson.id] = {
              viewed: 0,
              total: lesson.materials?.length || 0
            };
          }
        }
        setMaterialProgress(materialProgressData);
      } catch (error) {
        console.error('Error fetching progress:', error);
      }
    };

    if (selectedYear && lessons.length > 0 && currentUser && currentUser.role === 'student') {
      fetchProgress();
    }
  }, [selectedYear, selectedSubject, lessons, currentUser, refreshTrigger, progressRefreshTrigger]);

  // Debug logging
  console.log('StudentLessonTable received lessons:', lessons);
  const publishedLessons = (Array.isArray(lessons) ? lessons : []).filter((lesson) => lesson.status === 'diterbitkan');
  console.log('Published lessons:', publishedLessons);

  const handleStartLesson = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    setIsViewerOpen(true);
  };

  const refreshMaterialProgress = async () => {
    const materialProgressData: { [lessonId: number]: { viewed: number; total: number } } = {};
    for (const lesson of lessons) {
      try {
        const materialResponse = await axios.get(`/api/progress/material-progress?year=${selectedYear}&subject=${selectedSubject}&topic=${lesson.title}`);
        const materialsViewed = materialResponse.data.materialsViewed || [];
        materialProgressData[lesson.id] = {
          viewed: materialsViewed.length,
          total: lesson.materials?.length || 0
        };
      } catch (error) {
        console.error(`Error fetching material progress for lesson ${lesson.id}:`, error);
        materialProgressData[lesson.id] = {
          viewed: 0,
          total: lesson.materials?.length || 0
        };
      }
    }
    setMaterialProgress(materialProgressData);
  };

  const handleCompleteLesson = async (lessonId: number) => {
    const lesson = lessons.find(l => l.id === lessonId);
    if (!lesson || !selectedYear || !selectedSubject) return;

    try {
      await axios.post('/api/progress/complete-topic', {
        year: selectedYear,
        subject: selectedSubject,
        topic: lesson.title
      });
      setCompletedLessons(prev => new Set(prev).add(lessonId));
      toast.success('Lesson completed successfully!');

      // Refresh progress in parent component
      if (onProgressUpdate) {
        onProgressUpdate();
      }

      // Refresh material progress to reflect completion
      await refreshMaterialProgress();
    } catch (error) {
      console.error('Error completing lesson:', error);
      toast.error('Failed to complete lesson');
    }
  };

  const handleStartQuiz = async (lesson: Lesson) => {
    if (!selectedYear || !selectedSubject) return;

    try {
      const response = await axios.get(`/api/quizzes/student/${selectedYear}/${selectedSubject}/${lesson.title}`);
      const quiz = response.data.quiz;
      if (quiz && quiz.questions && quiz.questions.length > 0) {
        setQuizQuestions(quiz.questions);
        setSelectedQuizLesson(lesson);
        setShowQuiz(true);
      } else {
        toast.error('No quiz questions available for this topic.');
      }
    } catch (error) {
      console.error('Error fetching quiz:', error);
      toast.error('Failed to load quiz.');
    }
  };

  const handleQuizComplete = (summary: QuizSummary) => {
    setQuizSummary(summary);
    setShowQuiz(false);
  };

  const handleRestartQuiz = () => {
    setQuizSummary(null);
    setShowQuiz(true);
  };

  const getMaterialIcons = (materials: Lesson['materials']) => {
    const icons = [];
    if (materials.filter(m => m.type === "PDF").length > 0) {
      icons.push({ icon: "📄", count: materials.filter(m => m.type === "PDF").length });
    }
    if (materials.filter(m => m.type === "Video").length > 0) {
      icons.push({ icon: "🎞", count: materials.filter(m => m.type === "Video").length });
    }
    if (materials.filter(m => m.type === "Audio").length > 0) {
      icons.push({ icon: "🔊", count: materials.filter(m => m.type === "Audio").length });
    }
    if (materials.filter(m => m.type === "PPT").length > 0) {
      icons.push({ icon: "📊", count: materials.filter(m => m.type === "PPT").length });
    }
    if (materials.filter(m => m.type === "Link").length > 0) {
      icons.push({ icon: "🔗", count: materials.filter(m => m.type === "Link").length });
    }
    return icons;
  };

  return (
    <div className="space-y-4">
      {(Array.isArray(lessons) ? lessons : [])
        .filter((lesson) => lesson.status === 'diterbitkan')
        .sort((a, b) => a.order - b.order)
        .map((lesson) => {
          // Determine completion: lesson is completed if all materials viewed or historically completed
          const materialProgressData = materialProgress[lesson.id];
          const isCompleted = (materialProgressData && materialProgressData.total > 0 && materialProgressData.viewed === materialProgressData.total) || completedLessons.has(lesson.id);
          const materialIcons = getMaterialIcons(lesson.materials || []);

          return (
            <div
              key={lesson.id}
              className={`bg-white border rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden ${
                isCompleted ? 'border-green-300 bg-green-50' : 'border-gray-200'
              }`}
            >
              <div className="p-6">
                <div className="flex items-start gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                        isCompleted
                          ? 'bg-green-500'
                          : 'bg-gradient-to-br from-blue-500 to-purple-600'
                      }`}>
                        {isCompleted ? <CheckCircle className="w-4 h-4" /> : lesson.order}
                      </div>
                      {materialProgress[lesson.id] && materialProgress[lesson.id].total > 0 && (
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {materialProgress[lesson.id].viewed}/{materialProgress[lesson.id].total} bahan dilihat
                        </Badge>
                      </div>
                    )}
                    </div>

                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                      {lesson.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-2">
                      {lesson.description}
                    </p>
                  </div>

                  {/* Materials Visual - Right Side */}
                  <div className="flex-shrink-0 flex flex-col items-center gap-3">
                    <div className="flex flex-row gap-2">
                      {materialIcons.map((item, i) => (
                        <Badge key={i} variant="outline" className="text-sm px-3 py-2 flex items-center justify-center">
                          <span className="text-xl mr-1">{item.icon}</span>
                          <span className="font-medium">{item.count}</span>
                        </Badge>
                      ))}
                    </div>

                    <Button
                      onClick={() => {
                        if (isCompleted) {
                          handleStartLesson(lesson);
                        } else {
                          handleStartLesson(lesson);
                        }
                      }}
                      className={`text-white text-sm px-4 py-2 ${
                        isCompleted
                          ? 'bg-green-500 hover:bg-green-600'
                          : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700'
                      }`}
                    >
                      <Play className="w-4 h-4 mr-2" />
                      {isCompleted ? 'Semak Semula' : 'Mula Belajar'}
                    </Button>
                  </div>
                </div>


              </div>
            </div>
          );
        })}

      {/* Quiz Section */}
      {selectedSubject && (
        <div className="mt-8">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Cabaran Kuiz</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(Array.isArray(lessons) ? lessons : [])
              .filter((lesson) => lesson.status === 'diterbitkan')
              .map((lesson) => {
                // Determine completion: lesson is completed if historically completed OR all current materials viewed
                const materialProgressData = materialProgress[lesson.id];
                const isLessonCompleted = completedLessons.has(lesson.id) ||
                  (materialProgressData && materialProgressData.total > 0 && materialProgressData.viewed === materialProgressData.total);
                const isQuizCompleted = false; // TODO: Implement quiz completion tracking per topic

                return (
                  <div
                    key={`quiz-${lesson.id}`}
                    className={`bg-white border rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden ${
                      isQuizCompleted ? 'border-green-300 bg-green-50' : isLessonCompleted ? 'border-blue-200' : 'border-gray-200 opacity-60'
                    }`}
                  >
                    <div className="p-6">
                      <div className="flex items-center justify-center mb-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg ${
                          isQuizCompleted
                            ? 'bg-green-500'
                            : isLessonCompleted
                            ? 'bg-gradient-to-br from-blue-500 to-purple-600'
                            : 'bg-gray-400'
                        }`}>
                          {isQuizCompleted ? <Trophy className="w-6 h-6" /> : isLessonCompleted ? '🎯' : <Lock className="w-6 h-6" />}
                        </div>
                        {isQuizCompleted && <Star className="w-8 h-8 text-yellow-500" />}
                      </div>

                      <h4 className="text-xl font-bold text-gray-800 mb-2 text-center">
                        Kuiz {lesson.title}
                      </h4>
                      <p className="text-gray-600 text-sm mb-4 text-center">
                        {isQuizCompleted
                          ? "Tahniah! Anda telah menyelesaikan kuiz ini dengan jayanya."
                          : isLessonCompleted
                          ? "Selamat Mencuba."
                          : "Belajar topik Kuiz ini terlebih dahulu."
                        }
                      </p>

                      <Button
                        onClick={() => handleStartQuiz(lesson)}
                        className={`w-full text-white ${
                          isQuizCompleted
                            ? 'bg-green-500 hover:bg-green-600'
                            : isLessonCompleted
                            ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700'
                            : 'bg-gray-400 cursor-not-allowed'
                        }`}
                        disabled={!isLessonCompleted}
                      >
                        {isQuizCompleted ? (
                          <>
                            <Smile className="w-4 h-4 mr-2" />
                            Semak Semula Kuiz
                          </>
                        ) : isLessonCompleted ? (
                          <>
                            <Play className="w-4 h-4 mr-2" />
                            Mulakan Kuiz
                          </>
                        ) : (
                          <>
                            <Lock className="w-4 h-4 mr-2" />
                            Kuiz kunci
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Lesson Viewer Modal */}
      <LessonViewer
        lesson={selectedLesson}
        isOpen={isViewerOpen}
        onClose={() => {
          setIsViewerOpen(false);
          setSelectedLesson(null);
        }}
        onComplete={handleCompleteLesson}
        selectedYear={selectedYear}
      />

      {/* Quiz Player Modal */}
      {showQuiz && selectedQuizLesson && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <AdaptiveQuizPlayer
              settings={defaultAdaptiveSettings}
              questions={quizQuestions}
              onComplete={handleQuizComplete}
              onExit={() => {
                setShowQuiz(false);
                setQuizSummary(null);
              }}
            />
          </div>
        </div>
      )}

      {/* Quiz Summary Modal */}
      {quizSummary && selectedQuizLesson && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Keputusan Kuiz</h2>
              <Card className="p-6 mb-4">
                <div className="text-center">
                  <div className="text-6xl mb-4">
                    {quizSummary.totalScore >= 80 ? '🎉' : quizSummary.totalScore >= 60 ? '👍' : '💪'}
                  </div>
                  <h3 className="text-3xl font-bold text-blue-600 mb-2">
                    {quizSummary.totalScore} Mata
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Anda menjawab {quizSummary.correctAnswers} daripada {quizSummary.totalQuestions} soalan dengan betul
                  </p>
                  <div className="flex justify-center gap-4">
                    <Button onClick={handleRestartQuiz} variant="outline">
                      Cuba Lagi
                    </Button>
                    <Button
                      onClick={() => {
                        setQuizSummary(null);
                        setSelectedQuizLesson(null);
                      }}
                    >
                      Selesai
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
