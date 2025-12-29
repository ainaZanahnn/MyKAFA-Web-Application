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
});

pool
  .connect()
  .then(() => console.log("✅ Connected to PostgreSQL"))
  .catch((err: Error) => console.error("❌ Database connection error:", err));

export default pool;
