/** @format */

"use client";

import { useState, useEffect } from "react";
import { StudentLessonTable } from "@/components/student/studentlessontable";
import type { Lesson } from "@/components/student/studentlessontable";
import { useAuth } from "@/components/auth/useAuth";
import axios from "@/lib/axios";
import { TestAdaptiveHints } from "@/components/quiz/TestAdaptiveHints";

const kafaSubjects = [
  {
    id: 1,
    name: "Al-Quran",
    icon: "📖",
    color: "from-amber-400 to-orange-500",
  },
  {
    id: 2,
    name: "Akidah",
    icon: "🕌",
    color: "from-sky-400 to-blue-600",
  },
  {
    id: 3,
    name: "Ibadah",
    icon: "🤲",
    color: "from-emerald-400 to-teal-600",
  },
  {
    id: 4,
    name: "Sirah",
    icon: "📜",
    color: "from-violet-400 to-purple-600",
  },
  {
    id: 5,
    name: "Adab",
    icon: "🌟",
    color: "from-rose-400 to-pink-600",
  },
  {
    id: 6,
    name: "Bahasa Arab",
    icon: "🔤",
    color: "from-yellow-400 to-amber-600",
  },
  {
    id: 7,
    name: "Jawi dan Khat",
    icon: "✍️",
    color: "from-indigo-400 to-indigo-600",
  },
  {
    id: 8,
    name: "Tahfiz al-Quran",
    icon: "🎵",
    color: "from-lime-400 to-green-500",
  },
  {
    id: 9,
    name: "Test Kuiz Adaptif",
    icon: "🧠",
    color: "from-red-400 to-pink-500",
  },
];

const yearLevels = [
  {
    year: 1,
    name: "Tahun 1",
    icon: "1️⃣",
    color: "from-green-400 to-emerald-500",
  },
  { year: 2, name: "Tahun 2", icon: "2️⃣", color: "from-blue-400 to-cyan-500" },
  {
    year: 3,
    name: "Tahun 3",
    icon: "3️⃣",
    color: "from-yellow-400 to-orange-500",
  },
  {
    year: 4,
    name: "Tahun 4",
    icon: "4️⃣",
    color: "from-purple-400 to-violet-500",
  },
  { year: 5, name: "Tahun 5", icon: "5️⃣", color: "from-pink-400 to-rose-500" },
  {
    year: 6,
    name: "Tahun 6",
    icon: "6️⃣",
    color: "from-indigo-400 to-blue-500",
  },
];



interface YearLevel {
  year: number;
  name: string;
  icon: string;
  color: string;
}

interface Subject {
  id: number;
  name: string;
  icon: string;
  color: string;
}

interface ProgressItem {
  year: number;
  subject: string;
  topic_completed: boolean;
  topic_progress?: number;
}

