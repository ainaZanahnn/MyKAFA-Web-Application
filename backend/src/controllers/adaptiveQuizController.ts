import { Request, Response } from 'express';
import pool from '../config/db';
import { AdaptiveQuizService } from '../services/AdaptiveQuizService';
import { QuizSessionStore } from '../services/QuizSessionStore';

const quizService = new AdaptiveQuizService();
const sessionStore = new QuizSessionStore();

/* -------------------------------------------------------------------
   START ADAPTIVE QUIZ SESSION
------------------------------------------------------------------- */
export const startAdaptiveQuiz = async (req: Request, res: Response) => {
  const { userId, year, subject, topic, maxQuestions = 10 } = req.body;
  const parsedUserId = parseInt(userId);

  try {
    const sessionData = await quizService.startAdaptiveQuiz(parsedUserId, year, subject, topic, maxQuestions);

    const session = quizService.createQuizSession({
      userId: parsedUserId,
      year,
      subject,
      topic,
      abilityEstimate: sessionData.initialAbility,
      totalQuestions: sessionData.totalQuestions,
      weakTopics: sessionData.weakTopics,
      availableQuestions: sessionData.questions
    });

    await sessionStore.save(session);

    res.json({
      sessionId: session.sessionId,
      initialAbility: sessionData.initialAbility,
      weakTopics: sessionData.weakTopics,
      totalQuestions: sessionData.totalQuestions
    });

  } catch (error: any) {
    console.error('Error starting adaptive quiz:', error);
    res.status(500).json({ error: error.message || 'Failed to start quiz' });
  }
};

/* -------------------------------------------------------------------
   GET NEXT QUESTION
------------------------------------------------------------------- */
export const getNextQuestion = async (req: Request, res: Response) => {
  const { sessionId } = req.params;

  const session = await sessionStore.get(sessionId);
  if (!session || session.isCompleted) {
    return res.status(404).json({ error: 'Session not found or completed' });
  }

  const nextQuestion = quizService.getNextQuestion(session);

  if (!nextQuestion) {
    session.isCompleted = true;
    await sessionStore.save(session);
    return res.json({ completed: true });
  }

  // Set current question and reset hint counter
  session.currentQuestion = nextQuestion;
  session.currentHintsUsed = 0;
  await sessionStore.save(session);

  res.json({
    id: nextQuestion.id,
    question: nextQuestion.question,
    options: nextQuestion.options,
    correct_answers: nextQuestion.correct_answers,
    hints: nextQuestion.hints,
    topic: nextQuestion.topic,
    difficulty: nextQuestion.difficulty,
    progress: {
      current: session.questionsAnswered + 1,
      total: session.totalQuestions,
      abilityEstimate: session.abilityEstimate
    }
  });
};

/* -------------------------------------------------------------------
   SUBMIT ANSWER
------------------------------------------------------------------- */
export const submitAnswer = async (req: Request, res: Response) => {
  const { sessionId } = req.params;
  const { questionId, answer, timeSpent } = req.body;

  const session = await sessionStore.get(sessionId);
  if (!session || session.isCompleted) {
    return res.status(404).json({ error: 'Session not found or completed' });
  }

  try {
    const result = await quizService.submitAnswer(session, questionId, answer, timeSpent);
    await sessionStore.save(session);

    res.json(result);
  } catch (error: any) {
    console.error('Error submitting answer:', error);
    res.status(400).json({ error: error.message });
  }
};

/* -------------------------------------------------------------------
   RESTART QUIZ SESSION (Allow re-attempts)
------------------------------------------------------------------- */
export const restartAdaptiveQuiz = async (req: Request, res: Response) => {
  const { userId, year, subject, topic, maxQuestions = 10 } = req.body;
  const parsedUserId = parseInt(userId);

  try {
    const sessionData = await quizService.startAdaptiveQuiz(parsedUserId, year, subject, topic, maxQuestions);

    const session = quizService.createQuizSession({
      userId: parsedUserId,
      year,
      subject,
      topic,
      abilityEstimate: sessionData.initialAbility,
      totalQuestions: sessionData.totalQuestions,
      weakTopics: sessionData.weakTopics,
      availableQuestions: sessionData.questions
    });

    await sessionStore.save(session);

    res.json({
      sessionId: session.sessionId,
      initialAbility: sessionData.initialAbility,
      weakTopics: sessionData.weakTopics,
      totalQuestions: sessionData.totalQuestions,
      isRestart: true
    });

  } catch (error: any) {
    console.error('Error restarting adaptive quiz:', error);
    res.status(500).json({ error: error.message || 'Failed to restart quiz' });
  }
};

