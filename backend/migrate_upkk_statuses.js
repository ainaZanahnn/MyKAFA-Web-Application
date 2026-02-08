const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function migrateStatuses() {
  try {
    console.log('Checking current status values...');
    const result = await pool.query('SELECT DISTINCT status FROM upkk_papers');
    console.log('Current statuses:', result.rows.map(r => r.status));

    console.log('Updating Active to aktif...');
    const activeResult = await pool.query("UPDATE upkk_papers SET status = 'aktif' WHERE status = 'Active'");
    console.log(`Updated ${activeResult.rowCount} records from 'Active' to 'aktif'`);

    console.log('Updating Archived to arkib...');
    const archivedResult = await pool.query("UPDATE upkk_papers SET status = 'arkib' WHERE status = 'Archived'");
    console.log(`Updated ${archivedResult.rowCount} records from 'Archived' to 'arkib'`);

    const updated = await pool.query('SELECT DISTINCT status FROM upkk_papers');
    console.log('Updated statuses:', updated.rows.map(r => r.status));

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await pool.end();
  }
}

migrateStatuses();
