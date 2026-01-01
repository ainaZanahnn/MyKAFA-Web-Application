import { Request, Response } from 'express';
import pool from '../config/db';

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correct_answers: string[];
}

interface Quiz {
  id: number;
  title: string;
  description: string;
  year: number;
  subject: string;
  topic: string;
  status: 'draf' | 'diterbitkan' | 'diarkibkan';
  created_at: string;
}

// Status mapping between English (DB) and Malay (Frontend)
const statusMap = {
  'draft': 'draf',
  'published': 'diterbitkan',
  'archived': 'diarkibkan'
};

const reverseStatusMap = {
  'draf': 'draft',
  'diterbitkan': 'published',
  'diarkibkan': 'archived'
};

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

  // Validation
  if (!year || !subject || !topic || !quizType) {
    return res.status(400).json({ error: 'Year, subject, topic, and quizType are required' });
  }

  if (year < 1 || year > 6) {
    return res.status(400).json({ error: 'Year must be between 1 and 6' });
  }

  try {
    // Check if quiz already exists
    const checkQuery = `
      SELECT id FROM quizzes WHERE year = $1 AND subject = $2 AND topic = $3
    `;
    const checkResult = await pool.query(checkQuery, [year, subject, topic]);
    if (checkResult.rows.length > 0) {
      return res.status(409).json({ error: 'A quiz for this year, subject, and topic already exists' });
    }

    // Insert quiz
    const quizQuery = `
      INSERT INTO quizzes (year, subject, topic, quiz_type, status, created_at)
      VALUES ($1, $2, $3, $4, 'published', NOW())
      RETURNING id
    `;

    const quizResult = await pool.query(quizQuery, [year, subject, topic, quizType || 'mcq']);
    const quizId = quizResult.rows[0].id;

    // Insert questions if provided
    if (questions && questions.length > 0) {
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

    // Parse JSON fields if they are strings
    const parsedQuestions = questionsResult.rows.map(q => ({
      ...q,
      options: Array.isArray(q.options) ? q.options : JSON.parse(q.options || '[]'),
      correctAnswers: Array.isArray(q.correctAnswers) ? q.correctAnswers : JSON.parse(q.correctAnswers || '[]'),
      hints: q.hints ? (Array.isArray(q.hints) ? q.hints : JSON.parse(q.hints)) : null
    }));

    const quiz: Quiz = {
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
      await pool.query('DELETE FROM quiz_questions WHERE quiz_id = $1', [id]);

      // Insert new questions
      if (questions && questions.length > 0) {
        for (const question of questions) {
          const questionQuery = `
            INSERT INTO quiz_questions (quiz_id, question, options, correct_answers, hints, difficulty, topic, created_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
          `;

          await pool.query(questionQuery, [
            id,
            question.questionText,
            JSON.stringify(question.options),
            JSON.stringify(question.correctAnswers),
            question.hints ? JSON.stringify(question.hints) : null,
            question.difficulty || 'medium',
            topic
          ]);
        }
      }
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
      SELECT id, year, subject, topic, status, created_at
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
      SELECT id, question as questionText, options, correct_answers as correctAnswers
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
