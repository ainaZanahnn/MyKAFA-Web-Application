require('dotenv').config({ path: './backend/.env' });

console.log('PGHOST:', process.env.PGHOST);
console.log('PGPORT:', process.env.PGPORT);
console.log('PGDATABASE:', process.env.PGDATABASE);
console.log('PGUSER:', process.env.PGUSER);
console.log('PGPASSWORD type:', typeof process.env.PGPASSWORD);
console.log('PGPASSWORD length:', process.env.PGPASSWORD ? process.env.PGPASSWORD.length : 'undefined');
console.log('PGPASSWORD starts with quote:', process.env.PGPASSWORD ? process.env.PGPASSWORD.startsWith('"') : 'N/A');
console.log('PGPASSWORD ends with quote:', process.env.PGPASSWORD ? process.env.PGPASSWORD.endsWith('"') : 'N/A');
