const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function migrateLessonStatuses() {
  try {
    console.log('Checking current status values in lessons table...');
    const result = await pool.query('SELECT DISTINCT status FROM lessons');
    console.log('Current statuses:', result.rows.map(r => r.status));

    console.log('Updating draft to draf...');
    const draftResult = await pool.query("UPDATE lessons SET status = 'draf' WHERE status = 'draft'");
    console.log(`Updated ${draftResult.rowCount} records from 'draft' to 'draf'`);

    console.log('Updating published to diterbitkan...');
    const publishedResult = await pool.query("UPDATE lessons SET status = 'diterbitkan' WHERE status = 'published'");
    console.log(`Updated ${publishedResult.rowCount} records from 'published' to 'diterbitkan'`);

    console.log('Updating archived to arkib...');
    const archivedResult = await pool.query("UPDATE lessons SET status = 'arkib' WHERE status = 'archived'");
    console.log(`Updated ${archivedResult.rowCount} records from 'archived' to 'arkib'`);

    const updated = await pool.query('SELECT DISTINCT status FROM lessons');
    console.log('Updated statuses:', updated.rows.map(r => r.status));

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await pool.end();
  }
}

migrateLessonStatuses();
