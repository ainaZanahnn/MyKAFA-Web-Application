/** @format */

import express from "express";
import {
  getAnnouncements,
  getLatestAnnouncementController,
  getGuardianFeedbacks,
  getFeedback,
  createAnnouncementController,
} from "../controllers/announcementController";
import { protect } from "../middleware/authMiddleware";

const router = express.Router();

// Anyone can view announcements
router.get("/", getAnnouncements);

// Protect routes that require authentication
router.get("/latest", protect, getLatestAnnouncementController);
router.get("/feedbacks/:id", protect, getGuardianFeedbacks);
router.get("/feedback", protect, getFeedback);
router.post("/", protect, createAnnouncementController);

export default router;
