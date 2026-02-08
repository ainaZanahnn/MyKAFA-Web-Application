const pool = require('./backend/dist/config/db.js').default;

async function resetQuizSequence() {
  try {
    console.log('Resetting quizzes_id_seq to max(id) + 1...');

    // Get the current max id
    const maxIdResult = await pool.query('SELECT MAX(id) as max_id FROM quizzes');
    const maxId = maxIdResult.rows[0].max_id || 0;

    // Set the sequence to max_id + 1
    await pool.query('SELECT setval(\'quizzes_id_seq\', $1)', [maxId + 1]);

    console.log(`Sequence reset to ${maxId + 1}`);

    // Verify
    const seqResult = await pool.query('SELECT last_value FROM quizzes_id_seq');
    console.log('Current sequence value:', seqResult.rows[0].last_value);

  } catch (error) {
    console.error('Error resetting sequence:', error);
  } finally {
    await pool.end();
  }
}

resetQuizSequence();
