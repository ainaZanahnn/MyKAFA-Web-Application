import express from "express";
import { getStudentDashboard } from "../controllers/dashboardController";
import { protect } from "../middleware/authMiddleware";

const router = express.Router();

// Student dashboard route
router.get("/student", protect, getStudentDashboard);

export default router;
