require('dotenv').config();
const { Pool } = require('pg');

console.log('Environment variables loaded:');
console.log('PGHOST:', process.env.PGHOST);
console.log('PGPORT:', process.env.PGPORT);
console.log('PGDATABASE:', process.env.PGDATABASE);
console.log('PGUSER:', process.env.PGUSER);
console.log('PGPASSWORD:', process.env.PGPASSWORD ? '***SET***' : 'NOT SET');

const pool = new Pool({
  host: process.env.PGHOST,
  port: Number(process.env.PGPORT),
  database: process.env.PGDATABASE,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
});

pool.query('SELECT COUNT(*) FROM lessons', (err, res) => {
  if (err) {
    console.error('Database query failed:', err.message);
  } else {
    console.log('Lessons count:', res.rows[0].count);
  }
  pool.end();
});
