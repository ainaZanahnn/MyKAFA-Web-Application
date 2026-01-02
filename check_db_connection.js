const pool = require('./backend/dist/config/db.js').default;

async function checkConnection() {
  try {
    console.log('Checking database connection details...');

    // Get database info
    const dbInfo = await pool.query('SELECT current_database(), current_schema(), current_user');
    console.log('Connected to:');
    console.log('- Database:', dbInfo.rows[0].current_database);
    console.log('- Schema:', dbInfo.rows[0].current_schema);
    console.log('- User:', dbInfo.rows[0].current_user);

    // Check if lessons table exists
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_name = 'lessons'
      ) as table_exists
    `);
    console.log('Lessons table exists:', tableCheck.rows[0].table_exists);

    if (tableCheck.rows[0].table_exists) {
      // Count lessons
      const countResult = await pool.query('SELECT COUNT(*) as count FROM lessons');
      console.log('Total lessons:', countResult.rows[0].count);

      // Show table structure
      const columns = await pool.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'lessons'
        ORDER BY ordinal_position
      `);
      console.log('Lessons table columns:');
      columns.rows.forEach(col => {
        console.log(`- ${col.column_name} (${col.data_type}) ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
      });
    }

  } catch (error) {
    console.error('Connection check failed:', error.message);
  } finally {
    await pool.end();
  }
}

checkConnection();
