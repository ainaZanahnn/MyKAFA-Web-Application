import express from 'express';
import rateLimit from 'express-rate-limit';
import {
  getQuizzes,
  createQuiz,
  getQuizById,
  updateQuiz,
  updateQuizStatus,
  deleteQuiz
} from '../controllers/adminQuizController';
import {
  getQuizForStudent,
  getQuizStatsForStudent
} from '../controllers/quizController';
import {
  startAdaptiveQuiz,
  restartAdaptiveQuiz,
  getNextQuestion,
  submitAnswer,
  requestHint,
  getQuizResults,
  getQuizProgress
} from '../controllers/adaptiveQuizController';
import { verifyAdmin } from '../middleware/verifyAdmin';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// SECURITY: Rate limiting for quiz endpoints - per user instead of per IP for educational purposes
const quizRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each user to 200 requests per windowMs for quiz operations (increased for multiple attempts)
  keyGenerator: (req) => {
    // Use user ID from JWT token for per-user limiting
    return (req as any).user?.id || req.ip;
  },
  message: 'Too many quiz requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

const answerRateLimit = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes (increased window)
  max: 100, // limit each user to 100 answer submissions per windowMs (increased for longer quizzes)
  keyGenerator: (req) => {
    // Use user ID from JWT token for per-user limiting
    return (req as any).user?.id || req.ip;
  },
  message: 'Too many answer submissions, please slow down.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Admin routes
router.get('/admin', protect, verifyAdmin, getQuizzes);
router.post('/admin', protect, verifyAdmin, createQuiz);
router.get('/admin/:id', protect, verifyAdmin, getQuizById);
router.put('/admin/:id', protect, verifyAdmin, updateQuiz);
router.put('/admin/:id/status', protect, verifyAdmin, updateQuizStatus);
router.delete('/admin/:id', protect, verifyAdmin, deleteQuiz);

// Student routes
router.get('/quizzes/student/:year/:subject/:topic', protect, getQuizForStudent);
router.get('/quizzes/student/stats/:year/:subject/:topic', protect, getQuizStatsForStudent);

// Adaptive quiz routes with rate limiting
router.post('/adaptive-quiz/start', protect, quizRateLimit, startAdaptiveQuiz);
router.post('/adaptive-quiz/restart', protect, quizRateLimit, restartAdaptiveQuiz);
router.get('/adaptive-quiz/question/:sessionId', protect, quizRateLimit, getNextQuestion);
router.post('/adaptive-quiz/answer/:sessionId', protect, answerRateLimit, submitAnswer);
router.post('/adaptive-quiz/hint/:sessionId', protect, quizRateLimit, requestHint);
router.get('/adaptive-quiz/results/:sessionId', protect, quizRateLimit, getQuizResults);
router.get('/quiz/progress/:userId/:year/:subject/:topic', protect, quizRateLimit, getQuizProgress);

export default router;
