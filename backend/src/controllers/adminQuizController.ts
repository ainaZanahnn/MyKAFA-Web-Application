import { Request, Response } from 'express';
import pool from '../config/db';
import {
  statusMap,
  reverseStatusMap,
  getDisplayStatus,
  getDbStatus,
  validateQuizInput,
  validateQuizStatus
} from '../utils/quizUtils';
import {
  parseAdminQuizQuestions,
  checkQuizExists,
  insertQuizQuestions,
  deleteQuizQuestions
} from './quizHelpers';

/**
 * Admin Quiz Controller
 * Handles all admin operations for quiz management (CRUD operations)
 */

// GET /api/admin/quizzes - Get all quizzes
export const getQuizzes = async (req: Request, res: Response) => {
  try {
    // Fetch quizzes from database with question count
    const query = `
      SELECT q.id, q.year, q.subject, q.topic, q.quiz_type, q.status, q.created_at,
             COUNT(qq.id) as question_count
      FROM quizzes q
      LEFT JOIN quiz_questions qq ON q.id = qq.quiz_id
      GROUP BY q.id, q.year, q.subject, q.topic, q.quiz_type, q.status, q.created_at
      ORDER BY q.created_at DESC
    `;

    const result = await pool.query(query);
    const quizzes = result.rows.map(quiz => ({
      ...quiz,
      status: statusMap[quiz.status as keyof typeof statusMap] || quiz.status
    }));

    res.json({ quizzes });
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    res.status(500).json({ error: 'Failed to fetch quizzes' });
  }
};

// POST /api/admin/quizzes - Create a new quiz
export const createQuiz = async (req: Request, res: Response) => {
  const { year, subject, topic, quizType, questions } = req.body;

  // Validate input
  const validation = validateQuizInput(year, subject, topic, quizType);
  if (!validation.isValid) {
    return res.status(400).json({ error: validation.error });
  }

  try {
    // Check if quiz already exists
    const exists = await checkQuizExists(year, subject, topic);
    if (exists) {
      return res.status(409).json({ error: 'A quiz for this year, subject, and topic already exists' });
    }

    // Insert quiz
    const quizQuery = `
      INSERT INTO quizzes (year, subject, topic, quiz_type, status, created_at)
      VALUES ($1, $2, $3, $4, 'draft', NOW())
      RETURNING id
    `;

    const quizResult = await pool.query(quizQuery, [year, subject, topic, quizType || 'mcq']);
    const quizId = quizResult.rows[0].id;

    // Insert questions if provided
    await insertQuizQuestions(quizId, questions, topic);

    res.status(201).json({
      message: 'Quiz created successfully',
      quizId,
      questionCount: questions?.length || 0
    });
  } catch (error) {
    console.error('Error creating quiz:', error);
    res.status(500).json({ error: 'Failed to create quiz' });
  }
};

// GET /api/admin/quizzes/:id - Get a specific quiz
export const getQuizById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    // Get quiz
    const quizQuery = `
      SELECT id, year, subject, topic, quiz_type, status, created_at, updated_at
      FROM quizzes
      WHERE id = $1
    `;

    const quizResult = await pool.query(quizQuery, [id]);

    if (quizResult.rows.length === 0) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    // Get questions
    const questionsQuery = `
      SELECT id, COALESCE(question, '') as "questionText", options, correct_answers as "correctAnswers", hints, difficulty, topic
      FROM quiz_questions
      WHERE quiz_id = $1
      ORDER BY id
    `;

    const questionsResult = await pool.query(questionsQuery, [id]);

    // Parse JSON fields
    const parsedQuestions = parseAdminQuizQuestions(questionsResult.rows);

    const quiz = {
      ...quizResult.rows[0],
      status: statusMap[quizResult.rows[0].status as keyof typeof statusMap] || quizResult.rows[0].status,
      questions: parsedQuestions
    };

    res.json({ quiz });
  } catch (error) {
    console.error('Error fetching quiz:', error);
    res.status(500).json({ error: 'Failed to fetch quiz' });
  }
};

// PUT /api/admin/quizzes/:id - Update a quiz
export const updateQuiz = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { year, subject, topic, quizType, status, questions } = req.body;

  try {
    // Build dynamic update query based on provided fields
    const updateFields = [];
    const values = [];
    let paramIndex = 1;

    if (year !== undefined && year !== "undefined") {
      updateFields.push(`year = $${paramIndex++}`);
      values.push(year);
    }
    if (subject !== undefined && subject !== "undefined") {
      updateFields.push(`subject = $${paramIndex++}`);
      values.push(subject);
    }
    if (topic !== undefined && topic !== "undefined") {
      updateFields.push(`topic = $${paramIndex++}`);
      values.push(topic);
    }
    if (quizType !== undefined && quizType !== "undefined") {
      updateFields.push(`quiz_type = $${paramIndex++}`);
      values.push(quizType);
    }
    if (status !== undefined && status !== "undefined") {
      // Convert Malay status to English for database
      const dbStatus = reverseStatusMap[status as keyof typeof reverseStatusMap] || status;
      updateFields.push(`status = $${paramIndex++}`);
      values.push(dbStatus);
    }

    // Always update updated_at
    updateFields.push(`updated_at = NOW()`);

    if (updateFields.length === 1) {
      // Only updated_at was set, no actual changes
      return res.json({ message: 'Quiz updated successfully' });
    }

    // Update quiz
    const quizQuery = `
      UPDATE quizzes
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex}
    `;

    values.push(id);
    await pool.query(quizQuery, values);

    // Update questions if provided
    if (questions !== undefined) {
      // Delete existing questions
      await deleteQuizQuestions(parseInt(id));

      // Insert new questions
      await insertQuizQuestions(parseInt(id), questions, topic);
    }

    res.json({ message: 'Quiz updated successfully' });
  } catch (error) {
    console.error('Error updating quiz:', error);
    res.status(500).json({ error: 'Failed to update quiz' });
  }
};

// DELETE /api/admin/quizzes/:id - Delete a quiz
export const deleteQuiz = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    // Delete related records first (due to foreign key constraints)
    await pool.query('DELETE FROM student_quiz_progress WHERE quiz_id = $1', [id]);
    await pool.query('DELETE FROM student_weak_topics WHERE quiz_id = $1', [id]);
    await pool.query('DELETE FROM quiz_questions WHERE quiz_id = $1', [id]);

    // Delete quiz
    const result = await pool.query('DELETE FROM quizzes WHERE id = $1', [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    res.json({ message: 'Quiz deleted successfully' });
  } catch (error) {
    console.error('Error deleting quiz:', error);
    res.status(500).json({ error: 'Failed to delete quiz' });
  }
};

// PUT /api/admin/quizzes/:id/status - Update quiz status only
export const updateQuizStatus = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  // Validation
  if (!status) {
    return res.status(400).json({ error: 'Status is required' });
  }

  const validStatuses = ['draf', 'diterbitkan', 'diarkibkan'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status. Must be draf, diterbitkan, or diarkibkan' });
  }

  try {
    // Convert Malay status to English for database
    const dbStatus = reverseStatusMap[status as keyof typeof reverseStatusMap] || status;

    // Update only the status
    const query = `
      UPDATE quizzes
      SET status = $1, updated_at = NOW()
      WHERE id = $2
    `;

    const result = await pool.query(query, [dbStatus, id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    res.json({ message: 'Quiz status updated successfully' });
  } catch (error) {
    console.error('Error updating quiz status:', error);
    res.status(500).json({ error: 'Failed to update quiz status' });
  }
};
