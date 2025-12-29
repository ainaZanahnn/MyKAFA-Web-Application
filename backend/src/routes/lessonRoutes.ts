import express from "express";
import multer from "multer";
import { protect } from "../middleware/authMiddleware";
import { verifyAdmin } from "../middleware/verifyAdmin";
import {
  getLessons,
  getLessonById,
  createLesson,
  updateLesson,
  updateLessonStatus,
  deleteLesson,
  viewMaterial,
  getTopics,
} from "../controllers/lessonController";

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ storage });

const router = express.Router();

// Student routes - require authentication but not admin role
router.get("/", protect, getLessons);
router.get("/topics", protect, getTopics);
router.get("/:id", protect, getLessonById);
router.get("/:id/materials/:materialId/view", protect, viewMaterial);

// Admin routes require authentication and admin role
router.post("/", protect, verifyAdmin, upload.array('files'), createLesson);
router.put("/:id", protect, verifyAdmin, upload.array('files'), updateLesson);
router.patch("/:id/status", protect, verifyAdmin, updateLessonStatus);
router.delete("/:id", protect, verifyAdmin, deleteLesson);

export default router;
