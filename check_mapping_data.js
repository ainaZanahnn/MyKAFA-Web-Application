const pool = require('./backend/src/config/db');

async function checkMappingData() {
  try {
    console.log('=== STUDENT_PROGRESS DATA ===');
    const progressQuery = await pool.query(`
      SELECT year, subject, topic, COUNT(*) as count
      FROM student_progress
      GROUP BY year, subject, topic
      ORDER BY year, subject, topic
    `);
    console.log('Progress records:');
    progressQuery.rows.forEach(row => {
      console.log(`Year: ${row.year}, Subject: ${row.subject}, Topic: ${row.topic}, Count: ${row.count}`);
    });

    console.log('\n=== LESSONS DATA ===');
    const lessonsQuery = await pool.query(`
      SELECT year_level, subject, title, COUNT(*) as count
      FROM lessons
      GROUP BY year_level, subject, title
      ORDER BY year_level, subject, title
    `);
    console.log('Lesson records:');
    lessonsQuery.rows.forEach(row => {
      console.log(`Year Level: ${row.year_level}, Subject: ${row.subject}, Title: ${row.title}, Count: ${row.count}`);
    });

    console.log('\n=== MAPPING PREVIEW ===');
    const mappingQuery = await pool.query(`
      SELECT
        sp.year,
        sp.subject,
        sp.topic,
        l.id as lesson_id,
        l.title as lesson_title,
        l.year_level
      FROM student_progress sp
      LEFT JOIN lessons l ON l.year_level = sp.year::text
                         AND l.subject = sp.subject
                         AND l.title = sp.topic
      LIMIT 10
    `);
    console.log('Sample mappings:');
    mappingQuery.rows.forEach(row => {
      console.log(`Progress: ${row.year}-${row.subject}-${row.topic} -> Lesson ID: ${row.lesson_id} (${row.lesson_title})`);
    });

    // Count potential matches
    const matchCountQuery = await pool.query(`
      SELECT COUNT(*) as potential_matches
      FROM student_progress sp
      WHERE EXISTS (
        SELECT 1 FROM lessons l
        WHERE l.year_level = sp.year::text
        AND l.subject = sp.subject
        AND l.title = sp.topic
      )
    `);
    console.log(`\nPotential matches: ${matchCountQuery.rows[0].potential_matches}`);

    const totalProgressQuery = await pool.query('SELECT COUNT(*) as total FROM student_progress');
    console.log(`Total student_progress records: ${totalProgressQuery.rows[0].total}`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    pool.end();
  }
}

checkMappingData();
