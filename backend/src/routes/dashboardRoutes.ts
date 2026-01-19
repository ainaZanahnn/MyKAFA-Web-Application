import express from "express";
import { getStudentDashboard, getAdminDashboard } from "../controllers/dashboardController";
import { protect } from "../middleware/authMiddleware";
import { verifyAdmin } from "../middleware/verifyAdmin";

const router = express.Router();

// Student dashboard route
router.get("/student", protect, getStudentDashboard);

// Admin dashboard route
router.get("/admin", protect, verifyAdmin, getAdminDashboard);

export default router;
