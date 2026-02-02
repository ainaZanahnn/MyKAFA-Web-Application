import express from "express";
import { getStudentDashboard, getAdminDashboard, getStudentDashboardById } from "../controllers/dashboardController";
import { protect } from "../middleware/authMiddleware";
import { verifyAdmin } from "../middleware/verifyAdmin";

const router = express.Router();

// Student dashboard route
router.get("/student", protect, getStudentDashboard);

// Admin dashboard route
router.get("/admin", protect, verifyAdmin, getAdminDashboard);

// Admin view student prestasi route
router.get("/admin/student/:id/prestasi", protect, verifyAdmin, getStudentDashboardById);

export default router;
