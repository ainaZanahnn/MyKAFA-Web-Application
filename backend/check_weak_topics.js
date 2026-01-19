const { Client } = require('pg');

const client = new Client({
  host: 'localhost',
  port: 5432,
  database: 'upkk',
  user: 'postgres',
  password: 'password'
});

async function checkWeakTopics() {
  try {
    await client.connect();
    console.log('Connected to database');

    // Check if student_weak_topics table exists and has data
    const tableCheck = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_name = 'student_weak_topics'
    `);

    if (tableCheck.rows.length === 0) {
      console.log('student_weak_topics table does not exist');
      return;
    }

    // Check table structure
    const structure = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'student_weak_topics'
      ORDER BY ordinal_position
    `);
    console.log('Table structure:', structure.rows);

    // Check data
    const data = await client.query('SELECT * FROM student_weak_topics LIMIT 10');
    console.log('Sample data:', data.rows);

    // Check weakness scores
    const scores = await client.query('SELECT weakness_score, COUNT(*) as count FROM student_weak_topics GROUP BY weakness_score ORDER BY weakness_score DESC');
    console.log('Weakness score distribution:', scores.rows);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
  }
}

checkWeakTopics();
