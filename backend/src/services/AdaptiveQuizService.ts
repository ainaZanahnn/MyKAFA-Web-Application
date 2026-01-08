import { Question, QuizSession, HistoricalProgress } from '../types/adaptiveQuizTypes';
import { calculateInitialAbility, identifyWeakTopics, selectNextQuestion, updateAbilityEstimate, generatePerformanceFeedback } from '../utils/adaptiveQuizUtils';
import pool from '../config/db';

export class AdaptiveQuizService {

  async startAdaptiveQuiz(userId: number, year: number, subject: string, topic: string, maxQuestions: number = 10) {
    // Fetch historical progress
    const historicalProgress = await this.getHistoricalProgress(userId);

    // Fetch questions
    const questions = await this.getQuizQuestions(year, subject, topic);

    if (questions.length === 0) {
      throw new Error('No questions available for this quiz');
    }

    // Calculate initial ability and identify weak topics
    const initialAbility = calculateInitialAbility(historicalProgress, subject, year);
    const weakTopics = await this.identifyWeakTopicsFromTable(userId, year, subject);

    const totalQuestions = Math.min(questions.length, maxQuestions);

    return {
      initialAbility,
      weakTopics,
      totalQuestions,
      questions
    };
  }

  createQuizSession(sessionData: Partial<QuizSession>): QuizSession {
    const sessionId = `quiz_${sessionData.userId}_${Date.now()}`;

    return {
      sessionId,
      userId: sessionData.userId!,
      year: sessionData.year!,
      subject: sessionData.subject!,
      topic: sessionData.topic!,
      currentQuestionIndex: 0,
      currentQuestion: null,
      abilityEstimate: sessionData.abilityEstimate || 0.5,
      questionsAnswered: 0,
      uniqueQuestionsAnswered: 0,
      totalScore: 0,
      currentTopicScore: 0,
      weakTopicScore: 0,
      totalQuestions: sessionData.totalQuestions!,
      currentTopicQuestions: 0,
      weakTopicQuestions: 0,
      timeSpent: 0,
      startTime: new Date(),
      isCompleted: false,
      weakTopics: sessionData.weakTopics || [],
      availableQuestions: sessionData.availableQuestions || [],
      answeredQuestions: [],
      consecutiveWrongAnswers: 0,
      hintsUsed: 0,
      currentHintsUsed: 0,
      questionAttempts: new Map(),
      incorrectQuestions: []
    };
  }

  getNextQuestion(session: QuizSession): Question | null {
    if (session.questionsAnswered >= session.totalQuestions) return null;
    return selectNextQuestion(session);
  }

  async submitAnswer(session: QuizSession, questionId: number, answer: any, timeSpent: number) {
    // Validate answer format
    const isValidAnswer = (ans: any) => {
      if (typeof ans === 'string') return ans.length > 0;
      if (Array.isArray(ans)) return ans.every(a => typeof a === 'string' && a.length > 0);
      return false;
    };

    if (!isValidAnswer(answer)) {
      throw new Error('Invalid answer format');
    }

    if (typeof timeSpent !== 'number' || timeSpent < 0 || timeSpent > 300) {
      throw new Error('Invalid time spent');
    }

    // Find and validate question
    const question = session.availableQuestions.find(q => q.id === questionId);
    if (!question) {
      throw new Error('Question not found');
    }

    // Check if question already answered correctly
    const isRepeatedQuestion = session.answeredQuestions.includes(questionId);
    if (isRepeatedQuestion && !session.incorrectQuestions.includes(questionId)) {
      throw new Error('Question already answered correctly');
    }

    // Validate answer correctness
    const isCorrect = this.validateAnswer(question, answer);

    // Update question attempts tracking
    this.updateQuestionAttempts(session, questionId, isCorrect);

    // Calculate score
    const scoreResult = this.calculateScore(question, isCorrect, timeSpent, session.currentHintsUsed, answer);

    // Update session state
    this.updateSessionState(session, question, isCorrect, scoreResult.totalPoints, timeSpent);

    // Update ability estimate
    session.abilityEstimate = updateAbilityEstimate(session.abilityEstimate, question.difficulty, isCorrect);

    // Update weak topics in real-time
    try {
      await this.updateWeakTopicsRealtime(session, question, isCorrect, isRepeatedQuestion);
    } catch (error) {
      console.error('Error updating weak topics:', error);
    }

    // Generate feedback
    const feedback = generatePerformanceFeedback(isCorrect, question.difficulty, scoreResult.answeredWithinTime, session.consecutiveWrongAnswers);

    return {
      isCorrect,
      ...scoreResult,
      feedback,
      abilityEstimate: session.abilityEstimate,
      sessionProgress: {
        current: session.questionsAnswered,
        total: session.totalQuestions,
        abilityEstimate: session.abilityEstimate
      }
    };
  }