/* -------------------------------------------------------------------
   REQUEST HINT
------------------------------------------------------------------- */
export const requestHint = async (req: Request, res: Response) => {
  const { sessionId } = req.params;

  const session = await sessionStore.get(sessionId);
  if (!session || session.isCompleted) {
    return res.status(404).json({ error: 'Session not found or completed' });
  }

  try {
    const result = await quizService.requestHint(session);
    await sessionStore.save(session);

    res.json(result);
  } catch (error: any) {
    console.error('Error requesting hint:', error);
    res.status(400).json({ error: error.message });
  }
};

/* -------------------------------------------------------------------
   GET QUIZ RESULTS
------------------------------------------------------------------- */
export const getQuizResults = async (req: Request, res: Response) => {
  const { sessionId } = req.params;

  const session = await sessionStore.get(sessionId);
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }

  try {
    const results = await quizService.getQuizResults(session);
    await sessionStore.delete(sessionId); // Clean up session

    res.json(results);
  } catch (error: any) {
    console.error('Error getting quiz results:', error);
    res.status(500).json({ error: error.message });
  }
};

/* -------------------------------------------------------------------
   GET QUIZ PROGRESS FOR STUDENT
------------------------------------------------------------------- */
export const getQuizProgress = async (req: Request, res: Response) => {
  const { userId, year, subject, topic } = req.params;

  console.log(`[DEBUG] getQuizProgress called: userId=${userId}, year=${year}, subject=${subject}, topic="${topic}"`);

  try {
    // First, get the quiz_id from year, subject, topic with flexible matching
    let quizQuery = await pool.query(
      `SELECT id, topic FROM quizzes WHERE year = $1 AND subject = $2 AND topic = $3`,
      [year, subject, topic]
    );

    // If exact match fails, try flexible topic matching
    if (quizQuery.rows.length === 0) {
      console.log(`[DEBUG] Exact topic match failed for "${topic}", trying flexible match...`);
      const allQuizzesQuery = await pool.query(
        `SELECT id, topic FROM quizzes WHERE year = $1 AND subject = $2`,
        [year, subject]
      );

      console.log(`[DEBUG] Found ${allQuizzesQuery.rows.length} quizzes for year=${year}, subject=${subject}`);
      allQuizzesQuery.rows.forEach(quiz => {
        console.log(`[DEBUG] Available quiz: id=${quiz.id}, topic="${quiz.topic}"`);
      });

      // Import isTopicMatch function
      const { isTopicMatch } = await import('../utils/adaptiveQuizUtils');

      // Find quiz with flexible topic matching
      for (const quiz of allQuizzesQuery.rows) {
        console.log(`[DEBUG] Checking if "${quiz.topic}" matches "${topic}": ${isTopicMatch(quiz.topic, topic)}`);
        if (isTopicMatch(quiz.topic, topic)) {
          quizQuery = { rows: [{ id: quiz.id, topic: quiz.topic }] } as any;
          console.log(`[DEBUG] Found matching quiz ID ${quiz.id} with topic "${quiz.topic}"`);
          break;
        }
      }
    }

    if (quizQuery.rows.length === 0) {
      return res.json({
        passed: false,
        last_score: 0,
        best_score: 0,
        total_attempts: 0
      });
    }
    const quizId = quizQuery.rows[0].id;

    const query = `
      SELECT passed, last_score, best_score, total_attempts, last_activity
      FROM student_quiz_progress
      WHERE user_id = $1 AND quiz_id = $2
      ORDER BY last_activity DESC
      LIMIT 1
    `;

    const result = await pool.query(query, [userId, quizId]);

    if (result.rows.length === 0) {
      return res.json({
        passed: false,
        last_score: 0,
        best_score: 0,
        total_attempts: 0
      });
    }

    const progress = result.rows[0];
    res.json({
      passed: progress.passed || false,
      last_score: progress.last_score || 0,
      best_score: progress.best_score || 0,
      total_attempts: progress.total_attempts || 0
    });

  } catch (error) {
    console.error('Error fetching quiz progress:', error);
    res.status(500).json({ error: 'Failed to fetch quiz progress' });
  }
};



