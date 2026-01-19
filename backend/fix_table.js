const { Pool } = require('pg');
const fs = require('fs');
require('dotenv').config();

const pool = new Pool({
  host: process.env.PGHOST,
  port: Number(process.env.PGPORT),
  database: process.env.PGDATABASE,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000,
  max: 20,
  allowExitOnIdle: true,
});

async function fixTable() {
  try {
    console.log('Reading SQL fix script...');
    const sqlScript = fs.readFileSync('./fix_quiz_sessions_table.sql', 'utf8');

    console.log('Executing SQL fix...');
    await pool.query(sqlScript);

    console.log('Table fix completed successfully!');

    // Verify the fix
    console.log('\nVerifying table structure...');
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

    const hasWeakTopicScore = result.rows.some(row => row.column_name === 'weak_topic_score');
    console.log(`\nweak_topic_score column exists: ${hasWeakTopicScore}`);

  } catch (error) {
    console.error('Error fixing table:', error);
  } finally {
    pool.end();
  }
}

fixTable();
