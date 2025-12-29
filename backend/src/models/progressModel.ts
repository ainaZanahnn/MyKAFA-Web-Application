/** @format */

import pool from "../config/db";

/* -------------------------------------------------------------------
   INTERFACE (matches new student_progress table)
------------------------------------------------------------------- */
export interface StudentProgress {
  id?: number;
  user_id: number;
  year: number;
  subject: string;
  topic: string;
  lesson_completed?: boolean;
  lesson_completed_at?: Date | null;
  materials_viewed?: number[];
  created_at?: Date;
  updated_at?: Date;
}

/* -------------------------------------------------------------------
   CREATE PROGRESS RECORD (LESSON ONLY)
------------------------------------------------------------------- */
export const createProgress = async (progress: StudentProgress) => {
  const { user_id, year, subject, topic, lesson_completed } = progress;

  const result = await pool.query(
    `INSERT INTO student_progress
      (user_id, year, subject, topic, lesson_completed)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [user_id, year, subject, topic, lesson_completed || false]
  );

  return result.rows[0];
};

/* -------------------------------------------------------------------
   INITIALIZE FULL PROGRESS FOR YEARS 1–6
------------------------------------------------------------------- */
export const initializeProgress = async (
  user_id: number,
  registrationYear: number,
  totalYears = 6
) => {
  const subjects = [
    { name: "Quran", topics: ["Introduction", "Reading", "Memorization"] },
    { name: "Aqidah", topics: ["Beliefs", "Pillars", "Practices"] },
    { name: "Ibadah", topics: ["Prayer", "Fasting", "Zakat", "Hajj"] },
    {
      name: "Sirah",
      topics: ["Early Life", "Prophethood", "Migration", "Battles"],
    },
    { name: "Adab", topics: ["Ethics", "Manners", "Social Behavior"] },
    {
      name: "Arabic Language",
      topics: ["Grammar", "Vocabulary", "Conversation"],
    },
    { name: "Jawi and Khat", topics: ["Writing", "Calligraphy", "Scripts"] },
    {
      name: "Tahfiz Al-Quran",
      topics: ["Memorization", "Recitation", "Understanding"],
    },
  ];

  // Create progress for all years (allows review mode)
  for (let year = 1; year <= totalYears; year++) {
    for (const subject of subjects) {
      for (const topic of subject.topics) {
        await createProgress({
          user_id,
          year,
          subject: subject.name,
          topic,
          lesson_completed: false,
        });
      }
    }
  }
};

/* -------------------------------------------------------------------
   GET ALL PROGRESS FOR USER
------------------------------------------------------------------- */
export const getUserProgress = async (user_id: number) => {
  const result = await pool.query(
    `SELECT * FROM student_progress
     WHERE user_id = $1
     ORDER BY year, subject, topic`,
    [user_id]
  );

  return result.rows;
};

/* -------------------------------------------------------------------
   GET PROGRESS BY YEAR + SUBJECT
------------------------------------------------------------------- */
export const getProgressByYearSubject = async (
  user_id: number,
  year: number,
  subject: string
) => {
  const result = await pool.query(
    `SELECT * FROM student_progress
     WHERE user_id = $1 AND year = $2 AND subject = $3
     ORDER BY topic`,
    [user_id, year, subject]
  );

  return result.rows;
};

/* -------------------------------------------------------------------
   MARK LESSON COMPLETED
------------------------------------------------------------------- */
export const completeLesson = async (
  user_id: number,
  year: number,
  subject: string,
  topic: string
) => {
  const result = await pool.query(
    `UPDATE student_progress
     SET lesson_completed = TRUE,
         lesson_completed_at = NOW(),
         updated_at = NOW()
     WHERE user_id = $1 AND year = $2 AND subject = $3 AND topic = $4
     RETURNING *`,
    [user_id, year, subject, topic]
  );

  return result.rows[0];
};

/* -------------------------------------------------------------------
   CHECK IF YEAR COMPLETED (LESSON ONLY — QUIZ will be checked separately)
------------------------------------------------------------------- */
export const calculateLessonCompletionPercentage = async (
  user_id: number,
  year: number
) => {
  const result = await pool.query(
    `SELECT 
        COUNT(*) FILTER (WHERE lesson_completed = TRUE) AS completed_lessons,
        COUNT(*) AS total_lessons
     FROM student_progress
     WHERE user_id = $1 AND year = $2`,
    [user_id, year]
  );

  const completed = parseInt(result.rows[0].completed_lessons);
  const total = parseInt(result.rows[0].total_lessons);

  if (total === 0) return 0;

  return (completed / total) * 100;
};

/* -------------------------------------------------------------------
   GET CURRENT PROGRESS YEAR (LESSON ONLY — combined logic is in progressModelMerged)
------------------------------------------------------------------- */
export const getCurrentProgressYear = async (
  user_id: number,
  tahun_darjah: number
) => {
  const percent = await calculateLessonCompletionPercentage(
    user_id,
    tahun_darjah
  );

  // Must check quiz progress too in merged model
  if (percent >= 90) return tahun_darjah + 1;

  return tahun_darjah;
};
