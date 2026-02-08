/** @format */

import express from "express";
import { protect } from "../middleware/authMiddleware";
import { uploadErrorHandler } from "../middleware/uploadErrorHandler";
import { upload } from "../middleware/upload";
import { getPaperById } from "../models/upkkModel";
import path from "path";
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

// Public routes - anyone can view papers
router.get("/", getPapers);
router.get("/:id", getPaper);
router.get("/:id/view", viewPaper); // Add route to serve files for viewing
router.post("/:id/download", downloadPaper);

// Protected routes - admin only
router.post("/", protect, upload.single("file"),  uploadErrorHandler, createPaperController);
router.put("/:id", protect, upload.single("file"), updatePaperController);
router.delete("/:id", protect, deletePaperController);
router.patch("/:id/archive", protect, archivePaperController);

export default router;
