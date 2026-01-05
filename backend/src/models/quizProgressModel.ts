/** @format */

import pool from "../config/db";

/* -------------------------------------------------------------------
   INTERFACE (matches student_quiz_progress table)
------------------------------------------------------------------- */
export interface QuizProgress {
  id?: number;
  user_id: number;
  quiz_id: number; // FK to quizzes table
  total_attempts?: number;
  best_score?: number;
  last_score?: number;
  passed?: boolean;
  last_activity?: Date;
  created_at?: Date;
}

/* -------------------------------------------------------------------
   CREATE QUIZ PROGRESS ON FIRST ATTEMPT
------------------------------------------------------------------- */
export const createQuizProgress = async (progress: QuizProgress) => {
  const {
    user_id,
    quiz_id,
    total_attempts,
    best_score,
    last_score,
    passed,
  } = progress;

  const result = await pool.query(
    `INSERT INTO student_quiz_progress
      (user_id, quiz_id, total_attempts, best_score, last_score, passed, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, NOW())
     RETURNING *`,
    [
      user_id,
      quiz_id,
      total_attempts || 0,
      best_score || 0,
      last_score || 0,
      passed || false,
    ]
  );

  return result.rows[0];
};

/* -------------------------------------------------------------------
   GET QUIZ PROGRESS FOR 1 QUIZ
------------------------------------------------------------------- */
export const getQuizProgress = async (
  user_id: number,
  quiz_id: number
) => {
  const result = await pool.query(
    `SELECT * FROM student_quiz_progress
     WHERE user_id = $1 AND quiz_id = $2`,
    [user_id, quiz_id]
  );

  return result.rows[0];
};

/* -------------------------------------------------------------------
   RECORD QUIZ ATTEMPT
------------------------------------------------------------------- */
export const recordQuizAttempt = async (
  user_id: number,
  quiz_id: number,
  score: number,
  totalQuestions: number,
  difficulty: string
) => {
  // Get existing progress
  let progress = await getQuizProgress(user_id, quiz_id);

  const isPass = score >= Math.ceil(totalQuestions * 0.75); // 75% threshold for mastery

  // Create new entry if not exist
  if (!progress) {
    return await createQuizProgress({
      user_id,
      quiz_id,
      total_attempts: 1,
      best_score: score,
      last_score: score,
      passed: isPass,
    });
  }

  // Update progress
  const updatedAttempts = progress.total_attempts + 1;
  const updatedBest = Math.max(progress.best_score, score);

  const result = await pool.query(
    `UPDATE student_quiz_progress
     SET total_attempts = $1,
         best_score = $2,
         last_score = $3,
         passed = $4,
         last_activity = NOW()
     WHERE user_id = $5 AND quiz_id = $6
     RETURNING *`,
    [
      updatedAttempts,
      updatedBest,
      score,
      isPass || progress.passed, // once passed, stay passed
      user_id,
      quiz_id,
    ]
  );

  return result.rows[0];
};

/* -------------------------------------------------------------------
   GET ALL QUIZ PROGRESS FOR USER
------------------------------------------------------------------- */
export const getUserQuizProgress = async (user_id: number) => {
  const result = await pool.query(
    `SELECT sqp.*, q.year, q.subject, q.topic
     FROM student_quiz_progress sqp
     JOIN quizzes q ON sqp.quiz_id = q.id
     WHERE sqp.user_id = $1
     ORDER BY q.year, q.subject, q.topic`,
    [user_id]
  );

  return result.rows;
};

/* -------------------------------------------------------------------
   CALCULATE TOPIC QUIZ PASS RATE (score-based)
------------------------------------------------------------------- */
export const getTopicQuizPassStatus = async (
  user_id: number,
  year: number,
  subject: string,
  topic: string
) => {
  // First get quiz_id from year, subject, topic
  const quizQuery = await pool.query(
    `SELECT id FROM quizzes WHERE year = $1 AND subject = $2 AND topic = $3`,
    [year, subject, topic]
  );

  if (quizQuery.rows.length === 0) return false;

  const quiz_id = quizQuery.rows[0].id;
  const progress = await getQuizProgress(user_id, quiz_id);

  if (!progress) return false;

  return progress.passed === true;
};

/* -------------------------------------------------------------------
   CALCULATE SUBJECT QUIZ COMPLETION %
------------------------------------------------------------------- */
export const getSubjectQuizCompletionPercent = async (
  user_id: number,
  year: number,
  subject: string
) => {
  const result = await pool.query(
    `SELECT
        COUNT(*) FILTER (WHERE sqp.passed = TRUE) AS completed,
        COUNT(*) AS total
     FROM student_quiz_progress sqp
     JOIN quizzes q ON sqp.quiz_id = q.id
     WHERE sqp.user_id = $1 AND q.year = $2 AND q.subject = $3`,
    [user_id, year, subject]
  );

  const completed = parseInt(result.rows[0].completed);
  const total = parseInt(result.rows[0].total);

  if (total === 0) return 0;

  return (completed / total) * 100;
};
