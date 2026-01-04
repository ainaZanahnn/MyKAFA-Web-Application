import { Request, Response } from 'express';
import pool from '../config/db';
import { getMergedUserProgress } from '../models/mergedProgressModel';

interface Question {
  id: number;
  question: string;
  options: string[];
  correct_answers: number[]; // JSONB array of correct answer indices
  hints: string[];
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface HistoricalProgress {
  year: number;
  subject: string;
  topic: string;
  topicProgress: number;
  quizScore: number;
  quizPassed: boolean;
  materialsViewed: number;
  totalMaterials: number;
}

interface QuizSession {
  sessionId: string;
  userId: string;
  year: number;
  subject: string;
  topic: string;
  currentQuestionIndex: number;
  currentQuestion: Question | null;
  abilityEstimate: number;
  questionsAnswered: number;
  totalScore: number;
  currentTopicScore: number;
  weakTopicScore: number;
  totalQuestions: number;
  currentTopicQuestions: number;
  weakTopicQuestions: number;
  timeSpent: number;
  startTime: Date;
  isCompleted: boolean;
  weakTopics: string[];
  availableQuestions: Question[];
  answeredQuestions: number[];
  consecutiveWrongAnswers: number;
  hintsUsed: number;
  currentHintsUsed: number;
}

// In-memory session storage (in production, use Redis or database)
const quizSessions = new Map<string, QuizSession>();

/* -------------------------------------------------------------------
   START ADAPTIVE QUIZ SESSION
------------------------------------------------------------------- */
export const startAdaptiveQuiz = async (req: Request, res: Response) => {
  const { userId, year, subject, topic, maxQuestions = 10 } = req.body;

  try {
    // Fetch historical progress
    const historicalProgress = await getMergedUserProgress(userId) as HistoricalProgress[];

    // Fetch quiz questions
    const quizQuery = `
      SELECT id, year, subject, topic, status
      FROM quizzes
      WHERE year = $1 AND subject = $2 AND topic = $3 AND status = 'published'
    `;

    const quizResult = await pool.query(quizQuery, [year, subject, topic]);
    if (quizResult.rows.length === 0) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    // Get questions
    const questionsQuery = `
      SELECT qq.id, question, options, correct_answers, hints, qq.topic, difficulty
      FROM quiz_questions qq
      JOIN quizzes q ON qq.quiz_id = q.id
      WHERE q.year = $1 AND q.subject = $2 AND q.topic = $3
      ORDER BY qq.id
    `;

    const questionsResult = await pool.query(questionsQuery, [year, subject, topic]);
    const questions = questionsResult.rows as Question[];

    if (questions.length === 0) {
      return res.status(404).json({ error: 'No questions available for this quiz' });
    }

    // Calculate initial ability and identify weak topics
    const initialAbility = calculateInitialAbility(historicalProgress, subject, year);
    const weakTopics = identifyWeakTopics(historicalProgress, subject, year);

    // Use all available questions, capped at maxQuestions if specified
    const totalQuestions = Math.min(questions.length, maxQuestions);

    // Create session
    const sessionId = `quiz_${userId}_${Date.now()}`;
    const session: QuizSession = {
      sessionId,
      userId,
      year,
      subject,
      topic,
      currentQuestionIndex: 0,
      currentQuestion: null,
      abilityEstimate: initialAbility,
      questionsAnswered: 0,
      totalScore: 0,
      currentTopicScore: 0,
      weakTopicScore: 0,
      totalQuestions,
      currentTopicQuestions: 0,
      weakTopicQuestions: 0,
      timeSpent: 0,
      startTime: new Date(),
      isCompleted: false,
      weakTopics,
      availableQuestions: questions,
      answeredQuestions: [],
      consecutiveWrongAnswers: 0,
      hintsUsed: 0,
      currentHintsUsed: 0
    };

    quizSessions.set(sessionId, session);

    res.json({
      sessionId,
      initialAbility,
      weakTopics,
      totalQuestions
    });

  } catch (error) {
    console.error('Error starting adaptive quiz:', error);
    res.status(500).json({ error: 'Failed to start quiz' });
  }
};

/* -------------------------------------------------------------------
   GET NEXT QUESTION
------------------------------------------------------------------- */
export const getNextQuestion = async (req: Request, res: Response) => {
  const { sessionId } = req.params;

  const session = quizSessions.get(sessionId);
  if (!session || session.isCompleted) {
    return res.status(404).json({ error: 'Session not found or completed' });
  }

  if (session.questionsAnswered >= session.totalQuestions) {
    session.isCompleted = true;
    return res.json({ completed: true });
  }

  // Select next question adaptively
  const nextQuestion = selectNextQuestion(session);

  if (!nextQuestion) {
    session.isCompleted = true;
    return res.json({ completed: true });
  }

  // Set current question and reset hint counter
  session.currentQuestion = nextQuestion;
  session.currentHintsUsed = 0;

  // Determine if this is a weak topic question
  const isWeakTopicQuestion = session.weakTopics.some(weakTopic =>
    weakTopic.includes(nextQuestion.topic)
  );

  res.json({
    id: nextQuestion.id,
    question: nextQuestion.question,
    options: nextQuestion.options,
    correct_answers: nextQuestion.correct_answers,
    hints: nextQuestion.hints,
    isWeakTopicQuestion,
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

  // SECURITY: Validate input parameters - answer can be number or array for multiple choice
  const isValidAnswer = (ans: any) => {
    if (typeof ans === 'number') {
      return ans >= 0 && ans <= 3;
    }
    if (Array.isArray(ans)) {
      return ans.every(a => typeof a === 'number' && a >= 0 && a <= 3);
    }
    return false;
  };

  if (!isValidAnswer(answer)) {
    return res.status(400).json({ error: 'Invalid answer format' });
  }

  if (typeof timeSpent !== 'number' || timeSpent < 0 || timeSpent > 300) {
    return res.status(400).json({ error: 'Invalid time spent' });
  }

  const session = quizSessions.get(sessionId);
  if (!session || session.isCompleted) {
    return res.status(404).json({ error: 'Session not found or completed' });
  }

  // SECURITY: Check if question was already answered
  if (session.answeredQuestions.includes(questionId)) {
    return res.status(400).json({ error: 'Question already answered' });
  }

  // Find the question
  const question = session.availableQuestions.find(q => q.id === questionId);
  if (!question) {
    return res.status(404).json({ error: 'Question not found' });
  }

  // SECURITY: Server-side answer validation (supports multiple correct answers)
  let isCorrect = false;
  if (Array.isArray(question.correct_answers)) {
    // Multiple choice question
    if (Array.isArray(answer)) {
      // Check if all selected answers are correct and all correct answers are selected
      isCorrect = answer.length === question.correct_answers.length &&
                  answer.every(a => question.correct_answers.includes(a));
    } else {
      // Single answer for multiple choice question (partial credit)
      isCorrect = question.correct_answers.includes(answer);
    }
  } else {
    // Single choice question
    isCorrect = Number(question.correct_answers) === answer;
  }

  // SECURITY: Log suspicious activity
  if (timeSpent < 2) {
    console.warn(`SECURITY: Suspiciously fast answer (${timeSpent}s) for question ${questionId}, user ${session.userId}`);
  }

  // Calculate score using adaptive scoring system
  const scoringRules = {
    basePoints: 10,
    timeBonus: 5,
    hintPenalty: 2, // Configurable hint penalty
    partialCredit: 0.5 // 50% credit for reasonable wrong answers
  };

  const timeLimitSeconds = 30;
  const answeredWithinTime = timeSpent <= timeLimitSeconds;

  const difficultyMultiplier = {
    'easy': 0.8,   // 8 points for easy
    'medium': 1.0, // 10 points for medium
    'hard': 1.2    // 12 points for hard
  };

  let baseScore = 0;
  let timeBonus = 0;
  let partialCredit = 0;

  if (isCorrect) {
    baseScore = scoringRules.basePoints * difficultyMultiplier[question.difficulty];
    if (answeredWithinTime) {
      timeBonus = scoringRules.timeBonus; // +5 points for answering within 30 seconds
    }
  } else {
    // Partial credit for reasonable wrong answers (option 1 in multiple choice)
    if (question.options && question.options.length >= 4 && answer === 1) {
      partialCredit = (scoringRules.basePoints * difficultyMultiplier[question.difficulty]) * scoringRules.partialCredit;
      baseScore = partialCredit;
    } else {
      baseScore = 0; // No points for clearly wrong answers
    }
    timeBonus = 0;
  }

  const totalPoints = baseScore + timeBonus;

  // Mark question as answered
  session.answeredQuestions.push(questionId);
  session.questionsAnswered++;
  session.totalScore += totalPoints;

  // Update session based on question type
  const isWeakTopicQuestion = session.weakTopics.some(weakTopic =>
    weakTopic.includes(question.topic)
  );

  if (isWeakTopicQuestion) {
    session.weakTopicQuestions++;
    if (isCorrect) session.weakTopicScore++;
  } else {
    session.currentTopicQuestions++;
    if (isCorrect) session.currentTopicScore++;
  }

  // Update ability estimate using IRT model
  session.abilityEstimate = updateAbilityEstimate(session.abilityEstimate, question.difficulty, isCorrect);
  session.timeSpent += timeSpent;

  // Update consecutive wrong answers for hint logic
  session.consecutiveWrongAnswers = isCorrect ? 0 : session.consecutiveWrongAnswers + 1;

  // Generate performance-based feedback
  const feedback = generatePerformanceFeedback(isCorrect, question.difficulty, answeredWithinTime, session.consecutiveWrongAnswers);

  res.json({
    isCorrect,
    baseScore,
    timeBonus,
    partialCredit,
    totalPoints,
    answeredWithinTime,
    feedback,
    abilityEstimate: session.abilityEstimate,
    isWeakTopicQuestion,
    sessionProgress: {
      current: session.questionsAnswered,
      total: session.totalQuestions,
      abilityEstimate: session.abilityEstimate
    }
  });
};

/* -------------------------------------------------------------------
   RESTART QUIZ SESSION (Allow re-attempts)
------------------------------------------------------------------- */
export const restartAdaptiveQuiz = async (req: Request, res: Response) => {
  const { userId, year, subject, topic, maxQuestions = 10 } = req.body;

  try {
    // Fetch historical progress
    const historicalProgress = await getMergedUserProgress(userId) as HistoricalProgress[];

    // Fetch quiz questions
    const quizQuery = `
      SELECT id, year, subject, topic, status
      FROM quizzes
      WHERE year = $1 AND subject = $2 AND topic = $3 AND status = 'published'
    `;

    const quizResult = await pool.query(quizQuery, [year, subject, topic]);
    if (quizResult.rows.length === 0) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    // Get questions
    const questionsQuery = `
      SELECT qq.id, question, options, correct_answers, hints, qq.topic, difficulty
      FROM quiz_questions qq
      JOIN quizzes q ON qq.quiz_id = q.id
      WHERE q.year = $1 AND q.subject = $2 AND q.topic = $3
      ORDER BY qq.id
    `;

    const questionsResult = await pool.query(questionsQuery, [year, subject, topic]);
    const questions = questionsResult.rows as Question[];

    if (questions.length === 0) {
      return res.status(404).json({ error: 'No questions available for this quiz' });
    }

    // Calculate initial ability and identify weak topics
    const initialAbility = calculateInitialAbility(historicalProgress, subject, year);
    const weakTopics = identifyWeakTopics(historicalProgress, subject, year);

    // Use all available questions, capped at maxQuestions if specified
    const totalQuestions = Math.min(questions.length, maxQuestions);

    // Create new session
    const sessionId = `quiz_${userId}_${Date.now()}`;
    const session: QuizSession = {
      sessionId,
      userId,
      year,
      subject,
      topic,
      currentQuestionIndex: 0,
      currentQuestion: null,
      abilityEstimate: initialAbility,
      questionsAnswered: 0,
      totalScore: 0,
      currentTopicScore: 0,
      weakTopicScore: 0,
      totalQuestions,
      currentTopicQuestions: 0,
      weakTopicQuestions: 0,
      timeSpent: 0,
      startTime: new Date(),
      isCompleted: false,
      weakTopics,
      availableQuestions: questions,
      answeredQuestions: [],
      consecutiveWrongAnswers: 0,
      hintsUsed: 0,
      currentHintsUsed: 0
    };

    quizSessions.set(sessionId, session);

    res.json({
      sessionId,
      initialAbility,
      weakTopics,
      totalQuestions,
      isRestart: true
    });

  } catch (error) {
    console.error('Error restarting adaptive quiz:', error);
    res.status(500).json({ error: 'Failed to restart quiz' });
  }
};

/* -------------------------------------------------------------------
   REQUEST HINT
------------------------------------------------------------------- */
export const requestHint = async (req: Request, res: Response) => {
  const { sessionId } = req.params;

  const session = quizSessions.get(sessionId);
  if (!session || session.isCompleted) {
    return res.status(404).json({ error: 'Session not found or completed' });
  }

  // Check if hints are available for current question
  if (!session.currentQuestion || session.currentQuestion.hints.length === 0) {
    return res.status(400).json({ error: 'No hints available for this question' });
  }

  // Adaptive hint threshold based on ability estimate
  const hintThreshold = getHintThreshold(session.abilityEstimate);
  if (session.consecutiveWrongAnswers < hintThreshold) {
    return res.status(400).json({
      error: 'Hint not available yet',
      requiredWrongAttempts: hintThreshold,
      currentWrongAttempts: session.consecutiveWrongAnswers
    });
  }

  // Get next available hint
  const nextHintIndex = session.currentHintsUsed;
  if (nextHintIndex >= session.currentQuestion.hints.length) {
    return res.status(400).json({ error: 'All hints used for this question' });
  }

  const hint = session.currentQuestion.hints[nextHintIndex];

  // Apply hint penalty
  const hintPenalty = 2; // Configurable penalty points
  session.totalScore = Math.max(0, session.totalScore - hintPenalty);
  session.hintsUsed++;
  session.currentHintsUsed++;

  res.json({
    hint,
    hintIndex: nextHintIndex,
    penalty: hintPenalty,
    totalScore: session.totalScore,
    hintsRemaining: session.currentQuestion.hints.length - session.currentHintsUsed
  });
};

/* -------------------------------------------------------------------
   GET QUIZ RESULTS
------------------------------------------------------------------- */
export const getQuizResults = async (req: Request, res: Response) => {
  const { sessionId } = req.params;

  const session = quizSessions.get(sessionId);
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }

  const currentTopicPercentage = session.currentTopicQuestions > 0
    ? (session.currentTopicScore / session.currentTopicQuestions) * 100
    : 0;

  const weakTopicPercentage = session.weakTopicQuestions > 0
    ? (session.weakTopicScore / session.weakTopicQuestions) * 100
    : 0;

  // Save results to database
  try {
    await saveQuizResults(session, currentTopicPercentage);
  } catch (error) {
    console.error('Error saving quiz results:', error);
  }

  // Clean up session
  quizSessions.delete(sessionId);

  res.json({
    sessionId: session.sessionId,
    userId: session.userId,
    totalQuestions: session.totalQuestions,
    questionsAnswered: session.questionsAnswered,

    // Current topic results (official quiz score)
    currentTopicScore: session.currentTopicScore,
    currentTopicQuestions: session.currentTopicQuestions,
    currentTopicPercentage: Math.round(currentTopicPercentage),
    quizPassed: currentTopicPercentage >= 75, // 75% mastery threshold

    // Weak topic results (remediation feedback)
    weakTopicScore: session.weakTopicScore,
    weakTopicQuestions: session.weakTopicQuestions,
    weakTopicPercentage: Math.round(weakTopicPercentage),

    // Overall session stats
    totalScore: session.totalScore,
    timeSpent: session.timeSpent,
    abilityEstimate: session.abilityEstimate,
    weakTopics: session.weakTopics
  });
};

/* -------------------------------------------------------------------
   GET QUIZ PROGRESS FOR STUDENT
------------------------------------------------------------------- */
export const getQuizProgress = async (req: Request, res: Response) => {
  const { userId, year, subject, topic } = req.params;

  try {
    const query = `
      SELECT passed, last_score, best_score, total_attempts, last_activity
      FROM student_quiz_progress
      WHERE user_id = $1 AND year = $2 AND subject = $3 AND topic = $4
      ORDER BY last_activity DESC
      LIMIT 1
    `;

    const result = await pool.query(query, [userId, year, subject, topic]);

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

/* -------------------------------------------------------------------
   HELPER FUNCTIONS
------------------------------------------------------------------- */

function calculateInitialAbility(progress: HistoricalProgress[], subject: string, year: number): number {
  const relevantProgress = progress.filter(p =>
    (!subject || p.subject === subject) &&
    (!year || p.year === year)
  );

  if (relevantProgress.length === 0) return 0.5;

  const weightedSum = relevantProgress.reduce((sum, p) => {
    const weight = p.quizPassed ? 1.2 : 0.8;
    return sum + (p.topicProgress / 100) * weight;
  }, 0);

  const totalWeight = relevantProgress.reduce((sum, p) => {
    return sum + (p.quizPassed ? 1.2 : 0.8);
  }, 0);

  const averageProgress = weightedSum / totalWeight;
  return Math.max(0.2, Math.min(0.9, averageProgress));
}

function identifyWeakTopics(progress: HistoricalProgress[], subject: string, year: number): string[] {
  return progress
    .filter(p => {
      const isSameSubject = !subject || p.subject === subject;
      const isSameYear = !year || p.year === year;
      const isWeak = p.topicProgress < 50 || !p.quizPassed;
      return isWeak && isSameSubject && isSameYear;
    })
    .map(p => `${p.year}-${p.subject}-${p.topic}`)
    .slice(0, 3);
}

function selectNextQuestion(session: QuizSession): Question | null {
  if (session.questionsAnswered >= session.totalQuestions) return null;

  // First 30% of questions: prioritize weak topics
  const isRemediationPhase = session.questionsAnswered < session.totalQuestions * 0.3;

  if (isRemediationPhase && session.weakTopics.length > 0) {
    const weakTopicQuestions = session.availableQuestions.filter(q =>
      session.weakTopics.some(weakTopic => weakTopic.includes(q.topic)) &&
      !session.answeredQuestions.includes(q.id)
    );

    if (weakTopicQuestions.length > 0) {
      const targetDifficulty = getTargetDifficulty(session.abilityEstimate);
      const candidates = weakTopicQuestions.filter(q =>
        getDifficultyScore(q.difficulty) <= targetDifficulty + 0.3 &&
        getDifficultyScore(q.difficulty) >= targetDifficulty - 0.3
      );

      if (candidates.length > 0) {
        return candidates[Math.floor(Math.random() * candidates.length)];
      }
    }
  }

  // Regular adaptive selection
  const availableQuestions = session.availableQuestions.filter(q =>
    !session.answeredQuestions.includes(q.id)
  );

  if (availableQuestions.length === 0) return null;

  const targetDifficulty = getTargetDifficulty(session.abilityEstimate);
  const candidates = availableQuestions.filter(q =>
    getDifficultyScore(q.difficulty) <= targetDifficulty + 0.3 &&
    getDifficultyScore(q.difficulty) >= targetDifficulty - 0.3
  );

  return candidates.length > 0
    ? candidates[Math.floor(Math.random() * candidates.length)]
    : availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
}

function getTargetDifficulty(ability: number): number {
  if (ability < 0.4) return 0.3; // Easy
  if (ability < 0.7) return 0.5; // Medium
  return 0.7; // Hard
}

function getHintThreshold(ability: number): number {
  if (ability < 0.3) return 2; // Low ability: hints available after 2 wrong attempts
  if (ability < 0.6) return 3; // Medium ability: hints available after 3 wrong attempts
  return 4; // High ability: hints available after 4 wrong attempts
}

function getDifficultyScore(difficulty: string): number {
  switch (difficulty) {
    case 'easy': return 0.3;
    case 'medium': return 0.5;
    case 'hard': return 0.7;
    default: return 0.5;
  }
}

function updateAbilityEstimate(currentAbility: number, difficulty: string, isCorrect: boolean): number {
  const difficultyScore = getDifficultyScore(difficulty);
  const expectedScore = 1 / (1 + Math.exp(-(currentAbility - difficultyScore)));
  const delta = 0.1 * (isCorrect ? 1 - expectedScore : -expectedScore);
  return Math.max(0.1, Math.min(0.9, currentAbility + delta));
}

function generatePerformanceFeedback(isCorrect: boolean, difficulty: string, answeredWithinTime: boolean, consecutiveWrongAnswers: number): string {
  if (isCorrect) {
    let feedback = "Bagus! ";
    if (answeredWithinTime) {
      feedback += "Anda menjawab dengan cepat dan betul. ";
    } else {
      feedback += "Anda mendapat jawapan yang betul. ";
    }

    if (difficulty === 'hard') {
      feedback += "Soalan ini mencabar - anda lakukan dengan baik!";
    } else if (difficulty === 'medium') {
      feedback += "Pemahaman yang kukuh ditunjukkan di sini.";
    } else {
      feedback += "Teruskan usaha yang baik!";
    }
    return feedback;
  } else {
    let feedback = "Tidak betul sepenuhnya. ";
    if (consecutiveWrongAnswers > 1) {
      feedback += "Pertimbangkan menggunakan petunjuk jika tersedia. ";
    }

    if (difficulty === 'easy') {
      feedback += "Ini adalah konsep asas - semak semula asas.";
    } else if (difficulty === 'medium') {
      feedback += "Konsep ini memerlukan lebih banyak latihan.";
    } else {
      feedback += "Ini mencabar - jangan risau, terus cuba!";
    }
    return feedback;
  }
}

async function saveQuizResults(session: QuizSession, currentTopicPercentage: number) {
  // Get quiz ID for the attempt logging
  const quizQuery = await pool.query(
    `SELECT id FROM quizzes WHERE year = $1 AND subject = $2 AND topic = $3`,
    [session.year, session.subject, session.topic]
  );

  if (quizQuery.rows.length === 0) {
    throw new Error('Quiz not found for attempt logging');
  }

  const quizId = quizQuery.rows[0].id;

  // Get next attempt number for this user and quiz
  const attemptQuery = await pool.query(
    `SELECT COALESCE(MAX(attempt_number), 0) + 1 as next_attempt
     FROM quiz_attempt
     WHERE user_id = $1 AND quiz_id = $2`,
    [session.userId, quizId]
  );

  const attemptNumber = attemptQuery.rows[0].next_attempt;

  // Save detailed attempt to quiz_attempt table
  await pool.query(
    `INSERT INTO quiz_attempt
      (user_id, quiz_id, attempt_number, score, time_taken, questions_answered, total_questions, ability_estimate, passed)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
    [
      session.userId,
      quizId,
      attemptNumber,
      Math.round(currentTopicPercentage),
      session.timeSpent,
      session.questionsAnswered,
      session.totalQuestions,
      session.abilityEstimate,
      currentTopicPercentage >= 75 // 75% mastery threshold
    ]
  );

  // Save to quiz progress (aggregated data)
  await pool.query(
    `INSERT INTO student_quiz_progress
      (user_id, year, subject, topic, difficulty_level,
       total_attempts, correct_attempts, best_score, last_score, passed, last_activity)
     VALUES ($1, $2, $3, $4, 'adaptive', 1, $5, $6, $6, $7, NOW())
     ON CONFLICT (user_id, year, subject, topic)
     DO UPDATE SET
       total_attempts = student_quiz_progress.total_attempts + 1,
       correct_attempts = CASE WHEN $6 > student_quiz_progress.last_score
                               THEN student_quiz_progress.correct_attempts + $5
                               ELSE student_quiz_progress.correct_attempts END,
       best_score = GREATEST(student_quiz_progress.best_score, $6),
       last_score = $6,
       passed = $7,
       last_activity = NOW()`,
    [
      session.userId,
      session.year,
      session.subject,
      session.topic,
      session.currentTopicScore,
      Math.round(currentTopicPercentage),
      currentTopicPercentage >= 60
    ]
  );
}


