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

    // Get current level based on completed lessons
    const currentLevelQuery = `
      SELECT
        CASE
          WHEN COUNT(*) >= 20 THEN 'Tingkatan 3'
          WHEN COUNT(*) >= 10 THEN 'Tingkatan 2'
          ELSE 'Tingkatan 1'
        END as current_level
      FROM student_progress
      WHERE user_id = $1 AND lesson_completed = true
    `;
    const currentLevelResult = await pool.query(currentLevelQuery, [userId]);
    const currentLevel = currentLevelResult.rows[0].current_level;

    // Get weak areas from student_weak_topics (adaptive quiz data)
    const weakAreasQuery = `
      SELECT
        q.subject,
        q.topic,
        swt.weakness_score,
        swt.improvement_trend,
        swt.remediation_attempts
      FROM student_weak_topics swt
      JOIN quizzes q ON swt.quiz_id = q.id
      WHERE swt.user_id = $1
      ORDER BY swt.weakness_score DESC
      LIMIT 2
    `;
    const weakAreasResult = await pool.query(weakAreasQuery, [userId]);

    let weakAreas = weakAreasResult.rows.map(row => ({
      subject: row.subject,
      topic: row.topic,
      issue: `Skor lemah (${Math.round(row.weakness_score * 100)}%)`,
      recommendation: row.improvement_trend === 'improving' ?
        'Sedang menunjukkan peningkatan' : 'Perlu latihan tambahan'
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
          subject: 'Permulaan Hebat',
          topic: 'Tiada Kawasan Lemah',
          issue: 'Belum ada data kuiz yang mencukupi',
          recommendation: 'Mulakan kuiz untuk mengenal pasti kawasan yang perlu diperbaiki'
        }
      );
    }

    const dashboardData = {
      lessonsCompleted,
      quizPoints,
      currentLevel,
      quizzesPassed,
      weakAreas
    };

    res.json({ success: true, data: dashboardData });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
};
