const pool = require('./src/config/db');

async function checkUserLevel() {
  try {
    // Get current user (assuming authenticated user, but for demo we'll get first student)
    const userQuery = 'SELECT id, username FROM users WHERE role = \'student\' LIMIT 1';
    const userResult = await pool.query(userQuery);
    if (userResult.rows.length === 0) {
      console.log('No students found');
      return;
    }
    const user = userResult.rows[0];
    console.log(`Checking data for user: ${user.username} (ID: ${user.id})`);
    console.log('=====================================\n');

    // Check completed lessons count
    const lessonsQuery = `
      SELECT COUNT(*) as completed_lessons
      FROM student_progress
      WHERE user_id = $1 AND lesson_completed = true
    `;
    const lessonsResult = await pool.query(lessonsQuery, [user.id]);
    const completedLessons = parseInt(lessonsResult.rows[0].completed_lessons);

    console.log(`Completed Lessons: ${completedLessons}`);

    // Determine level based on the logic
    let currentLevel;
    if (completedLessons >= 20) {
      currentLevel = 'Tingkatan 3 (Year 3)';
    } else if (completedLessons >= 10) {
      currentLevel = 'Tingkatan 2 (Year 2)';
    } else {
      currentLevel = 'Tingkatan 1 (Year 1)';
    }

    console.log(`Calculated Current Level: ${currentLevel}`);
    console.log(`Logic: ${completedLessons} >= 20 → Year 3, ${completedLessons} >= 10 → Year 2, else Year 1`);

    // Show recent lesson progress
    const recentLessonsQuery = `
      SELECT sp.lesson_id, sp.lesson_completed, sp.completed_at, lm.subject, lm.year
      FROM student_progress sp
      JOIN lesson_materials lm ON sp.lesson_id = lm.id
      WHERE sp.user_id = $1
      ORDER BY sp.completed_at DESC NULLS LAST
      LIMIT 10
    `;
    const recentResult = await pool.query(recentLessonsQuery, [user.id]);

    console.log('\nRecent Lesson Progress:');
    console.log('Subject | Year | Completed | Completed At');
    console.log('--------|------|-----------|-------------');
    recentResult.rows.forEach(row => {
      const completed = row.lesson_completed ? 'Yes' : 'No';
      const date = row.completed_at ? new Date(row.completed_at).toLocaleDateString() : 'Not completed';
      console.log(`${row.subject.padEnd(8)} | ${row.year}    | ${completed.padEnd(9)} | ${date}`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit(0);
  }
}

checkUserLevel();
