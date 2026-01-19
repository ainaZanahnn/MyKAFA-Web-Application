const db = require('./dist/config/db');

const pool = db.pool || db.default || db;

async function testDB() {
  try {
    console.log('Testing database connection...');

    // Test connection
    const connectionTest = await pool.query('SELECT NOW()');
    console.log('Database connected successfully at:', connectionTest.rows[0].now);

    // Check lessons table
    const lessonsQuery = await pool.query('SELECT id, title, subject, year_level, status FROM lessons LIMIT 10');
    console.log('\nLessons in database:');
    console.log(lessonsQuery.rows);

    // Check published lessons
    const publishedLessons = await pool.query("SELECT id, title, subject, year_level, status FROM lessons WHERE status = 'published'");
    console.log('\nPublished lessons:');
    console.log(publishedLessons.rows);

    // Check quizzes table
    const quizzesQuery = await pool.query('SELECT id, year, subject, topic, status FROM quizzes LIMIT 10');
    console.log('\nQuizzes in database:');
    console.log(quizzesQuery.rows);

    // Check published quizzes
    const publishedQuizzes = await pool.query("SELECT id, year, subject, topic, status FROM quizzes WHERE status = 'published'");
    console.log('\nPublished quizzes:');
    console.log(publishedQuizzes.rows);

    process.exit(0);
  } catch (error) {
    console.error('Database test failed:', error);
    process.exit(1);
  }
}

testDB();
