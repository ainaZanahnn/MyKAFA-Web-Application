const pool = require('./src/config/db');

async function checkQuizData() {
  try {
    console.log('Checking quiz data for Malay subject, 2025 year...\n');

    // Check quizzes
    const quizQuery = `
      SELECT id, topic, subject, year
      FROM quizzes
      WHERE subject = 'Malay' AND year = 2025
      ORDER BY topic
    `;
    const quizResult = await pool.query(quizQuery);
    console.log('Quizzes:');
    console.log(JSON.stringify(quizResult.rows, null, 2));

    // Check questions per quiz
    const questionQuery = `
      SELECT q.topic, COUNT(qq.id) as question_count
      FROM quizzes q
      LEFT JOIN quiz_questions qq ON q.id = qq.quiz_id
      WHERE q.subject = 'Malay' AND q.year = 2025
      GROUP BY q.id, q.topic
      ORDER BY q.topic
    `;
    const questionResult = await pool.query(questionQuery);
    console.log('\nQuestions per quiz:');
    console.log(JSON.stringify(questionResult.rows, null, 2));

    // Check specific Sirah Year 1 questions
    const sirahQuery = `
      SELECT qq.id, qq.question, qq.topic, qq.difficulty
      FROM quiz_questions qq
      JOIN quizzes q ON qq.quiz_id = q.id
      WHERE q.subject = 'Malay' AND q.year = 2025 AND q.topic LIKE '%Sirah%'
      LIMIT 5
    `;
    const sirahResult = await pool.query(sirahQuery);
    console.log('\nSample Sirah questions:');
    console.log(JSON.stringify(sirahResult.rows, null, 2));

  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit(0);
  }
}

checkQuizData();
