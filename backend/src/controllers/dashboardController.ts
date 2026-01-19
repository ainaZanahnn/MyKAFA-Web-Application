import { Request, Response } from 'express';
import pool from '../config/db';

interface AuthenticatedRequest extends Request {
  user?: { id: number; role: string };
}

export const getStudentDashboard = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ error: 'User not authenticated' });
  }

  try {
    // Get lessons completed count
    const lessonsCompletedQuery = `
      SELECT COUNT(*) as lessons_completed
      FROM student_progress
      WHERE user_id = $1 AND lesson_completed = true
    `;
    const lessonsCompletedResult = await pool.query(lessonsCompletedQuery, [userId]);
    const lessonsCompleted = parseInt(lessonsCompletedResult.rows[0].lessons_completed);

    // Get quiz points and passed quizzes
    const quizStatsQuery = `
      SELECT
        SUM(best_score) as total_quiz_points,
        COUNT(*) as quizzes_passed
      FROM student_quiz_progress
      WHERE user_id = $1 AND passed = true
    `;
    const quizStatsResult = await pool.query(quizStatsQuery, [userId]);
    const quizPoints = quizStatsResult.rows[0].total_quiz_points || 0;
    const quizzesPassed = parseInt(quizStatsResult.rows[0].quizzes_passed || 0);

    // Get current level from user profile (tahun_darjah field)
    const currentLevelQuery = `
      SELECT
        CASE
          WHEN tahun_darjah = 'Tingkatan 3' THEN 'Tingkatan 3'
          WHEN tahun_darjah = 'Tingkatan 2' THEN 'Tingkatan 2'
          ELSE 'Tingkatan 1'
        END as current_level
      FROM users
      WHERE id = $1
    `;
    const currentLevelResult = await pool.query(currentLevelQuery, [userId]);
    const currentLevel = currentLevelResult.rows[0].current_level;

    // Get weak areas from student_quiz_progress (simplified approach: failed quizzes = weak topics)
    const weakAreasQuery = `
      SELECT
        q.subject,
        q.topic,
        sqp.last_score,
        sqp.best_score,
        sqp.total_attempts
      FROM student_quiz_progress sqp
      JOIN quizzes q ON sqp.quiz_id = q.id
      WHERE sqp.user_id = $1 AND sqp.passed = false
      ORDER BY sqp.last_activity DESC
      LIMIT 2
    `;
    const weakAreasResult = await pool.query(weakAreasQuery, [userId]);

    let weakAreas = weakAreasResult.rows.map(row => ({
      subject: row.subject,
      topic: row.topic,
      issue: `Gagal kuiz (skor terbaik: ${row.best_score}%)`,
      recommendation: 'Cuba lagi untuk lulus kuiz ini'
    }));

    // If no weak areas from adaptive quizzes, check regular quiz performance
    if (weakAreas.length === 0) {
      const quizPerformanceQuery = `
        SELECT
          q.subject,
          q.topic,
          sqp.last_score,
          sqp.best_score,
          sqp.total_attempts
        FROM student_quiz_progress sqp
        JOIN quizzes q ON sqp.quiz_id = q.id
        WHERE sqp.user_id = $1 AND sqp.best_score < 75
        ORDER BY sqp.best_score ASC
        LIMIT 2
      `;
      const quizPerformanceResult = await pool.query(quizPerformanceQuery, [userId]);

      weakAreas = quizPerformanceResult.rows.map(row => ({
        subject: row.subject,
        topic: row.topic,
        issue: `Skor terbaik: ${row.best_score}% (dari ${row.total_attempts} percubaan)`,
        recommendation: 'Cuba lagi untuk meningkatkan skor'
      }));
    }

    // If still no weak areas, show encouraging message or suggest starting quizzes
    if (weakAreas.length === 0) {
      weakAreas.push(
        {
          subject: 'Tiada Subject',
          topic: 'Tiada Kawasan Lemah Yang Dikenal Pasti',
          issue: '',
          recommendation: 'Mulakan kuiz untuk mengenal pasti kawasan yang perlu diperbaiki'
        }
      );
    }

    // Calculate current ability estimate based on subject/year combinations
    const abilityEstimateQuery = `
      SELECT
        q.subject,
        q.year,
        AVG(qa.ability_estimate) as avg_ability,
        MAX(qa.ability_estimate) as max_ability,
        COUNT(*) as attempts_count
      FROM quiz_attempts qa
      JOIN quizzes q ON qa.quiz_id = q.id
      WHERE qa.user_id = $1
      GROUP BY q.subject, q.year
      ORDER BY q.year DESC, q.subject ASC
    `;
    const abilityEstimateResult = await pool.query(abilityEstimateQuery, [userId]);

    // Calculate overall ability as weighted average across all subject/year combinations
    let totalWeightedAbility = 0;
    let totalAttempts = 0;
    let highestAbility = 0;

    const subjectYearAbilities = abilityEstimateResult.rows.map(row => ({
      subject: row.subject,
      year: row.year,
      ability: parseFloat(row.avg_ability),
      maxAbility: parseFloat(row.max_ability),
      attempts: parseInt(row.attempts_count)
    }));

    // Calculate weighted overall ability
    subjectYearAbilities.forEach(item => {
      totalWeightedAbility += item.ability * item.attempts;
      totalAttempts += item.attempts;
      highestAbility = Math.max(highestAbility, item.maxAbility);
    });

    const currentAbility = totalAttempts > 0 ? totalWeightedAbility / totalAttempts : 0.5;

    const dashboardData = {
      lessonsCompleted,
      quizPoints,
      currentLevel,
      quizzesPassed,
      weakAreas,
      currentAbility,
      highestAbility,
      totalQuizAttempts: totalAttempts,
      subjectYearAbilities: subjectYearAbilities
    };

    res.json({ success: true, data: dashboardData });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
};

