import { QuizSession } from '../types/adaptiveQuizTypes';
import pool from '../config/db';

export class QuizSessionStore {
  async save(session: QuizSession): Promise<void> {
    const query = `
      INSERT INTO quiz_sessions (
        session_id, user_id, year, subject, topic, current_question_index,
        current_question, ability_estimate, questions_answered, unique_questions_answered,
        total_score, current_topic_score, total_questions,
        current_topic_questions, time_spent, start_time,
        is_completed, available_questions, answered_questions,
        consecutive_wrong_answers, hints_used, current_hints_used, remedial_questions,
        question_attempts, incorrect_questions, question_scores, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16,
        $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28
      )
      ON CONFLICT (session_id) DO UPDATE SET
        current_question_index = EXCLUDED.current_question_index,
        current_question = EXCLUDED.current_question,
        ability_estimate = EXCLUDED.ability_estimate,
        questions_answered = EXCLUDED.questions_answered,
        unique_questions_answered = EXCLUDED.unique_questions_answered,
        total_score = EXCLUDED.total_score,
        current_topic_score = EXCLUDED.current_topic_score,
        current_topic_questions = EXCLUDED.current_topic_questions,
        time_spent = EXCLUDED.time_spent,
        is_completed = EXCLUDED.is_completed,
        available_questions = EXCLUDED.available_questions,
        answered_questions = EXCLUDED.answered_questions,
        consecutive_wrong_answers = EXCLUDED.consecutive_wrong_answers,
        hints_used = EXCLUDED.hints_used,
        current_hints_used = EXCLUDED.current_hints_used,
        remedial_questions = EXCLUDED.remedial_questions,
        question_attempts = EXCLUDED.question_attempts,
        incorrect_questions = EXCLUDED.incorrect_questions,
        question_scores = EXCLUDED.question_scores,
        updated_at = CURRENT_TIMESTAMP
    `;

    const values = [
      session.sessionId,
      session.userId,
      session.year,
      session.subject,
      session.topic,
      session.currentQuestionIndex,
      session.currentQuestion ? JSON.stringify(session.currentQuestion) : null,
      session.abilityEstimate,
      session.questionsAnswered,
      session.uniqueQuestionsAnswered,
      session.totalScore,
      session.currentTopicScore,
      session.totalQuestions,
      session.currentTopicQuestions,
      session.timeSpent,
      session.startTime,
      session.isCompleted,
      JSON.stringify(session.availableQuestions),
      session.answeredQuestions,
      session.consecutiveWrongAnswers,
      session.hintsUsed,
      session.currentHintsUsed,
      session.remedialQuestions,
      JSON.stringify(Object.fromEntries(session.questionAttempts)),
      session.incorrectQuestions,
      JSON.stringify(session.questionScores),
      new Date(), // created_at
      new Date()  // updated_at
    ];

    try {
      await pool.query(query, values);
    } catch (error) {
      console.error('Error saving quiz session:', error);
      throw error;
    }
  }

  async get(sessionId: string): Promise<QuizSession | undefined> {
    const query = 'SELECT * FROM quiz_sessions WHERE session_id = $1';

    try {
      const result = await pool.query(query, [sessionId]);
      if (result.rows.length === 0) {
        return undefined;
      }

      const row = result.rows[0];
      return {
        sessionId: row.session_id,
        userId: row.user_id,
        year: row.year,
        subject: row.subject,
        topic: row.topic,
        currentQuestionIndex: row.current_question_index,
        currentQuestion: row.current_question ? (typeof row.current_question === 'string' ? JSON.parse(row.current_question) : row.current_question) : null,
        abilityEstimate: parseFloat(row.ability_estimate),
        questionsAnswered: row.questions_answered,
        uniqueQuestionsAnswered: row.unique_questions_answered,
        totalScore: parseFloat(row.total_score),
        currentTopicScore: parseFloat(row.current_topic_score),
        totalQuestions: row.total_questions,
        currentTopicQuestions: row.current_topic_questions,
        timeSpent: row.time_spent,
        startTime: new Date(row.start_time),
        isCompleted: row.is_completed,
        weakTopics: [], // Default value since column doesn't exist
        availableQuestions: row.available_questions ? (typeof row.available_questions === 'string' ? JSON.parse(row.available_questions) : row.available_questions) : [],
        answeredQuestions: row.answered_questions,
        consecutiveWrongAnswers: row.consecutive_wrong_answers,
        hintsUsed: row.hints_used,
        currentHintsUsed: row.current_hints_used,
        remedialQuestions: row.remedial_questions,
        questionAttempts: new Map(Object.entries(typeof row.question_attempts === 'string' ? JSON.parse(row.question_attempts) : row.question_attempts || {}).map(([k, v]) => [parseInt(k), v as { attempts: number; correct: boolean; hintsUsed: number }])),
        incorrectQuestions: row.incorrect_questions,
        questionScores: row.question_scores ? (typeof row.question_scores === 'string' ? JSON.parse(row.question_scores) : row.question_scores) : []
      };
    } catch (error) {
      console.error('Error getting quiz session:', error);
      throw error;
    }
  }

  async delete(sessionId: string): Promise<boolean> {
    const query = 'DELETE FROM quiz_sessions WHERE session_id = $1';

    try {
      const result = await pool.query(query, [sessionId]);
      return (result.rowCount ?? 0) > 0;
    } catch (error) {
      console.error('Error deleting quiz session:', error);
      throw error;
    }
  }

  async has(sessionId: string): Promise<boolean> {
    const query = 'SELECT 1 FROM quiz_sessions WHERE session_id = $1 LIMIT 1';

    try {
      const result = await pool.query(query, [sessionId]);
      return result.rows.length > 0;
    } catch (error) {
      console.error('Error checking quiz session existence:', error);
      throw error;
    }
  }

  // Clean up completed sessions older than specified days
  async cleanupCompletedSessions(daysOld: number = 7): Promise<void> {
    const query = 'DELETE FROM quiz_sessions WHERE is_completed = true AND updated_at < NOW() - INTERVAL \'1 day\' * $1';

    try {
      await pool.query(query, [daysOld]);
    } catch (error) {
      console.error('Error cleaning up completed sessions:', error);
      throw error;
    }
  }
}
