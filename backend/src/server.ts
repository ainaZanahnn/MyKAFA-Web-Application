/** @format */
//entry points of the backend( start Express server)

import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import pool from "./config/db";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/authRoutes";
import announcementRoutes from "./routes/announcementRoutes";
import upkkRoutes from "./routes/upkkRoutes";
import userRoutes from "./routes/userRoutes";
import progressRoutes from "./routes/progressRoutes";
import lessonRoutes from "./routes/lessonRoutes";
import quizRoutes from "./routes/quizRoutes";

// Load environment variables
dotenv.config();

// Database health check endpoint
const healthCheck = async (req: express.Request, res: express.Response) => {
  try {
    // Test database connection
    await pool.query('SELECT 1');
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected'
    });
  } catch (error: any) {
    console.error('Health check failed:', error);
    res.status(500).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: error.message
    });
  }
};

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors()); //allows requests from any origin
app.use(express.json());
app.use(cookieParser());
app.use("/api/auth", authRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/upkk", upkkRoutes);
app.use("/api/users", userRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/lessons", lessonRoutes);
app.use("/api", quizRoutes);
//app.use("/api", authRoutes);

// Basic route for testing
app.get("/", async (req: Request, res: Response) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({
      message: "Server and DB are working!",
      time: result.rows[0].now,
    });
  } catch (error) {
    console.error(" Query error:", error);
    res.status(500).json({ error: "Database connection failed" });
  }
});

// Database health check route
app.get("/health/db", healthCheck);

// SPA fallback - serve index.html for any non-API routes (only in production)
if (process.env.NODE_ENV === 'production') {
  app.use((req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
  });
}

// Start the server
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
