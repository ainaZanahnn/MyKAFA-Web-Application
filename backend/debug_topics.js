const pool = require('./src/config/db');

async function debugTopics() {
  try {
    console.log('=== QUIZ TOPICS ===');
    const quizQuery = `
      SELECT id, topic, subject, year
      FROM quizzes
      WHERE subject = 'Malay' AND year = 2025
      ORDER BY topic
    `;
    const quizResult = await pool.query(quizQuery);
    console.log('Quizzes:');
    quizResult.rows.forEach(row => {
      console.log(`ID: ${row.id}, Topic: "${row.topic}"`);
    });

    console.log('\n=== QUESTION TOPICS ===');
    const questionQuery = `
      SELECT DISTINCT qq.topic as question_topic, q.topic as quiz_topic, COUNT(*) as count
      FROM quiz_questions qq
      JOIN quizzes q ON qq.quiz_id = q.id
      WHERE q.subject = 'Malay' AND q.year = 2025
      GROUP BY qq.topic, q.topic
      ORDER BY q.topic, qq.topic
    `;
    const questionResult = await pool.query(questionQuery);
    console.log('Question topics by quiz:');
    questionResult.rows.forEach(row => {
      console.log(`Quiz: "${row.quiz_topic}" -> Question: "${row.question_topic}" (${row.count} questions)`);
    });

    console.log('\n=== SAMPLE QUESTIONS FOR SIRAH ===');
    const sirahQuery = `
      SELECT q.topic as quiz_topic, qq.topic as question_topic, qq.question
      FROM quiz_questions qq
      JOIN quizzes q ON qq.quiz_id = q.id
      WHERE q.subject = 'Malay' AND q.year = 2025 AND (q.topic LIKE '%Sirah%' OR qq.topic LIKE '%Sirah%')
      LIMIT 10
    `;
    const sirahResult = await pool.query(sirahQuery);
    console.log('Sirah questions:');
    sirahResult.rows.forEach(row => {
      console.log(`Quiz: "${row.quiz_topic}" | Question: "${row.question_topic}" | Q: ${row.question.substring(0, 50)}...`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit(0);
  }
}

debugTopics();
