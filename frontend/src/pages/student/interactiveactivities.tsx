/** @format */

import { useState } from "react";
import { ActivityCard } from "@/components/student/activitycard";
import {
  SUBJECTS,
  YEARS,
  ACTIVITY_TYPES,
  TRANSLATIONS,
} from "@/lib/activitiesconfig";
import { useAuth } from "@/components/auth/useAuth";

export function ActivitySelector({ onSelectActivity }: { onSelectActivity: (activity: { type: string; subject: string; year: number }) => void }) {
  const { user: currentUser } = useAuth();
  const [selectedSubject, setSelectedSubject] = useState(SUBJECTS[0].nameEn);
  const [selectedYear, setSelectedYear] = useState(1);
  const [step, setStep] = useState("subject");
  const translations = TRANSLATIONS.my; // Default to Malay

  const handleSubjectSelect = (subject: string) => {
    setSelectedSubject(subject);
    setStep("year");
  };

  const handleYearSelect = (year: number) => {
    setSelectedYear(year);
    setStep("activity");
  };

  const handleBack = () => {
    if (step === "year") setStep("subject");
    else if (step === "activity") setStep("year");
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
      <div className="text-center mb-12 mt-8">
        <p className="text-3xl md:text-4xl font-bold text-center mb-3 text-gray-800">
          {translations.letExplore}
        </p>
      </div>

      {/* Step 1: Subject Selection */}
      {step === "subject" && (
        <div className="animate-fade-in">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto mb-8">
            {SUBJECTS.map((subject) => (
              <button
                key={subject.nameEn}
                onClick={() => handleSubjectSelect(subject.nameEn)}
                className="group relative overflow-hidden rounded-3xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl active:scale-95"
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
                      {subject.nameMy}
                    </h3>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Year Selection */}
      {step === "year" && (
        <div className="animate-fade-in">
          <button
            onClick={handleBack}
            className="mb-6 inline-flex items-center gap-2 px-6 py-3 bg-white rounded-full font-semibold text-purple-600 hover:bg-purple-50 shadow-lg transition-all hover:shadow-xl"
          >
            ← {translations.back}
          </button>
          <p className="text-center text-gray-600 mb-10 text-lg">
            {translations.greatChoice}{" "}
            <span className="font-bold text-purple-600">
              {SUBJECTS.find((s) => s.nameEn === selectedSubject)?.nameMy}
            </span>
          </p>

          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-3xl shadow-xl p-8 md:p-12 max-w-2xl mx-auto">
            <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
              {YEARS.map((year) => {
                const userYear = parseInt(currentUser?.tahun_darjah || "1");
                const isAccessible = year <= userYear;

                return (
                  <button
                    key={year}
                    onClick={() => handleYearSelect(year)}
                    disabled={!isAccessible}
                    className={`group relative h-24 rounded-2xl font-bold text-lg transition-all duration-300 transform ${
                      isAccessible
                        ? "hover:scale-110 active:scale-95 cursor-pointer"
                        : "opacity-50 cursor-not-allowed"
                    } overflow-hidden`}
                  >
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${
                        isAccessible
                          ? year <= 2
                            ? "from-green-400 to-emerald-500"
                            : year <= 4
                            ? "from-yellow-400 to-orange-500"
                            : "from-red-400 to-pink-500"
                          : "from-gray-300 to-gray-400"
                      }`}
                    ></div>

                    <div className="relative z-10 flex items-center justify-center h-full flex-col">
                      {isAccessible ? (
                        <>
                          <span className="text-3xl font-black text-white">
                            {year}
                          </span>
                          <span className="text-xs text-white font-semibold opacity-75">
                            {translations.level}
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="text-2xl">🔒</span>
                          <span className="text-xs text-white font-semibold">
                            {year}
                          </span>
                        </>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            <p className="text-center text-gray-600 text-sm mt-6 font-semibold">
              📌 {translations.completeToUnlock}
            </p>
          </div>
        </div>
      )}

      {/* Step 3: Activity Selection */}
      {step === "activity" && (
        <div className="animate-fade-in">
          <button
            onClick={handleBack}
            className="mb-6 inline-flex items-center gap-2 px-6 py-3 bg-white rounded-full font-semibold text-purple-600 hover:bg-purple-50 shadow-lg transition-all hover:shadow-xl"
          >
            ← {translations.back}
          </button>

          <div className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-3xl shadow-lg p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
                  <span className="text-purple-600">
                    {SUBJECTS.find((s) => s.nameEn === selectedSubject)?.nameMy}
                  </span>{" "}
                  -{" "}
                  <span className="text-orange-600">Tahun {selectedYear}</span>
                </h2>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setStep("subject")}
                  className="px-4 py-2 bg-purple-100 text-purple-600 rounded-full font-semibold hover:bg-purple-200 transition-colors"
                >
                  {translations.changeSubject}
                </button>
                <button
                  onClick={() => setStep("year")}
                  className="px-4 py-2 bg-orange-100 text-orange-600 rounded-full font-semibold hover:bg-orange-200 transition-colors"
                >
                  {translations.changeYear}
                </button>
              </div>
            </div>
          </div>

          {/* Activities Grid - Centered large symbols */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ACTIVITY_TYPES.map((activity) => {
              return (
                <ActivityCard
                  key={activity.type}
                  activity={{
                    ...activity,
                    title: activity.titleMy,
                    description: activity.descriptionMy,
                  }}
                  onSelect={() =>
                    onSelectActivity({
                      type: activity.type,
                      subject: selectedSubject,
                      year: selectedYear,
                    })
                  }
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
