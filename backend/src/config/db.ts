/** @format */

//create PostgreSQL db connection

import { Pool } from "pg"; //pool allow  multiple clinets to connect
import dotenv from "dotenv"; // dotenv loads .env

dotenv.config();

console.log("DATABASE_URL exists:", !!process.env.DATABASE_URL);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production"
    ? { rejectUnauthorized: false }
    : false,

  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000,
  max: 20,
  allowExitOnIdle: true,

});

console.log("DB HOST:", process.env.DATABASE_URL?.split("@")[1]);


// Handle pool events
pool.on('connect', (client) => {
  console.log('✅ New client connected to PostgreSQL');
});

pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client:', err);
  // Don't exit the process, just log the error
});

// Test connection on startup
const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log("✅ Connected to PostgreSQL successfully");
    client.release();
  } catch (err) {
    console.error("Database connection error:", err);
    // Don't exit process, let the application handle reconnection
  }
};

testConnection();

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('🛑 Received SIGINT, closing pool...');
  await pool.end();
  console.log('✅ Pool closed');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('🛑 Received SIGTERM, closing pool...');
  await pool.end();
  console.log('✅ Pool closed');
  process.exit(0);
});

export default pool;
