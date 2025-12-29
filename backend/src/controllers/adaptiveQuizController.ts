import { Request, Response } from 'express';
import pool from '../config/db';
import { getMergedUserProgress } from '../models/mergedProgressModel';

interface Question {
  id: number;
  question: string;
  options: string[];
  correct_answer: number;
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
      SELECT id, question, options, correct_answer, hints, topic, difficulty
      FROM quiz_questions qq
      JOIN quizzes q ON qq.quiz_id = q.id
      WHERE q.year = $1 AND q.subject = $2 AND q.topic = $3
      ORDER BY qq.id
    `;

    const questionsResult = await pool.query(questionsQuery, [year, subject, topic]);
    const questions = questionsResult.rows as Question[];

    // Calculate initial ability and identify weak topics
    const initialAbility = calculateInitialAbility(historicalProgress, subject, year);
    const weakTopics = identifyWeakTopics(historicalProgress, subject, year);

    // Create session
    const sessionId = `quiz_${userId}_${Date.now()}`;
    const session: QuizSession = {
      sessionId,
      userId,
      year,
      subject,
      topic,
      currentQuestionIndex: 0,
      abilityEstimate: initialAbility,
      questionsAnswered: 0,
      totalScore: 0,
      currentTopicScore: 0,
      weakTopicScore: 0,
      totalQuestions: maxQuestions,
      currentTopicQuestions: 0,
      weakTopicQuestions: 0,
      timeSpent: 0,
      startTime: new Date(),
      isCompleted: false,
      weakTopics,
      availableQuestions: questions,
      answeredQuestions: [],
      consecutiveWrongAnswers: 0,
      hintsUsed: 0
    };

    quizSessions.set(sessionId, session);

    res.json({
      sessionId,
      initialAbility,
      weakTopics,
      totalQuestions: maxQuestions
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

  // Mark as answered
  session.answeredQuestions.push(nextQuestion.id);
  session.questionsAnswered++;

  // Determine if this is a weak topic question
  const isWeakTopicQuestion = session.weakTopics.some(weakTopic =>
    weakTopic.includes(nextQuestion.topic)
  );

  if (isWeakTopicQuestion) {
    session.weakTopicQuestions++;
  } else {
    session.currentTopicQuestions++;
  }

  res.json({
    question: {
      id: nextQuestion.id,
      question: nextQuestion.question,
      options: nextQuestion.options,
      hints: nextQuestion.hints,
      isWeakTopicQuestion
    },
    progress: {
      current: session.questionsAnswered,
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

  const session = quizSessions.get(sessionId);
  if (!session || session.isCompleted) {
    return res.status(404).json({ error: 'Session not found or completed' });
  }

  // Find the question
  const question = session.availableQuestions.find(q => q.id === questionId);
  if (!question) {
    return res.status(404).json({ error: 'Question not found' });
  }

  const isCorrect = question.correct_answer === answer;
  const timeLimitSeconds = 30; // 30 seconds per question
  const answeredWithinTime = timeSpent <= timeLimitSeconds;

  // Calculate base score with difficulty weighting
  const difficultyMultiplier = {
    'easy': 0.8,   // 8 points for easy
    'medium': 1.0, // 10 points for medium
    'hard': 1.2    // 12 points for hard
  };

  let score = 0;
  let timeBonus = 0;
  let partialCredit = 0;

  if (isCorrect) {
    score = 10 * difficultyMultiplier[question.difficulty];
    if (answeredWithinTime) {
      timeBonus = 5; // Bonus for answering within time
    }
  } else {
    // Partial credit for reasonable wrong answers in multiple choice
    // Assuming 4 options (0-3), and option 1 is most reasonable distractor
    if (question.options && question.options.length >= 4 && answer === 1) {
      partialCredit = (10 * difficultyMultiplier[question.difficulty]) * 0.5; // 50% credit
      score = partialCredit;
    } else {
      score = 0; // No points for clearly wrong answers
    }
    timeBonus = 0;
  }

  // Update session based on question type
  const isWeakTopicQuestion = session.weakTopics.some(weakTopic =>
    weakTopic.includes(question.topic)
  );

  if (isWeakTopicQuestion) {
    if (isCorrect) session.weakTopicScore++;
  } else {
    if (isCorrect) session.currentTopicScore++;
  }

  // Update ability estimate (simplified IRT model)
  session.abilityEstimate = updateAbilityEstimate(session.abilityEstimate, question.difficulty, isCorrect);
  session.timeSpent += timeSpent;

  // Update consecutive wrong answers for hint logic
  session.consecutiveWrongAnswers = isCorrect ? 0 : session.consecutiveWrongAnswers + 1;

  // Generate performance-based feedback instead of explanation
  const feedback = generatePerformanceFeedback(isCorrect, question.difficulty, answeredWithinTime, session.consecutiveWrongAnswers);

  res.json({
    isCorrect,
    score,
    timeBonus,
    partialCredit,
    totalPoints: score + timeBonus,
    answeredWithinTime,
    feedback,
    abilityEstimate: session.abilityEstimate,
    isWeakTopicQuestion
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
      SELECT id, question, options, correct_answer, hints, topic, difficulty
      FROM quiz_questions qq
      JOIN quizzes q ON qq.quiz_id = q.id
      WHERE q.year = $1 AND q.subject = $2 AND q.topic = $3
      ORDER BY qq.id
    `;

