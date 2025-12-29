/** @format */

import express from "express";
import multer from "multer";
import { protect } from "../middleware/authMiddleware";
import {
  getPapers,
  getPaper,
  createPaperController,
  updatePaperController,
  deletePaperController,
  archivePaperController,
  viewPaper,
  downloadPaper,
} from "../controllers/upkkController";

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Make sure this directory exists
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow PDF, DOC, DOCX files
    const allowedTypes = /pdf|doc|docx/;
    const extname = allowedTypes.test(file.originalname.toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Only PDF, DOC, and DOCX files are allowed"));
    }
  },
});

// Public routes - anyone can view papers
router.get("/", getPapers);
router.get("/:id", getPaper);
router.get("/:id/view", viewPaper); // Add route to serve files for viewing
router.post("/:id/download", downloadPaper);

// Protected routes - admin only
router.post("/", protect, upload.single("file"), createPaperController);
router.put("/:id", protect, updatePaperController);
router.delete("/:id", protect, deletePaperController);
router.patch("/:id/archive", protect, archivePaperController);

export default router;
