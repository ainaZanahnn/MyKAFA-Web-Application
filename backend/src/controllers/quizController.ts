import { Request, Response } from 'express';
import pool from '../config/db';

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correct_answer: number;
  explanation: string;
}

interface Quiz {
  id: number;
  year: number;
  subject: string;
  topic: string;
  bloom_level: 'remember' | 'understand' | 'apply' | 'analyze';
  status: 'draft' | 'published' | 'archived';
  created_at: string;
}

// GET /api/admin/quizzes - Get all quizzes
export const getQuizzes = async (req: Request, res: Response) => {
  try {
    // Return dummy data for now
    const dummyQuizzes: Quiz[] = [
      {
        id: 1,
        year: 1,
        subject: "Al-Quran",
        topic: "Basic Knowledge",
        bloom_level: "remember",
        status: "published",
        created_at: "2024-01-15T10:00:00Z"
      },
      {
        id: 2,
        year: 2,
        subject: "Ibadah",
        topic: "Islamic Prayer",
        bloom_level: "understand",
        status: "draft",
        created_at: "2024-01-20T14:30:00Z"
      },
      {
        id: 3,
        year: 3,
        subject: "Bahasa Arab",
        topic: "Arabic Alphabet",
        bloom_level: "apply",
        status: "published",
        created_at: "2024-01-25T09:15:00Z"
      }
    ];

    res.json({ quizzes: dummyQuizzes });
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    res.status(500).json({ error: 'Failed to fetch quizzes' });
  }
};

// POST /api/admin/quizzes - Create a new quiz
export const createQuiz = async (req: Request, res: Response) => {
  const { year, subject, topic, bloom_level } = req.body;

  try {
    // Insert quiz
    const quizQuery = `
      INSERT INTO quizzes (year, subject, topic, bloom_level, status, created_at)
      VALUES ($1, $2, $3, $4, 'draft', NOW())
      RETURNING id
    `;

    const quizResult = await pool.query(quizQuery, [year, subject, topic, bloom_level]);
    const quizId = quizResult.rows[0].id;

    res.status(201).json({ message: 'Quiz created successfully', quizId });
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
      SELECT id, title, description, level, subject, year, status, created_at, updated_at
      FROM quizzes
      WHERE id = $1
    `;

    const quizResult = await pool.query(quizQuery, [id]);

    if (quizResult.rows.length === 0) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    // Get questions
    const questionsQuery = `
      SELECT id, question, options, correct_answer, explanation
      FROM quiz_questions
      WHERE quiz_id = $1
      ORDER BY id
    `;

    const questionsResult = await pool.query(questionsQuery, [id]);

    const quiz: Quiz = {
      ...quizResult.rows[0],
      questions: questionsResult.rows
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
  const { year, subject, topic, bloom_level, status } = req.body;

  try {
    // Update quiz
    const quizQuery = `
      UPDATE quizzes
      SET year = $1, subject = $2, topic = $3, bloom_level = $4, status = $5
      WHERE id = $6
    `;

    await pool.query(quizQuery, [year, subject, topic, bloom_level, status, id]);

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
    // Delete questions first (due to foreign key constraint)
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

// GET /api/quizzes/student/:year/:subject/:topic - Get quiz for student by topic
export const getQuizForStudent = async (req: Request, res: Response) => {
  const { year, subject, topic } = req.params;

  try {
    // Get quiz by year, subject, topic and ensure it's published
    const quizQuery = `
      SELECT id, year, subject, topic, bloom_level, status, created_at
      FROM quizzes
      WHERE year = $1 AND subject = $2 AND topic = $3 AND status = 'published'
    `;

    const quizResult = await pool.query(quizQuery, [year, subject, topic]);

    if (quizResult.rows.length === 0) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    const quiz = quizResult.rows[0];

    // Get questions for the quiz
    const questionsQuery = `
      SELECT id, question, options, correct_answer, explanation
      FROM quiz_questions
      WHERE quiz_id = $1
      ORDER BY id
    `;

    const questionsResult = await pool.query(questionsQuery, [quiz.id]);

    const quizData = {
      ...quiz,
      questions: questionsResult.rows
    };

    res.json({ quiz: quizData });
  } catch (error) {
    console.error('Error fetching quiz for student:', error);
    res.status(500).json({ error: 'Failed to fetch quiz' });
  }
};