  async requestHint(session: QuizSession) {
    if (!session.currentQuestion || session.currentQuestion.hints.length === 0) {
      throw new Error('No hints available for this question');
    }

    const questionId = session.currentQuestion.id;
    const questionAttempts = session.questionAttempts.get(questionId) || { attempts: 0, correct: false, hintsUsed: 0 };
    const wrongAttemptsForQuestion = questionAttempts.attempts - (questionAttempts.correct ? 1 : 0);

    const hintThreshold = this.getHintThreshold(session.abilityEstimate);
    if (wrongAttemptsForQuestion < hintThreshold) {
      throw new Error(`Hint not available yet. Required wrong attempts: ${hintThreshold}, current: ${wrongAttemptsForQuestion}`);
    }

    if (session.currentHintsUsed >= session.currentQuestion.hints.length) {
      throw new Error('All hints used for this question');
    }

    const hint = session.currentQuestion.hints[session.currentHintsUsed];
    const hintPenalty = 2;

    session.totalScore = Math.max(0, session.totalScore - hintPenalty);
    session.hintsUsed++;
    session.currentHintsUsed++;

    return {
      hint,
      hintIndex: session.currentHintsUsed - 1,
      penalty: hintPenalty,
      totalScore: session.totalScore,
      hintsRemaining: session.currentQuestion.hints.length - session.currentHintsUsed
    };
  }

  async getQuizResults(session: QuizSession) {
    const currentTopicPercentage = session.currentTopicQuestions > 0
      ? (session.currentTopicScore / session.currentTopicQuestions) * 100
      : 0;

    const weakTopicPercentage = session.weakTopicQuestions > 0
      ? (session.weakTopicScore / session.weakTopicQuestions) * 100
      : 0;

    // Save results to database
    try {
      await this.saveQuizResults(session, currentTopicPercentage);
    } catch (error) {
      console.error('Error saving quiz results:', error);
    }

    return {
      sessionId: session.sessionId,
      userId: session.userId,
      totalQuestions: session.totalQuestions,
      questionsAnswered: session.questionsAnswered,
      currentTopicScore: session.currentTopicScore,
      currentTopicQuestions: session.currentTopicQuestions,
      currentTopicPercentage: Math.round(currentTopicPercentage),
      quizPassed: currentTopicPercentage >= 75,
      weakTopicScore: session.weakTopicScore,
      weakTopicQuestions: session.weakTopicQuestions,
      weakTopicPercentage: Math.round(weakTopicPercentage),
      totalScore: session.totalScore,
      timeSpent: session.timeSpent,
      abilityEstimate: session.abilityEstimate,
      weakTopics: session.weakTopics
    };
  }

  private validateAnswer(question: Question, answer: any): boolean {
    if (Array.isArray(question.correct_answers)) {
      if (question.correct_answers.length === 1) {
        return question.correct_answers[0] === answer;
      } else {
        if (Array.isArray(answer)) {
          return answer.length === question.correct_answers.length &&
                 answer.every(a => question.correct_answers.includes(a));
        } else {
          return question.correct_answers.includes(answer);
        }
      }
    }
    return question.correct_answers === answer;
  }

  private updateQuestionAttempts(session: QuizSession, questionId: number, isCorrect: boolean) {
    const existingAttempts = session.questionAttempts.get(questionId) || { attempts: 0, correct: false, hintsUsed: 0 };
    const newAttempts = existingAttempts.attempts + 1;
    session.questionAttempts.set(questionId, {
      attempts: newAttempts,
      correct: isCorrect,
      hintsUsed: existingAttempts.hintsUsed
    });

    // Track incorrect questions for repetition
    if (!isCorrect && !session.incorrectQuestions.includes(questionId)) {
      session.incorrectQuestions.push(questionId);
    }
    if (isCorrect && session.incorrectQuestions.includes(questionId)) {
      session.incorrectQuestions = session.incorrectQuestions.filter(id => id !== questionId);
    }
  }

