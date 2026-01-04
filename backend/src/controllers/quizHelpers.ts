import { Request, Response } from 'express';
import pool from '../config/db';

/**
 * Utility functions for quiz data parsing and status mapping
 * Handles common operations used across quiz controllers
 */

// Status mapping between English (DB) and Malay (Frontend)
export const statusMap = {
  'draft': 'draf',
  'published': 'diterbitkan',
  'archived': 'diarkibkan'
};

export const reverseStatusMap = {
  'draf': 'draft',
  'diterbitkan': 'published',
  'diarkibkan': 'archived'
};

/**
 * Parse JSON fields in quiz questions
 * Handles both array and string formats for backward compatibility
 */
export function parseQuizQuestions(questions: any[]) {
  return questions.map(q => ({
    ...q,
    options: Array.isArray(q.options) ? q.options : JSON.parse(q.options || '[]'),
    correctAnswers: Array.isArray(q.correctAnswers) ? q.correctAnswers : [q.correctAnswers],
    hints: q.hints ? (Array.isArray(q.hints) ? q.hints : JSON.parse(q.hints)) : []
  }));
}

/**
 * Parse JSON fields for admin quiz questions
 * Used when fetching quiz data for admin interface
 */
export function parseAdminQuizQuestions(questions: any[]) {
  return questions.map(q => ({
    ...q,
    options: Array.isArray(q.options) ? q.options : JSON.parse(q.options || '[]'),
    correctAnswers: Array.isArray(q.correctAnswers) ? q.correctAnswers : JSON.parse(q.correctAnswers || '[]'),
    hints: q.hints ? (Array.isArray(q.hints) ? q.hints : JSON.parse(q.hints)) : null
  }));
}

/**
 * Validate quiz creation/update input
 */
export function validateQuizInput(year: number, subject: string, topic: string, quizType?: string) {
  if (!year || !subject || !topic) {
    return { isValid: false, error: 'Year, subject, and topic are required' };
  }

  if (year < 1 || year > 6) {
    return { isValid: false, error: 'Year must be between 1 and 6' };
  }

  return { isValid: true };
}

/**
 * Check if a quiz already exists for the given year, subject, and topic
 */
export async function checkQuizExists(year: number, subject: string, topic: string): Promise<boolean> {
  const checkQuery = `
    SELECT id FROM quizzes WHERE year = $1 AND subject = $2 AND topic = $3
  `;
  const checkResult = await pool.query(checkQuery, [year, subject, topic]);
  return checkResult.rows.length > 0;
}

/**
 * Insert questions for a quiz
 */
export async function insertQuizQuestions(quizId: number, questions: any[], topic: string) {
  if (!questions || questions.length === 0) return;

  for (const question of questions) {
    const questionQuery = `
      INSERT INTO quiz_questions (quiz_id, question, options, correct_answers, hints, difficulty, topic, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
    `;

    await pool.query(questionQuery, [
      quizId,
      question.questionText,
      JSON.stringify(question.options),
      JSON.stringify(question.correctAnswers),
      question.hints ? JSON.stringify(question.hints) : null,
      question.difficulty || 'medium',
      topic
    ]);
  }
}

/**
 * Delete existing questions for a quiz (used during updates)
 */
export async function deleteQuizQuestions(quizId: number) {
  await pool.query('DELETE FROM quiz_questions WHERE quiz_id = $1', [quizId]);
}

/**
 * Get default quiz statistics structure
 */
export function getDefaultQuizStats() {
  return {
    totalAttempts: 0,
    bestScore: 0,
    lastScore: 0,
    passed: false,
    lastActivity: null
  };
}

/**
 * Map database stats row to frontend format
 */
export function mapQuizStatsRow(row: any) {
  return {
    totalAttempts: row.total_attempts || 0,
    bestScore: row.best_score || 0,
    lastScore: row.last_score || 0,
    passed: row.passed || false,
    lastActivity: row.last_activity
  };
}
