/** @format */

import pool from "../config/db";

/* -------------------------------------------------------------------
   INTERFACE (matches student_quiz_progress table)
------------------------------------------------------------------- */
export interface QuizProgress {
  id?: number;
  user_id: number;
  year: number;
  subject: string;
  topic: string;
  difficulty_level?: string;
  total_attempts?: number;
  correct_attempts?: number;
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
    year,
    subject,
    topic,
    difficulty_level,
    total_attempts,
    correct_attempts,
    best_score,
    last_score,
    passed,
  } = progress;

  const result = await pool.query(
    `INSERT INTO student_quiz_progress
      (user_id, year, subject, topic, difficulty_level,
       total_attempts, correct_attempts, best_score, last_score, passed)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     RETURNING *`,
    [
      user_id,
      year,
      subject,
      topic,
      difficulty_level || "normal",
      total_attempts || 0,
      correct_attempts || 0,
      best_score || 0,
      last_score || 0,
      passed || false,
    ]
  );

  return result.rows[0];
};

/* -------------------------------------------------------------------
   GET QUIZ PROGRESS FOR 1 TOPIC
------------------------------------------------------------------- */
export const getQuizProgress = async (
  user_id: number,
  year: number,
  subject: string,
  topic: string
) => {
  const result = await pool.query(
    `SELECT * FROM student_quiz_progress
     WHERE user_id = $1 AND year = $2 AND subject = $3 AND topic = $4`,
    [user_id, year, subject, topic]
  );

  return result.rows[0];
};

/* -------------------------------------------------------------------
   RECORD QUIZ ATTEMPT
------------------------------------------------------------------- */
export const recordQuizAttempt = async (
  user_id: number,
  year: number,
  subject: string,
  topic: string,
  score: number,
  totalQuestions: number,
  difficulty: string
) => {
  // Get existing progress
  let progress = await getQuizProgress(user_id, year, subject, topic);

  const isPass = score >= Math.ceil(totalQuestions * 0.75); // 75% threshold for mastery
  const correct = score;

  // Create new entry if not exist
  if (!progress) {
    return await createQuizProgress({
      user_id,
      year,
      subject,
      topic,
      difficulty_level: difficulty,
      total_attempts: 1,
      correct_attempts: correct,
      best_score: score,
      last_score: score,
      passed: isPass,
    });
  }

  // Update progress
  const updatedAttempts = progress.total_attempts + 1;
  const updatedCorrect = progress.correct_attempts + correct;
  const updatedBest = Math.max(progress.best_score, score);

  const result = await pool.query(
    `UPDATE student_quiz_progress
     SET difficulty_level = $1,
         total_attempts = $2,
         correct_attempts = $3,
         best_score = $4,
         last_score = $5,
         passed = $6,
         last_activity = NOW()
     WHERE user_id = $7 AND year = $8 AND subject = $9 AND topic = $10
     RETURNING *`,
    [
      difficulty,
      updatedAttempts,
      updatedCorrect,
      updatedBest,
      score,
      isPass || progress.passed, // once passed, stay passed
      user_id,
      year,
      subject,
      topic,
    ]
  );

  return result.rows[0];
};

/* -------------------------------------------------------------------
   GET ALL QUIZ PROGRESS FOR USER
------------------------------------------------------------------- */
export const getUserQuizProgress = async (user_id: number) => {
  const result = await pool.query(
    `SELECT * FROM student_quiz_progress
     WHERE user_id = $1
     ORDER BY year, subject, topic`,
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
  const progress = await getQuizProgress(user_id, year, subject, topic);

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
        COUNT(*) FILTER (WHERE passed = TRUE) AS completed,
        COUNT(*) AS total
     FROM student_quiz_progress
     WHERE user_id = $1 AND year = $2 AND subject = $3`,
    [user_id, year, subject]
  );

  const completed = parseInt(result.rows[0].completed);
  const total = parseInt(result.rows[0].total);

  if (total === 0) return 0;

  return (completed / total) * 100;
};