  private calculateScore(question: Question, isCorrect: boolean, timeSpent: number, hintsUsed: number, studentAnswer: any) {
    const scoringRules = {
      basePoints: 10,
      timeBonus: 5,
      hintPenalty: 2,
      partialCredit: 0.5
    };

    const timeLimitSeconds = 30;
    const answeredWithinTime = timeSpent <= timeLimitSeconds;

    const difficultyMultiplier = {
      'easy': 0.8,
      'medium': 1.0,
      'hard': 1.2
    };

    let baseScore = 0;
    let timeBonus = 0;
    let partialCredit = 0;

    if (isCorrect) {
      baseScore = scoringRules.basePoints * difficultyMultiplier[question.difficulty];
      if (answeredWithinTime) {
        timeBonus = scoringRules.timeBonus;
      }
    } else {
      // Proportional partial credit for multiple choice questions
      if (question.options && question.options.length >= 4 &&
          Array.isArray(question.correct_answers) && question.correct_answers.length > 1) {

        // Calculate how many correct answers were selected
        const correctAnswersSelected = this.calculateCorrectAnswersSelected(question.correct_answers, studentAnswer);
        const totalCorrectAnswers = question.correct_answers.length;

        // Proportional scoring: (correct selected / total correct) * base points
        if (correctAnswersSelected > 0) {
          const proportionCorrect = correctAnswersSelected / totalCorrectAnswers;
          partialCredit = (scoringRules.basePoints * difficultyMultiplier[question.difficulty]) * proportionCorrect;
          baseScore = partialCredit;
        }
        // If correctAnswersSelected === 0, baseScore remains 0 (no marks for all wrong)
      }
    }

    const totalPoints = baseScore + timeBonus;

    return {
      baseScore,
      timeBonus,
      partialCredit,
      totalPoints,
      answeredWithinTime
    };
  }

  private calculateCorrectAnswersSelected(correctAnswers: string[], studentAnswer: any): number {
    if (!Array.isArray(studentAnswer)) {
      // Single answer - check if it's correct
      return correctAnswers.includes(studentAnswer) ? 1 : 0;
    }

    // Multiple answers - count how many selected answers are correct
    return studentAnswer.filter(answer => correctAnswers.includes(answer)).length;
  }

  private updateSessionState(session: QuizSession, question: Question, isCorrect: boolean, points: number, timeSpent: number) {
    session.answeredQuestions.push(question.id);
    session.questionsAnswered++;
    session.totalScore += points;
    session.timeSpent += timeSpent;

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

    session.consecutiveWrongAnswers = isCorrect ? 0 : session.consecutiveWrongAnswers + 1;
  }

  private getHintThreshold(ability: number): number {
    if (ability < 0.3) return 2;
    if (ability < 0.6) return 3;
    return 4;
  }

  private async getHistoricalProgress(userId: number): Promise<HistoricalProgress[]> {
    try {
      const query = `
        SELECT year, subject, topic, topic_progress, quiz_score, quiz_passed, materials_viewed, total_materials
        FROM merged_user_progress
        WHERE user_id = $1
        ORDER BY year DESC, subject, topic
      `;
      const result = await pool.query(query, [userId]);
      return result.rows.map(row => ({
        year: row.year,
        subject: row.subject,
        topic: row.topic,
        topicProgress: row.topic_progress,
        quizScore: row.quiz_score,
        quizPassed: row.quiz_passed,
        materialsViewed: row.materials_viewed,
        totalMaterials: row.total_materials
      }));
    } catch (error) {
      console.error('Error fetching historical progress:', error);
      return [];
    }
  }

  private async getQuizQuestions(year: number, subject: string, topic: string): Promise<Question[]> {
    try {
      const questionsQuery = `
        SELECT qq.id, question, options, correct_answers::jsonb as correct_answers, hints, qq.topic, difficulty
        FROM quiz_questions qq
        JOIN quizzes q ON qq.quiz_id = q.id
        WHERE q.year = $1 AND q.subject = $2 AND q.topic = $3
        ORDER BY qq.id
      `;
      const result = await pool.query(questionsQuery, [year, subject, topic]);
      return result.rows as Question[];
    } catch (error) {
      console.error('Error fetching quiz questions:', error);
      return [];
    }
  }

  private async identifyWeakTopicsFromTable(userId: number, year: number, subject: string): Promise<string[]> {
    try {
      const query = `
        SELECT topic, weakness_score
        FROM student_weak_topics
        WHERE user_id = $1 AND year = $2 AND subject = $3 AND weakness_score > 0.3
        ORDER BY weakness_score DESC
        LIMIT 3
      `;
      const result = await pool.query(query, [userId, year, subject]);
      return result.rows.map(row => `${year}-${subject}-${row.topic}`);
    } catch (error) {
      console.error('Error identifying weak topics from table:', error);
      return [];
    }
  }

