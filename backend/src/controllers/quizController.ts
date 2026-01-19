import { Request, Response } from 'express';
import pool from '../config/db';
import { statusMap, reverseStatusMap, validateQuizInput, validateQuizStatus } from '../utils/quizUtils';

interface AuthenticatedRequest extends Request {
  user?: { id: number; role: string };
}



interface Quiz {
  id: number;
  year: number;
  subject: string;
  topic: string;
  status: 'draf' | 'diterbitkan' | 'diarkibkan';
  created_at: string;
  questions?: any[];
}

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
  const validation = validateQuizInput(year, subject, topic, quizType);
  if (!validation.isValid) {
    return res.status(400).json({ error: validation.error });
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
      VALUES ($1, $2, $3, $4, 'draft', NOW())
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

    res.status(201).json({
      message: 'Quiz created successfully',
      quizId,
      questionCount: questions.length
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

    // Parse JSON fields if they are strings
    const parsedQuestions = questionsResult.rows.map(q => ({
      ...q,
      options: Array.isArray(q.options) ? q.options : JSON.parse(q.options || '[]'),
      correctAnswers: Array.isArray(q.correctAnswers) ? q.correctAnswers : JSON.parse(q.correctAnswers || '[]'),
      hints: q.hints ? (Array.isArray(q.hints) ? q.hints : JSON.parse(q.hints)) : null,
      answerType: (Array.isArray(q.correctAnswers) ? q.correctAnswers : JSON.parse(q.correctAnswers || '[]')).length === 1 ? 'single' : 'multiple'
    }));

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

// PUT /api/admin/quizzes/:id/status - Update quiz status only
export const updateQuizStatus = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  // Validation
  if (!status) {
    return res.status(400).json({ error: 'Status is required' });
  }

  const validation = validateQuizStatus(status);
  if (!validation.isValid) {
    return res.status(400).json({ error: validation.error });
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
      SELECT id, question as questionText, options, correct_answers as correctAnswers, hints, difficulty
      FROM quiz_questions
      WHERE quiz_id = $1
      ORDER BY id
    `;

    const questionsResult = await pool.query(questionsQuery, [quiz.id]);

    // Parse JSON fields
    const parsedQuestions = questionsResult.rows.map(q => ({
      ...q,
      options: Array.isArray(q.options) ? q.options : JSON.parse(q.options || '[]'),
      correctAnswers: Array.isArray(q.correctAnswers) ? q.correctAnswers : [q.correctAnswers],
      hints: q.hints ? (Array.isArray(q.hints) ? q.hints : JSON.parse(q.hints)) : []
    }));

    const quizData = {
      ...quiz,
      questions: parsedQuestions
    };

    res.json({ quiz: quizData, success: true });
  } catch (error) {
    console.error('Error fetching quiz for student:', error);
    res.status(500).json({ error: 'Failed to fetch quiz' });
  }
};


export const getQuizStatsForStudent = async (req: AuthenticatedRequest, res: Response) => {
  const { year, subject, topic } = req.params;
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ error: 'User not authenticated' });
  }

  try {
    // First, get the quiz_id from year, subject, topic
    const quizQuery = `
      SELECT id FROM quizzes WHERE year = $1 AND subject = $2 AND topic = $3
    `;
    const quizResult = await pool.query(quizQuery, [year, subject, topic]);
    if (quizResult.rows.length === 0) {
      return res.json({
        stats: {
          totalAttempts: 0,
          bestScore: 0,
          lastScore: 0,
          passed: false,
          lastActivity: null
        },
        success: true
      });
    }
    const quizId = quizResult.rows[0].id;

    // Get quiz statistics from student_quiz_progress
    const statsQuery = `
      SELECT
        total_attempts,
        best_score,
        last_score,
        passed,
        last_activity
      FROM student_quiz_progress
      WHERE user_id = $1 AND quiz_id = $2
    `;

    const statsResult = await pool.query(statsQuery, [userId, quizId]);

    let stats = {
      totalAttempts: 0,
      bestScore: 0,
      lastScore: 0,
      passed: false,
      lastActivity: null
    };

    if (statsResult.rows.length > 0) {
      const row = statsResult.rows[0];
      stats = {
        totalAttempts: row.total_attempts || 0,
        bestScore: row.best_score || 0,
        lastScore: row.last_score || 0,
        passed: row.passed || false,
        lastActivity: row.last_activity
      };
    }

    res.json({ stats, success: true });
  } catch (error) {
    console.error('Error fetching quiz stats for student:', error);
    res.status(500).json({ error: 'Failed to fetch quiz stats' });
  }
};