export const getAdminDashboard = async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Total students
    const totalStudentsQuery = `SELECT COUNT(*) as total FROM users WHERE role = 'student'`;
    const totalStudentsResult = await pool.query(totalStudentsQuery);
    const totalStudents = parseInt(totalStudentsResult.rows[0].total);

    // Active students today (assuming active if they have activity in the last 24 hours)
    const activeStudentsQuery = `
      SELECT COUNT(DISTINCT user_id) as active
      FROM student_quiz_progress
      WHERE last_activity >= NOW() - INTERVAL '24 hours'
    `;
    const activeStudentsResult = await pool.query(activeStudentsQuery);
    const activeStudents = parseInt(activeStudentsResult.rows[0].active);

    // Total quizzes taken
    const totalQuizzesQuery = `
      SELECT COUNT(*) as total_quizzes
      FROM student_quiz_progress
      WHERE best_score > 0
    `;
    const totalQuizzesResult = await pool.query(totalQuizzesQuery);
    const totalQuizzes = parseInt(totalQuizzesResult.rows[0].total_quizzes);

    // Students needing attention (low scores or failed quizzes)
    const studentsNeedingAttentionQuery = `
      SELECT COUNT(DISTINCT user_id) as needing_attention
      FROM student_quiz_progress
      WHERE best_score < 50 OR passed = false
    `;
    const studentsNeedingAttentionResult = await pool.query(studentsNeedingAttentionQuery);
    const studentsNeedingAttention = parseInt(studentsNeedingAttentionResult.rows[0].needing_attention);

    // Daily user activity for the week
    const dailyActivityQuery = `
      SELECT
        DATE(last_activity) as date,
        COUNT(DISTINCT user_id) as users
      FROM student_quiz_progress
      WHERE last_activity >= NOW() - INTERVAL '7 days'
      GROUP BY DATE(last_activity)
      ORDER BY DATE(last_activity) DESC
      LIMIT 7
    `;
    const dailyActivityResult = await pool.query(dailyActivityQuery);
    const dailyUserData = dailyActivityResult.rows.map(row => ({
      name: new Date(row.date).toLocaleDateString('en-US', { weekday: 'short' }),
      users: parseInt(row.users)
    })).reverse();

    // Top performers (students with highest average scores)
    const topPerformersQuery = `
      SELECT
        u.name,
        AVG(sqp.best_score) as avg_score,
        COUNT(*) as quizzes_taken
      FROM users u
      JOIN student_quiz_progress sqp ON u.id = sqp.user_id
      WHERE u.role = 'student'
      GROUP BY u.id, u.name
      HAVING AVG(sqp.best_score) > 0
      ORDER BY AVG(sqp.best_score) DESC
      LIMIT 5
    `;
    const topPerformersResult = await pool.query(topPerformersQuery);
    const topPerformers = topPerformersResult.rows.map(row => ({
      name: row.name,
      avgScore: Math.round(parseFloat(row.avg_score)),
      quizzesTaken: parseInt(row.quizzes_taken)
    }));

    const dashboardData = {
      totalStudents,
      activeStudents,
      totalQuizzes,
      studentsNeedingAttention,
      dailyUserData,
      topPerformers
    };

    res.json({ success: true, data: dashboardData });
  } catch (error) {
    console.error('Error fetching admin dashboard data:', error);
    res.status(500).json({ error: 'Failed to fetch admin dashboard data' });
  }
};