    const questionsResult = await pool.query(questionsQuery, [year, subject, topic]);
    const questions = questionsResult.rows as Question[];

    // Calculate initial ability and identify weak topics
    const initialAbility = calculateInitialAbility(historicalProgress, subject, year);
    const weakTopics = identifyWeakTopics(historicalProgress, subject, year);

    // Create new session
    const sessionId = `quiz_${userId}_${Date.now()}`;
    const session: QuizSession = {
      sessionId,
      userId,
      year,
      subject,
      topic,
      currentQuestionIndex: 0,
      abilityEstimate: initialAbility,
      questionsAnswered: 0,
      totalScore: 0,
      currentTopicScore: 0,
      weakTopicScore: 0,
      totalQuestions: maxQuestions,
      currentTopicQuestions: 0,
      weakTopicQuestions: 0,
      timeSpent: 0,
      startTime: new Date(),
      isCompleted: false,
      weakTopics,
      availableQuestions: questions,
      answeredQuestions: [],
      consecutiveWrongAnswers: 0,
      hintsUsed: 0
    };

    quizSessions.set(sessionId, session);

    res.json({
      sessionId,
      initialAbility,
      weakTopics,
      totalQuestions: maxQuestions,
      isRestart: true
    });

  } catch (error) {
    console.error('Error restarting adaptive quiz:', error);
    res.status(500).json({ error: 'Failed to restart quiz' });
  }
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
    let feedback = "Great job! ";
    if (answeredWithinTime) {
      feedback += "You answered quickly and correctly. ";
    } else {
      feedback += "You got it right. ";
    }

    if (difficulty === 'hard') {
      feedback += "This was a challenging question - you're doing well!";
    } else if (difficulty === 'medium') {
      feedback += "Solid understanding shown here.";
    } else {
      feedback += "Keep up the good work!";
    }
    return feedback;
  } else {
    let feedback = "Not quite right. ";
    if (consecutiveWrongAnswers > 1) {
      feedback += "Consider using a hint if available. ";
    }

    if (difficulty === 'easy') {
      feedback += "This was a basic concept - review the fundamentals.";
    } else if (difficulty === 'medium') {
      feedback += "This concept needs more practice.";
    } else {
      feedback += "This was challenging - don't worry, keep trying!";
    }
    return feedback;
  }
}

async function saveQuizResults(session: QuizSession, currentTopicPercentage: number) {
  // Save to quiz progress
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