  private async updateWeakTopicsRealtime(session: QuizSession, question: Question, isCorrect: boolean, isRepeatedQuestion: boolean = false) {
    const topicKey = `${question.year || session.year}-${question.subject || session.subject}-${question.topic}`;

    // Get current weakness score for this topic
    const currentQuery = await pool.query(
      `SELECT weakness_score FROM student_weak_topics
       WHERE user_id = $1 AND year = $2 AND subject = $3 AND topic = $4`,
      [session.userId, question.year || session.year, question.subject || session.subject, question.topic]
    );

    let currentScore = 0.5; // Default starting score
    if (currentQuery.rows.length > 0) {
      currentScore = parseFloat(currentQuery.rows[0].weakness_score);
    }

    // Calculate new weakness score based on performance
    let newScore = currentScore;

    // Apply weighted updates for repeated questions (60% less impact)
    const repetitionWeight = isRepeatedQuestion ? 0.4 : 1.0;

    if (isCorrect) {
      // Reduce weakness score when correct (improve faster for weak topics)
      const improvementRate = currentScore > 0.7 ? 0.05 : 0.03; // Faster improvement for very weak topics
      const weightedImprovement = improvementRate * repetitionWeight;
      newScore = Math.max(0.0, currentScore - weightedImprovement);
    } else {
      // Increase weakness score when incorrect
      const declineRate = currentScore < 0.3 ? 0.08 : 0.05; // Faster decline for strong topics
      const weightedDecline = declineRate * repetitionWeight;
      newScore = Math.min(1.0, currentScore + weightedDecline);
    }

    // Determine improvement trend
    let improvementTrend = 'stable';
    if (newScore < currentScore) {
      improvementTrend = 'improving';
    } else if (newScore > currentScore) {
      improvementTrend = 'declining';
    }

    // Update or insert weak topic record
    await pool.query(
      `INSERT INTO student_weak_topics
        (user_id, year, subject, topic, weakness_score, last_updated, improvement_trend, remediation_attempts)
       VALUES ($1, $2, $3, $4, $5, NOW(), $6, 1)
       ON CONFLICT (user_id, year, subject, topic)
       DO UPDATE SET
         weakness_score = $5,
         last_updated = NOW(),
         improvement_trend = $6,
         remediation_attempts = student_weak_topics.remediation_attempts + 1`,
      [
        session.userId,
        question.year || session.year,
        question.subject || session.subject,
        question.topic,
        newScore,
        improvementTrend
      ]
    );

    // If topic is no longer weak (score < 0.3), consider removing from active weak topics
    if (newScore < 0.3) {
      // Optionally remove from session's weak topics list for future questions
      session.weakTopics = session.weakTopics.filter(wt => !wt.includes(question.topic));
    }
  }

  private async saveQuizResults(session: QuizSession, currentTopicPercentage: number) {
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
       FROM quiz_attempts
       WHERE user_id = $1 AND quiz_id = $2`,
      [session.userId, quizId]
    );

    const attemptNumber = attemptQuery.rows[0].next_attempt;

    // Save detailed attempt to quiz_attempts table
    await pool.query(
      `INSERT INTO quiz_attempts
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

    // Save to quiz progress (aggregated data) using the updated recordQuizAttempt function
    await this.recordQuizAttempt(
      session.userId,
      quizId,
      Math.round(currentTopicPercentage),
      session.totalQuestions,
      'adaptive'
    );
  }

  private async recordQuizAttempt(userId: number, quizId: number, score: number, totalQuestions: number, quizType: string) {
    try {
      // Get existing progress
      const existingQuery = `
        SELECT passed, last_score, best_score, total_attempts, last_activity
        FROM student_quiz_progress
        WHERE user_id = $1 AND quiz_id = $2
      `;
      const existingResult = await pool.query(existingQuery, [userId, quizId]);

      const currentAttemptPassed = score >= 75; // 75% mastery threshold
      const now = new Date();

      if (existingResult.rows.length > 0) {
        const existing = existingResult.rows[0];
        const newAttempts = existing.total_attempts + 1;
        const newBestScore = Math.max(existing.best_score || 0, score);

        // For adaptive learning: once passed, status remains passed (persistent mastery)
        const persistentPassed = existing.passed || currentAttemptPassed;

        await pool.query(
          `UPDATE student_quiz_progress
           SET passed = $1, last_score = $2, best_score = $3, total_attempts = $4, last_activity = $5
           WHERE user_id = $6 AND quiz_id = $7`,
          [persistentPassed, score, newBestScore, newAttempts, now, userId, quizId]
        );
      } else {
        await pool.query(
          `INSERT INTO student_quiz_progress
            (user_id, quiz_id, passed, last_score, best_score, total_attempts, last_activity)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [userId, quizId, currentAttemptPassed, score, score, 1, now]
        );
      }
    } catch (error) {
      console.error('Error recording quiz attempt:', error);
    }
  }
}