export function LearningKafa() {
  const { user: currentUser } = useAuth();
  const [selectedYear, setSelectedYear] = useState<YearLevel | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [progress, setProgress] = useState<ProgressItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const response = await axios.get(`/progress?t=${Date.now()}`);
        setProgress(response.data.progress);

        // If no progress exists, initialize it
        if (response.data.progress.length === 0) {
          const registrationYear = parseInt(currentUser?.tahun_darjah || "1");
          await axios.post('/progress/initialize', { registrationYear });
          // Fetch progress again after initialization
          const updatedResponse = await axios.get(`/progress?t=${Date.now()}`);
          setProgress(updatedResponse.data.progress);
        }
      } catch (error) {
        console.error('Error fetching progress:', error);
      }
    };
    if (currentUser) fetchProgress();
  }, [currentUser]);

  const fetchLessons = async () => {
    if (selectedYear && selectedSubject) {
      setLoading(true);
      try {
        const response = await axios.get('/lessons', {
          params: {
            subject: selectedSubject.name,
            year_level: `Year ${selectedYear.year}`
          }
        });
        console.log('API Response:', response.data);
        console.log('Selected subject:', selectedSubject.name);
        console.log('Selected year level:', `Year ${selectedYear.year}`);
        setLessons(response.data.data || []);
      } catch (error) {
        console.error('Error fetching lessons:', error);
        setLessons([]);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchLessons();
  }, [selectedYear, selectedSubject]);

  const calculateYearProgress = (year: number) => {
    const yearProgress = progress.filter((p: ProgressItem) => p.year === year);
    const totalProgress = yearProgress.reduce((sum, p) => sum + (p.topic_progress || 0), 0);
    const total = yearProgress.length;
    return total > 0 ? Math.round((totalProgress / (total * 100)) * 100) : 0;
  };

  const calculateSubjectProgress = (year: number, subject: string) => {
    const subjectProgress = progress.filter((p: ProgressItem) => p.year === year && p.subject === subject);
    const totalProgress = subjectProgress.reduce((sum, p) => sum + (p.topic_progress || 0), 0);
    const total = subjectProgress.length;
    return total > 0 ? Math.round((totalProgress / (total * 100)) * 100) : 0;
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Welcome Header */}
      <div className="text-center mb-10 mt-8">
        <p className="text-3xl md:text-4xl font-bold text-center mb-1 text-gray-800">
          Mari Kita Jelajahi dan Belajar Sambil Bermain!
        </p>
      </div>

      {/* Step 1: Choose Year First */}
      {!selectedYear ? (
        <div className="animate-fade-in">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto mb-8">
            {yearLevels.map((year) => {
              const userYear = parseInt(currentUser?.tahun_darjah || "1");
              const isAccessible = year.year <= userYear;
              const yearProgress = calculateYearProgress(year.year);

              return (
                <button
                  key={year.year}
                  onClick={() => isAccessible && setSelectedYear(year)}
                  disabled={!isAccessible}
                  className={`group relative overflow-hidden rounded-3xl transition-all duration-300 transform ${
                    isAccessible
                      ? "hover:scale-105 hover:shadow-2xl active:scale-95 cursor-pointer"
                      : "opacity-50 cursor-not-allowed"
                  }`}
                >
                  <div
                    className={`bg-gradient-to-br ${
                      isAccessible ? year.color : "from-gray-300 to-gray-400"
                    } p-8 min-h-48 flex flex-col items-center justify-center rounded-3xl relative overflow-hidden`}
                  >
                    {/* Decorative circles */}
                    <div className="absolute top-0 right-0 w-24 h-24 bg-white opacity-10 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-300"></div>
                    <div className="absolute bottom-0 left-0 w-16 h-16 bg-white opacity-10 rounded-full -ml-8 -mb-8 group-hover:scale-150 transition-transform duration-300"></div>

                    <div className="relative z-10 text-center">
                      <div className="text-7xl mb-4 transform group-hover:scale-125 transition-transform duration-300">
                        {isAccessible ? year.icon : "🔒"}
                      </div>
                      <h3 className="text-2xl font-bold text-white text-balance">
                        {isAccessible ? year.name : year.year}
                      </h3>
                      {isAccessible && (
                        <p className="text-sm text-white font-semibold opacity-90 mt-2">
                          {yearProgress}% Selesai
                        </p>
                      )}
                      {!isAccessible && (
                        <p className="text-xs text-white font-semibold opacity-75 mt-2">
                          kunci
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <p className="text-center text-gray-600 text-sm mt-6 font-semibold">
            📌 Selesaikan semua subjek dalam tahun semasa untuk membuka tahun
            seterusnya
          </p>
        </div>
      ) : !selectedSubject ? (
        /* Step 2: Choose Subject */
        <div className="animate-fade-in">
          <div className="flex justify-center mt-2 mb-4">
            <button
              onClick={() => setSelectedYear(null)} className="px-4 py-2 bg-purple-100 text-purple-600 rounded-full font-semibold hover:bg-purple-200 transition-colors"
            >Ubah Tahun
            </button>
          </div>
          <p className="text-center text-gray-600 mb-10 text-lg">
            Pilihan bagus! Anda memilih{" "}
            <span className="font-bold text-purple-600">
              {selectedYear.name}
            </span>
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto mb-8">
            {kafaSubjects.map((subject) => {
              const subjectProgress = calculateSubjectProgress(selectedYear.year, subject.name);
              return (
                <button
                  key={subject.id}
                  onClick={() => setSelectedSubject(subject)}
                  className="group relative overflow-hidden rounded-3xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl active:scale-95 cursor-pointer"
                >
                  <div
                    className={`bg-gradient-to-br ${subject.color} p-8 min-h-48 flex flex-col items-center justify-center rounded-3xl relative overflow-hidden`}
                  >
                    {/* Decorative circles */}
                    <div className="absolute top-0 right-0 w-24 h-24 bg-white opacity-10 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-300"></div>
                    <div className="absolute bottom-0 left-0 w-16 h-16 bg-white opacity-10 rounded-full -ml-8 -mb-8 group-hover:scale-150 transition-transform duration-300"></div>

                    <div className="relative z-10 text-center">
                      <div className="text-7xl mb-4 transform group-hover:scale-125 transition-transform duration-300">
                        {subject.icon}
                      </div>
                      <h3 className="text-2xl font-bold text-white text-balance">
                        {subject.name}
                      </h3>
                      <p className="text-sm text-white font-semibold opacity-90 mt-2">
                        {subjectProgress}% Selesai
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        /* Step 3: Show Lesson Table */
        <div className="animate-fade-in">
          <div className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-3xl shadow-lg p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <p className="text-gray-600 text-sm font-semibold uppercase tracking-wider">
                  Laluan Pembelajaran Anda
                </p>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
                  <span className="text-purple-600">
                    {selectedSubject.name}
                  </span>{" "}
                  - <span className="text-orange-600">{selectedYear.name}</span>
                </h2>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedYear(null)}
                  className="px-4 py-2 bg-purple-100 text-purple-600 rounded-full font-semibold hover:bg-purple-200 transition-colors"
                >
                  Ubah Tahun
                </button>
                <button
                  onClick={() => setSelectedSubject(null)}
                  className="px-4 py-2 bg-orange-100 text-orange-600 rounded-full font-semibold hover:bg-orange-200 transition-colors"
                >
                  Ubah Subjek
                </button>
              </div>
            </div>
          </div>

          {/* Student Lesson Table Component or Test Adaptive Quiz */}
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
              <span className="ml-3 text-gray-600">Memuatkan pelajaran...</span>
            </div>
          ) : selectedSubject.name === "Test Kuiz Adaptif" ? (
            <TestAdaptiveHints />
          ) : (
            <StudentLessonTable
              lessons={lessons}
              selectedYear={selectedYear.year}
              selectedSubject={selectedSubject.name}
              onProgressUpdate={() => {
                // Refresh progress data with cache busting
                const fetchUpdatedProgress = async () => {
                  try {
                    const response = await axios.get(`/progress?t=${Date.now()}`);
                    setProgress(response.data.progress);
                  } catch (error) {
                    console.error('Error refreshing progress:', error);
                  }
                };
                fetchUpdatedProgress();
              }}
            />
          )}
        </div>
      )}
    </div>
  );
}
