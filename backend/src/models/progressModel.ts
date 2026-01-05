/** @format */

import pool from "../config/db";

/* -------------------------------------------------------------------
   INTERFACE (matches new student_progress table)
------------------------------------------------------------------- */
export interface StudentProgress {
  id?: number;
  user_id: number;
  lesson_id: number;
  lesson_material_id?: number;
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
  const { user_id, lesson_id, materials_viewed, lesson_completed } = progress;

  const result = await pool.query(
    `INSERT INTO student_progress
      (user_id, lesson_id, materials_viewed, lesson_completed)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [user_id, lesson_id, JSON.stringify(materials_viewed || []), lesson_completed || false]
  );

  return result.rows[0];
};

/* -------------------------------------------------------------------
   INITIALIZE FULL PROGRESS FOR ALL LESSONS
------------------------------------------------------------------- */
export const initializeProgress = async (
  user_id: number,
  registrationYear: number
) => {
  // Get all lessons for the student's grade level
  const lessonsResult = await pool.query(
    `SELECT id FROM lessons WHERE year_level = $1`,
    [registrationYear.toString()]
  );

  // Create progress records for each lesson
  for (const lesson of lessonsResult.rows) {
    await createProgress({
      user_id,
      lesson_id: lesson.id,
      lesson_completed: false,
    });
  }
};

/* -------------------------------------------------------------------
   GET ALL PROGRESS FOR USER
------------------------------------------------------------------- */
export const getUserProgress = async (user_id: number) => {
  const result = await pool.query(
    `SELECT sp.*, l.subject, l.title, l.year_level
     FROM student_progress sp
     JOIN lessons l ON sp.lesson_id = l.id
     WHERE sp.user_id = $1
     ORDER BY l.year_level, l.subject, l.lesson_order`,
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
    `SELECT sp.*, l.title, l.year_level
     FROM student_progress sp
     JOIN lessons l ON sp.lesson_id = l.id
     WHERE sp.user_id = $1 AND l.year_level = $2 AND l.subject = $3
     ORDER BY l.lesson_order`,
    [user_id, `Year ${year}`, subject]
  );

  return result.rows;
};

/* -------------------------------------------------------------------
   MARK LESSON COMPLETED
------------------------------------------------------------------- */
export const completeLesson = async (
  user_id: number,
  lesson_id: number
) => {
  const result = await pool.query(
    `UPDATE student_progress
     SET lesson_completed = TRUE,
         lesson_completed_at = NOW(),
         updated_at = NOW()
     WHERE user_id = $1 AND lesson_id = $2
     RETURNING *`,
    [user_id, lesson_id]
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
        COUNT(*) FILTER (WHERE sp.lesson_completed = TRUE) AS completed_lessons,
        COUNT(*) AS total_lessons
     FROM student_progress sp
     JOIN lessons l ON sp.lesson_id = l.id
     WHERE sp.user_id = $1 AND l.year_level = $2`,
    [user_id, year.toString()]
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
