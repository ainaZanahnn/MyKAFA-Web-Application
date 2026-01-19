const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

async function testSessionSave() {
  try {
    await client.connect();
    console.log('Connected to database');

    // Test inserting a session
    const sessionId = `test_session_${Date.now()}`;
    const query = `
      INSERT INTO quiz_sessions (
        session_id, user_id, year, subject, topic, current_question_index,
        ability_estimate, questions_answered, total_score, total_questions,
        time_spent, start_time, is_completed, weak_topics, available_questions,
        answered_questions, consecutive_wrong_answers, hints_used, current_hints_used,
        question_attempts, incorrect_questions, question_scores, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24
      )
    `;

    const values = [
      sessionId, // session_id
      10, // user_id
      1, // year
      'Test Subject', // subject
      'Test Topic', // topic
      0, // current_question_index
      0.5, // ability_estimate
      0, // questions_answered
      0.0, // total_score
      10, // total_questions
      0, // time_spent
      new Date(), // start_time
      false, // is_completed
      [], // weak_topics
      '[]', // available_questions
      [], // answered_questions
      0, // consecutive_wrong_answers
      0, // hints_used
      0, // current_hints_used
      '{}', // question_attempts
      [], // incorrect_questions
      '[]', // question_scores
      new Date(), // created_at
      new Date()  // updated_at
    ];

    await client.query(query, values);
    console.log('Session inserted successfully');

    // Test retrieving the session
    const selectQuery = 'SELECT * FROM quiz_sessions WHERE session_id = $1';
    const result = await client.query(selectQuery, [sessionId]);

    if (result.rows.length > 0) {
      console.log('Session retrieved successfully:', result.rows[0].session_id);
    } else {
      console.log('Session not found after insertion');
    }

    // Clean up test session
    await client.query('DELETE FROM quiz_sessions WHERE session_id = $1', [sessionId]);
    console.log('Test session cleaned up');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
  }
}

testSessionSave();
