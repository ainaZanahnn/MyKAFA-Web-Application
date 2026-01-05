const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/kafa_db'
});

async function checkCorrectAnswers() {
  try {
    const result = await pool.query('SELECT id, correct_answers FROM quiz_questions LIMIT 5');
    console.log('Sample correct_answers data:');
    result.rows.forEach(row => {
      console.log(`ID: ${row.id}, correct_answers: ${JSON.stringify(row.correct_answers)}, type: ${Array.isArray(row.correct_answers) ? row.correct_answers.map(ca => typeof ca).join(', ') : typeof row.correct_answers}`);
    });
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

checkCorrectAnswers();
