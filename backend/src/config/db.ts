/** @format */

//create PostgreSQL db connection

import { Pool } from "pg"; //pool allow  multiple clinets to connect
import dotenv from "dotenv"; // dotenv loads .env
dotenv.config();

const pool = new Pool({
  host: process.env.PGHOST,
  port: Number(process.env.PGPORT),
  database: process.env.PGDATABASE,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  // Connection settings to handle timeouts and reconnections
  connectionTimeoutMillis: 2000, // How long to wait for connection
  idleTimeoutMillis: 30000, // Close idle connections after 30 seconds
  max: 20, // Maximum number of clients in pool
  allowExitOnIdle: true, // Allow pool to close when idle
});

// Handle pool events
pool.on('connect', (client) => {
  console.log('✅ New client connected to PostgreSQL');
});

pool.on('error', (err, client) => {
  console.error('❌ Unexpected error on idle client:', err);
  // Don't exit the process, just log the error
});

// Test connection on startup
const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log("✅ Connected to PostgreSQL successfully");
    client.release();
  } catch (err) {
    console.error("❌ Database connection error:", err);
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
