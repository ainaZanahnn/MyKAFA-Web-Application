const pool = require('./src/config/db');

async function checkTable() {
  try {
    const result = await pool.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'quiz_sessions'
      ORDER BY ordinal_position
    `);

    console.log('Current columns in quiz_sessions table:');
    result.rows.forEach(row => {
      console.log(`- ${row.column_name}`);
    });

    // Check if weak_topic_score exists
    const hasWeakTopicScore = result.rows.some(row => row.column_name === 'weak_topic_score');
    console.log(`\nweak_topic_score column exists: ${hasWeakTopicScore}`);

  } catch (error) {
    console.error('Error checking table:', error);
  } finally {
    pool.end();
  }
}

checkTable();
