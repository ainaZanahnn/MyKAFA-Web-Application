const pool = require('./backend/dist/config/db.js').default;

async function testDB() {
  try {
    console.log('Testing database connection...');

    // Check if lessons table exists and has data
    const lessonCount = await pool.query('SELECT COUNT(*) as count FROM lessons');
    console.log(`Total lessons in database: ${lessonCount.rows[0].count}`);

    if (parseInt(lessonCount.rows[0].count) > 0) {
      // Get sample lessons
      const lessons = await pool.query('SELECT id, subject, title, year_level, status FROM lessons LIMIT 3');
      console.log('Sample lessons:');
      lessons.rows.forEach(lesson => {
        console.log(`- ID: ${lesson.id}, Subject: ${lesson.subject}, Title: ${lesson.title}, Year: ${lesson.year_level}, Status: ${lesson.status}`);
      });
    }

    // Check year levels
    const yearLevels = await pool.query('SELECT DISTINCT year_level FROM lessons ORDER BY year_level');
    console.log('Year levels in database:', yearLevels.rows.map(r => r.year_level));

  } catch (error) {
    console.error('Database test failed:', error.message);
  } finally {
    await pool.end();
  }
}

testDB();
