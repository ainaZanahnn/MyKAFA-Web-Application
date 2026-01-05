const { Client } = require('pg');

const client = new Client({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'kafa_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
});

async function debugMapping() {
  try {
    await client.connect();
    console.log('=== DEBUGGING STUDENT_PROGRESS TO LESSONS MAPPING ===\n');

    // Check student_progress data
    console.log('1. STUDENT_PROGRESS DATA:');
    const progressData = await client.query(`
      SELECT DISTINCT year, subject, topic
      FROM student_progress
      ORDER BY year, subject, topic
      LIMIT 20
    `);
    progressData.rows.forEach(row => {
      console.log(`  Progress: year=${row.year} (${typeof row.year}), subject="${row.subject}", topic="${row.topic}"`);
    });

    // Check lessons data
    console.log('\n2. LESSONS DATA:');
    const lessonsData = await client.query(`
      SELECT DISTINCT year_level, subject, title
      FROM lessons
      ORDER BY year_level, subject, title
      LIMIT 20
    `);
    lessonsData.rows.forEach(row => {
      console.log(`  Lesson: year_level="${row.year_level}" (${typeof row.year_level}), subject="${row.subject}", title="${row.title}"`);
    });

    // Test the exact mapping query
    console.log('\n3. TESTING THE MAPPING QUERY:');
    const mappingTest = await client.query(`
      SELECT
        sp.year,
        sp.subject,
        sp.topic,
        sp.year::text as year_as_text,
        l.id as lesson_id,
        l.title as lesson_title,
        l.year_level,
        CASE
          WHEN l.year_level = sp.year::text AND l.subject = sp.subject AND l.title = sp.topic THEN 'EXACT MATCH'
          WHEN l.year_level = sp.year::text AND l.subject = sp.subject THEN 'YEAR+SUBJECT MATCH'
          WHEN l.subject = sp.subject AND l.title = sp.topic THEN 'SUBJECT+TITLE MATCH'
          ELSE 'NO MATCH'
        END as match_type
      FROM student_progress sp
      LEFT JOIN lessons l ON l.year_level = sp.year::text
                         AND l.subject = sp.subject
                         AND l.title = sp.topic
      LIMIT 20
    `);
    mappingTest.rows.forEach(row => {
      console.log(`  ${row.match_type}: Progress(${row.year},${row.subject},${row.topic}) -> Lesson(${row.lesson_id},${row.lesson_title})`);
    });

    // Count matches vs non-matches
    console.log('\n4. MATCH STATISTICS:');
    const matchStats = await client.query(`
      SELECT
        COUNT(*) as total_progress_records,
        COUNT(CASE WHEN l.id IS NOT NULL THEN 1 END) as records_with_matches,
        COUNT(CASE WHEN l.id IS NULL THEN 1 END) as records_without_matches
      FROM student_progress sp
      LEFT JOIN lessons l ON l.year_level = sp.year::text
                         AND l.subject = sp.subject
                         AND l.title = sp.topic
    `);
    console.log(`  Total student_progress records: ${matchStats.rows[0].total_progress_records}`);
    console.log(`  Records with lesson matches: ${matchStats.rows[0].records_with_matches}`);
    console.log(`  Records without lesson matches: ${matchStats.rows[0].records_without_matches}`);

    // Show some examples of non-matching records
    console.log('\n5. EXAMPLES OF NON-MATCHING RECORDS:');
    const nonMatches = await client.query(`
      SELECT sp.year, sp.subject, sp.topic
      FROM student_progress sp
      LEFT JOIN lessons l ON l.year_level = sp.year::text
                         AND l.subject = sp.subject
                         AND l.title = sp.topic
      WHERE l.id IS NULL
      LIMIT 10
    `);
    nonMatches.rows.forEach(row => {
      console.log(`  No match: year=${row.year}, subject="${row.subject}", topic="${row.topic}"`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
  }
}

debugMapping();
