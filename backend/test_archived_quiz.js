const pool = require('./src/config/db');

async function testArchivedQuiz() {
  try {
    console.log('Testing archived quiz behavior...\n');

    // Check all quiz statuses
    const statusQuery = `
      SELECT id, topic, subject, year, status
      FROM quizzes
      ORDER BY subject, year, topic
    `;
    const statusResult = await pool.query(statusQuery);
    console.log('All quiz statuses:');
    statusResult.rows.forEach(quiz => {
      console.log(`ID: ${quiz.id}, Topic: ${quiz.topic}, Subject: ${quiz.subject}, Year: ${quiz.year}, Status: ${quiz.status}`);
    });

    // Check if any archived quizzes exist
    const archivedQuery = `
      SELECT COUNT(*) as archived_count
      FROM quizzes
      WHERE status = 'archived'
    `;
    const archivedResult = await pool.query(archivedQuery);
    console.log(`\nNumber of archived quizzes: ${archivedResult.rows[0].archived_count}`);

    // Simulate student quiz fetch (only published)
    const studentQuery = `
      SELECT id, topic, subject, year, status
      FROM quizzes
      WHERE status = 'published'
      ORDER BY subject, year, topic
    `;
    const studentResult = await pool.query(studentQuery);
    console.log('\nQuizzes available to students (published only):');
    studentResult.rows.forEach(quiz => {
      console.log(`ID: ${quiz.id}, Topic: ${quiz.topic}, Subject: ${quiz.subject}, Year: ${quiz.year}, Status: ${quiz.status}`);
    });

    console.log('\nTest completed. Archived quizzes should not appear in student results.');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit(0);
  }
}

testArchivedQuiz();
