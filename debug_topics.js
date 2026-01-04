const pool = require('./backend/src/config/db');

async function debugTopics() {
  try {
    // Check all lessons
    const allLessons = await pool.query('SELECT subject, year_level, title, status FROM lessons');
    console.log('All lessons:', allLessons.rows);

    // Check published lessons
    const publishedLessons = await pool.query('SELECT subject, year_level, title FROM lessons WHERE status = $1', ['published']);
    console.log('Published lessons:', publishedLessons.rows);

    // Check distinct subjects
    const subjects = await pool.query('SELECT DISTINCT subject FROM lessons');
    console.log('Available subjects:', subjects.rows);

    // Check distinct year_levels
    const yearLevels = await pool.query('SELECT DISTINCT year_level FROM lessons');
    console.log('Available year_levels:', yearLevels.rows);

    // Test the getTopicsBySubjectYear function
    const { getTopicsBySubjectYear } = require('./backend/src/models/lessonModel');

    const topics1 = await getTopicsBySubjectYear('Matematik', 'Year 1');
    console.log('Topics for Matematik Year 1:', topics1);

    const topics2 = await getTopicsBySubjectYear('Bahasa Melayu', 'Year 1');
    console.log('Topics for Bahasa Melayu Year 1:', topics2);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    pool.end();
  }
}

debugTopics();
