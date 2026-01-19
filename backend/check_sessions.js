const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

async function checkSessions() {
  try {
    await client.connect();
    console.log('Connected to database');

    const result = await client.query('SELECT session_id, is_completed FROM quiz_sessions WHERE session_id LIKE $1 LIMIT 10', ['quiz_10_%']);
    console.log('Found sessions:', result.rows);

    await client.end();
  } catch (err) {
    console.error('Error:', err);
    await client.end();
  }
}

checkSessions();
