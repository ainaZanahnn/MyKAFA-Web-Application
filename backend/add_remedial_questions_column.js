const { Pool } = require('pg');
const fs = require('fs');
require('dotenv').config();

const pool = new Pool({
  host: process.env.PGHOST,
  port: Number(process.env.PGPORT),
  database: process.env.PGDATABASE,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000,
  max: 20,
  allowExitOnIdle: true,
});

async function addRemedialQuestionsColumn() {
  try {
    console.log('Reading SQL migration script...');
    const sqlScript = fs.readFileSync('./add_remedial_questions_column.sql', 'utf8');

    console.log('Executing SQL migration...');
    await pool.query(sqlScript);

    console.log('Migration completed successfully!');

    // Verify the migration
    console.log('\nVerifying table structure...');
    const result = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'quiz_sessions' AND column_name = 'remedial_questions'
      ORDER BY ordinal_position
    `);

    if (result.rows.length > 0) {
      const column = result.rows[0];
      console.log('remedial_questions column details:');
      console.log(`- Name: ${column.column_name}`);
      console.log(`- Type: ${column.data_type}`);
      console.log(`- Nullable: ${column.is_nullable}`);
      console.log(`- Default: ${column.column_default}`);
    } else {
      console.log('ERROR: remedial_questions column was not added!');
    }

  } catch (error) {
    console.error('Error adding remedial_questions column:', error);
  } finally {
    pool.end();
  }
}

addRemedialQuestionsColumn();
