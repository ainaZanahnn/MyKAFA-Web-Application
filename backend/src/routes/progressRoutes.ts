/** @format */

import express from "express";
import {
  getProgress,
  completeUserTopic,
  initializeProgress,
  completeQuiz,
  markMaterialAsViewed,
  getMaterialProgressEndpoint,
} from "../controllers/progressController";
import { protect } from "../middleware/authMiddleware";

const router = express.Router();

router.get("/", protect, getProgress); // fetch merged progress
router.post("/complete-topic", protect, completeUserTopic); // mark lesson completed
router.post("/complete-quiz", protect, completeQuiz); // mark quiz progress
router.post("/mark-material-viewed", protect, markMaterialAsViewed); // mark material as viewed
router.get("/material-progress", protect, getMaterialProgressEndpoint); // get material progress
router.post("/initialize", protect, initializeProgress); // init all progress

export default router;
