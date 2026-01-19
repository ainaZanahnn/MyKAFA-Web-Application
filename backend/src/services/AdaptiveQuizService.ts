import { Question, QuizSession, HistoricalProgress } from '../types/adaptiveQuizTypes';
import { calculateInitialAbility, identifyWeakTopics, selectNextQuestion, updateAbilityEstimate, generatePerformanceFeedback, isTopicMatch } from '../utils/adaptiveQuizUtils';
import pool from '../config/db';
import { getMergedUserProgress } from '../models/mergedProgressModel';

export class AdaptiveQuizService {

  async startAdaptiveQuiz(userId: number, year: number, subject: string, topic: string, maxQuestions: number = 10) {
    // Fetch historical progress
    const historicalProgress = await this.getHistoricalProgress(userId);

    // Fetch questions
    let questions = await this.getQuizQuestions(year, subject, topic);

    // If no questions found, try to find questions for the same subject and year but any topic
    if (questions.length === 0) {
      console.warn(`No questions found for topic "${topic}". Trying to find questions for subject "${subject}" and year ${year}...`);
      questions = await this.getQuizQuestionsBySubjectYear(year, subject);

      if (questions.length === 0) {
        console.warn(`No questions found for subject "${subject}" and year ${year}. Using fallback questions.`);
        questions = this.getFallbackQuestions(topic);
      }
    }

    // Always ensure we have at least fallback questions
    if (questions.length === 0) {
      questions = this.getFallbackQuestions(topic);
    }

    if (questions.length === 0) {
      throw new Error(`Unable to load quiz questions. Please contact administrator.`);
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
      totalQuestions: sessionData.totalQuestions!,
      currentTopicQuestions: 0,
      timeSpent: 0,
      startTime: new Date(),
      isCompleted: false,
      weakTopics: sessionData.weakTopics || [],
      availableQuestions: sessionData.availableQuestions || [],
      answeredQuestions: [],
      consecutiveWrongAnswers: 0,
      hintsUsed: 0,
      currentHintsUsed: 0,
      remedialQuestions: [], // Track questions from weak topics
      questionAttempts: new Map(),
      incorrectQuestions: [],
      questionScores: [] // Track individual question scores
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
    this.updateSessionState(session, question, isCorrect, scoreResult, timeSpent);

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
      weakTopics: session.weakTopics, // Include updated weak topics
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

    // Hints are available after any wrong answer
    if (wrongAttemptsForQuestion < 1) {
      throw new Error('Hint available after getting the answer wrong');
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

    // Calculate adjusted score excluding remedial questions
    const nonRemedialScores = session.questionScores.filter(score => !score.isRemedial);
    const adjustedTotalScore = nonRemedialScores.reduce((sum, score) => sum + score.points, 0);

    // Save results to database
    try {
      await this.saveQuizResults(session, currentTopicPercentage);
    } catch (error) {
      console.error('Error saving quiz results:', error);
    }

    // Filter question scores to exclude remedial questions and remove duplicates
    const filteredQuestionScores = session.questionScores
      .filter(score => !score.isRemedial) // Only include non-remedial questions
      .filter((score, index, self) => {
        // Remove duplicates - if same question appears multiple times, show only the last attempt
        const lastIndex = self.reduce((last, current, currentIndex) =>
          current.questionId === score.questionId ? currentIndex : last, -1);
        return index === lastIndex;
      });

    return {
      sessionId: session.sessionId,
      userId: session.userId,
      totalQuestions: session.totalQuestions,
      questionsAnswered: session.questionsAnswered,
      currentTopicScore: session.currentTopicScore,
      currentTopicQuestions: session.currentTopicQuestions,
      currentTopicPercentage: Math.round(currentTopicPercentage),
      quizPassed: currentTopicPercentage >= 75,
      totalScore: adjustedTotalScore, // Use adjusted score excluding remedial questions
      timeSpent: session.timeSpent,
      abilityEstimate: session.abilityEstimate,
      weakTopics: session.weakTopics,
      questionScores: filteredQuestionScores, // Return filtered question scores
      remedialQuestionsCount: session.remedialQuestions.length
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

    const timeLimitSeconds = 60;
    const answeredWithinTime = timeSpent <= timeLimitSeconds;

    const difficultyMultiplier = {
      'easy': 0.8,
      'medium': 1.0,
      'hard': 1.2
    };

    let baseScore = 0;
    let timeBonus = 0;
    let partialCredit = 0;
    let hintPenalty = 0;

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

    // Apply hint penalty if hints were used for this question
    if (hintsUsed > 0) {
      hintPenalty = hintsUsed * scoringRules.hintPenalty;
    }

    const totalPoints = baseScore + timeBonus - hintPenalty;

    return {
      baseScore,
      timeBonus,
      partialCredit,
      hintPenalty,
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

  private updateSessionState(session: QuizSession, question: Question, isCorrect: boolean, scoreResult: any, timeSpent: number) {
    session.answeredQuestions.push(question.id);
    session.questionsAnswered++;
    session.totalScore += scoreResult.totalPoints;
    session.timeSpent += timeSpent;

    // Check if this is a remedial question (from weak topics)
    const isRemedial = session.remedialQuestions.includes(question.id);

    // Track individual question scores
    const questionAttempts = session.questionAttempts.get(question.id) || { attempts: 0, correct: false, hintsUsed: 0 };
    session.questionScores.push({
      questionId: question.id,
      question: question.question,
      difficulty: question.difficulty,
      isCorrect,
      points: scoreResult.totalPoints,
      timeSpent,
      attempts: questionAttempts.attempts,
      hintsUsed: questionAttempts.hintsUsed,
      baseScore: scoreResult.baseScore,
      timeBonus: scoreResult.timeBonus,
      partialCredit: scoreResult.partialCredit,
      hintPenalty: scoreResult.hintPenalty,
      answeredWithinTime: scoreResult.answeredWithinTime,
      isRemedial
    });

    // Track current topic performance - only if not remedial
    if (!isRemedial) {
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
      // Use the existing merged progress system instead of a separate table
      const mergedProgress = await getMergedUserProgress(userId);

      // Transform the data to match HistoricalProgress interface
      return mergedProgress.map(progress => ({
        year: progress.year,
        subject: progress.subject,
        topic: progress.topic,
        topicProgress: progress.topic_progress,
        quizScore: progress.quiz_score,
        quizPassed: progress.quiz_passed,
        materialsViewed: progress.viewed_materials || 0,
        totalMaterials: progress.total_materials || 0
      }));
    } catch (error) {
      console.error('Error fetching historical progress:', error);
      return [];
    }
  }

  private async getQuizQuestions(year: number, subject: string, topic: string): Promise<Question[]> {
    try {
      const questionsQuery = `
        SELECT qq.id, question, options, correct_answers, hints, qq.topic, difficulty
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

  private async getQuizQuestionsBySubjectYear(year: number, subject: string): Promise<Question[]> {
    try {
      const questionsQuery = `
        SELECT qq.id, question, options, correct_answers, hints, qq.topic, difficulty
        FROM quiz_questions qq
        JOIN quizzes q ON qq.quiz_id = q.id
        WHERE q.year = $1 AND q.subject = $2
        ORDER BY qq.id
      `;
      const result = await pool.query(questionsQuery, [year, subject]);
      return result.rows as Question[];
    } catch (error) {
      console.error('Error fetching quiz questions by subject and year:', error);
      return [];
    }
  }

  private getFallbackQuestions(topic: string): Question[] {
    // Return some basic fallback questions for demonstration
    // In a real application, these would be more comprehensive
    return [
      {
        id: 9991,
        question: `Apakah topik utama yang dibincangkan dalam "${topic}"?`,
        options: [
          { id: 'a', text: 'Konsep asas' },
          { id: 'b', text: 'Aplikasi praktikal' },
          { id: 'c', text: 'Kajian kes' },
          { id: 'd', text: 'Semua yang disebutkan' }
        ],
        correct_answers: ['d'],
        hints: ['Pertimbangkan semua aspek yang dipelajari dalam topik ini.'],
        topic: topic,
        difficulty: 'easy' as const,
        year: 2025,
        subject: 'General'
      },
      {
        id: 9992,
        question: `Mengapakah penting untuk mempelajari "${topic}"?`,
        options: [
          { id: 'a', text: 'Untuk lulus peperiksaan' },
          { id: 'b', text: 'Untuk pemahaman yang lebih baik' },
          { id: 'c', text: 'Untuk aplikasi dalam kehidupan seharian' },
          { id: 'd', text: 'Semua sebab di atas' }
        ],
        correct_answers: ['d'],
        hints: ['Pertimbangkan faedah jangka panjang dan praktikal.'],
        topic: topic,
        difficulty: 'medium' as const,
        year: 2025,
        subject: 'General'
      }
    ];
  }

  private async identifyWeakTopicsFromTable(userId: number, year: number, subject: string): Promise<string[]> {
    try {
      // Simple approach: topics are weak if the student failed the quiz (< 75%)
      const query = `
        SELECT q.topic
        FROM student_quiz_progress sqp
        JOIN quizzes q ON sqp.quiz_id = q.id
        WHERE sqp.user_id = $1 AND q.year = $2 AND q.subject = $3 AND sqp.passed = false
        ORDER BY sqp.last_activity DESC
      `;
      const result = await pool.query(query, [userId, year, subject]);
      return result.rows.map(row => `${year}-${subject}-${row.topic}`);
    } catch (error) {
      console.error('Error identifying weak topics:', error);
      return [];
    }
  }

  // Simplified: Weak topics are now determined by quiz pass/fail, not real-time scoring
  // This method is kept for compatibility but no longer updates weakness scores during quiz
  private async updateWeakTopicsRealtime(session: QuizSession, question: Question, isCorrect: boolean, isRepeatedQuestion: boolean = false) {
    // No real-time updates - weak topics are determined by quiz results only
    return;
  }

  private async saveQuizResults(session: QuizSession, currentTopicPercentage: number) {
    // Get quiz ID for the attempt logging - try exact match first, then flexible match
    let quizQuery = await pool.query(
      `SELECT id FROM quizzes WHERE year = $1 AND subject = $2 AND topic = $3`,
      [session.year, session.subject, session.topic]
    );

    // If exact match fails, try flexible topic matching
    if (quizQuery.rows.length === 0) {
      console.log(`[DEBUG] Exact topic match failed for "${session.topic}", trying flexible match...`);
      const allQuizzesQuery = await pool.query(
        `SELECT id, topic FROM quizzes WHERE year = $1 AND subject = $2`,
        [session.year, session.subject]
      );

      // Find quiz with flexible topic matching
      for (const quiz of allQuizzesQuery.rows) {
        if (isTopicMatch(quiz.topic, session.topic)) {
          quizQuery = { rows: [{ id: quiz.id, topic: quiz.topic }] } as any;
          console.log(`[DEBUG] Found matching quiz ID ${quiz.id} with topic "${quiz.topic}"`);
          break;
        }
      }
    }

    if (quizQuery.rows.length === 0) {
      console.error(`[ERROR] No quiz found for year=${session.year}, subject=${session.subject}, topic="${session.topic}"`);
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
