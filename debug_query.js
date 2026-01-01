const pool = require('./backend/dist/config/db.js').default;

async function debugLessons() {
  try {
    // Check year levels
    const yearResult = await pool.query('SELECT DISTINCT year_level FROM lessons ORDER BY year_level');
    console.log('Year levels in DB:', yearResult.rows.map(r => r.year_level));

    // Check subjects
    const subjectResult = await pool.query('SELECT DISTINCT subject FROM lessons ORDER BY subject');
    console.log('Subjects in DB:', subjectResult.rows.map(r => r.subject));

    // Check sample lessons
    const lessonsResult = await pool.query('SELECT id, subject, title, year_level, status FROM lessons LIMIT 5');
    console.log('Sample lessons:');
    lessonsResult.rows.forEach(lesson => {
      console.log(`- ID: ${lesson.id}, Subject: ${lesson.subject}, Title: ${lesson.title}, Year: ${lesson.year_level}, Status: ${lesson.status}`);
    });

    // Check count by year
    const countByYear = await pool.query('SELECT year_level, COUNT(*) as count FROM lessons GROUP BY year_level ORDER BY year_level');
    console.log('Lessons count by year:');
    countByYear.rows.forEach(row => {
      console.log(`- ${row.year_level}: ${row.count} lessons`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

debugLessons();
