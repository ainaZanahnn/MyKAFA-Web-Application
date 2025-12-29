import express from 'express';
import {
  getQuizzes,
  createQuiz,
  getQuizById,
  updateQuiz,
  deleteQuiz,
  getQuizForStudent
} from '../controllers/quizController';
import { verifyAdmin } from '../middleware/verifyAdmin';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// All admin quiz routes require admin authentication
router.use('/admin', verifyAdmin);

// GET /api/admin/quizzes - Get all quizzes
router.get('/admin/', getQuizzes);

// POST /api/admin/quizzes - Create a new quiz
router.post('/admin/', createQuiz);

// GET /api/admin/quizzes/:id - Get a specific quiz
router.get('/admin/:id', getQuizById);

// PUT /api/admin/quizzes/:id - Update a quiz
router.put('/admin/:id', updateQuiz);

// DELETE /api/admin/quizzes/:id - Delete a quiz
router.delete('/admin/:id', deleteQuiz);

// Student quiz routes
// GET /api/quizzes/student/:year/:subject/:topic - Get quiz for student by topic
router.get('/student/:year/:subject/:topic', protect, getQuizForStudent);

// Adaptive quiz routes
import {
  startAdaptiveQuiz,
  getNextQuestion,
  submitAnswer,
  getQuizResults,
  restartAdaptiveQuiz
} from '../controllers/adaptiveQuizController';

router.post('/adaptive-quiz/start', protect, startAdaptiveQuiz);
router.post('/adaptive-quiz/restart', protect, restartAdaptiveQuiz);
router.get('/adaptive-quiz/question/:sessionId', protect, getNextQuestion);
router.post('/adaptive-quiz/answer/:sessionId', protect, submitAnswer);
router.get('/adaptive-quiz/results/:sessionId', protect, getQuizResults);

export default router;
