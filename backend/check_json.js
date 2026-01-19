const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  connectionString: process.env.DATABASE_URL
});

async function checkJsonData() {
  try {
    await client.connect();
    console.log('Connected to database');

    // Check quiz_questions jsonb columns
    const questionsQuery = `
      SELECT id, jsonb_typeof(options) as options_type, jsonb_typeof(correct_answers) as correct_type, jsonb_typeof(hints) as hints_type
      FROM quiz_questions
      LIMIT 10
    `;

    const questionsResult = await client.query(questionsQuery);
    console.log('Sample jsonb types from quiz_questions:');
    questionsResult.rows.forEach(row => {
      console.log(`ID: ${row.id}, Options: ${row.options_type}, Correct: ${row.correct_type}, Hints: ${row.hints_type}`);
    });

    // Check for invalid jsonb in quiz_questions
    const invalidQuestionsQuery = `
      SELECT id, 'options' as column_name, options::text as value
      FROM quiz_questions
      WHERE options::text NOT LIKE '[%' AND options::text NOT LIKE '{%' AND options IS NOT NULL
      UNION
      SELECT id, 'correct_answers' as column_name, correct_answers::text as value
      FROM quiz_questions
      WHERE correct_answers::text NOT LIKE '[%' AND correct_answers::text NOT LIKE '{%' AND correct_answers IS NOT NULL
      UNION
      SELECT id, 'hints' as column_name, hints::text as value
      FROM quiz_questions
      WHERE hints::text NOT LIKE '[%' AND hints::text NOT LIKE '{%' AND hints IS NOT NULL
    `;

    const invalidQuestionsResult = await client.query(invalidQuestionsQuery);
    if (invalidQuestionsResult.rows.length > 0) {
      console.log('\nInvalid JSON entries found in quiz_questions:');
      invalidQuestionsResult.rows.forEach(row => {
        console.log(`ID: ${row.id}, Column: ${row.column_name}, Value: ${row.value}`);
      });
    } else {
      console.log('\nNo invalid JSON entries found in quiz_questions.');
    }

    // Check merged_user_progress if it exists
    try {
      const mergedQuery = `
        SELECT user_id, year, subject, topic, jsonb_typeof(materials_viewed) as materials_type
        FROM merged_user_progress
        WHERE materials_viewed IS NOT NULL
        LIMIT 5
      `;

      const mergedResult = await client.query(mergedQuery);
      console.log('\nSample jsonb types from merged_user_progress:');
      mergedResult.rows.forEach(row => {
        console.log(`User: ${row.user_id}, Year: ${row.year}, Subject: ${row.subject}, Topic: ${row.topic}, Materials: ${row.materials_type}`);
      });
    } catch (error) {
      console.log('\nmerged_user_progress table not found or no jsonb columns:', error.message);
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
  }
}

checkJsonData();
