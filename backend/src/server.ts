import express, { Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import path from 'path';
import pool from './config/db';
import authRoutes from './routes/authRoutes';
import announcementRoutes from './routes/announcementRoutes';
import upkkRoutes from './routes/upkkRoutes';
import userRoutes from './routes/userRoutes';
import progressRoutes from './routes/progressRoutes';
import lessonRoutes from './routes/lessonRoutes';
import quizRoutes from './routes/quizRoutes';
import dashboardRoutes from './routes/dashboardRoutes';

// Load environment variables
dotenv.config();

// TEMP LOG
console.log("Cloudinary ENV check:", {
  CLOUD_NAME: !!process.env.CLOUDINARY_CLOUD_NAME,
  API_KEY: !!process.env.CLOUDINARY_API_KEY,
  API_SECRET: !!process.env.CLOUDINARY_API_SECRET,
});

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
app.set('trust proxy', 1); //avoids issues when using secure cookies on Render.
const PORT = process.env.PORT || 10000;


const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5173',
      'https://mykafa-web-application.onrender.com',
      'https://mykafa.com',
      'https://www.mykafa.com',
    ];

// Middleware
app.use(cors({
  origin: (origin, callback) => {
      // Allow Postman, curl, server-to-server
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("CORS_NOT_ALLOWED"));
    },
    
  credentials: true,  // Allow credentials (cookies, authorization headers)
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));


app.use(express.json());
app.use(cookieParser());
app.use("/auth", authRoutes);
app.use("/announcements", announcementRoutes);
app.use("/upkk", upkkRoutes);
app.use("/users", userRoutes);
app.use("/progress", progressRoutes);
app.use("/lessons", lessonRoutes);
app.use("/", quizRoutes);
app.use("/dashboard", dashboardRoutes);

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

// Start the server
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});


