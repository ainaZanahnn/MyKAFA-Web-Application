/** @format */

import { Request, Response } from "express";
import {
  getMergedUserProgress,
  getCurrentMergedProgressYear,
  initializeMergedProgress,
  completeLessonTopic,
  updateQuizProgress,
  markMaterialViewed,
  getMaterialProgress,
} from "../models/mergedProgressModel";

interface AuthenticatedRequest extends Request {
  user?: { id: number; role: string };
}

/* -------------------------------------------------------------------
   GET USER MERGED PROGRESS
------------------------------------------------------------------- */
export const getProgress = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const progress = await getMergedUserProgress(userId);
    const currentYear = await getCurrentMergedProgressYear(userId);

    return res.status(200).json({
      progress,
      currentYear,
    });
  } catch (err: any) {
    console.error("Get progress error:", err);
    return res.status(500).json({ message: "Error fetching progress" });
  }
};

/* -------------------------------------------------------------------
   COMPLETE A LESSON TOPIC
------------------------------------------------------------------- */
export const completeUserTopic = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const userId = req.user?.id;
    const { year, subject, topic } = req.body;

    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    if (!year || !subject || !topic)
      return res
        .status(400)
        .json({ message: "Year, subject, and topic required" });

    const updated = await completeLessonTopic(userId, year, subject, topic);
    const currentYear = await getCurrentMergedProgressYear(userId);

    return res.status(200).json({
      message: "Lesson marked completed",
      updated,
      currentYear,
    });
  } catch (err: any) {
    console.error("Complete lesson error:", err);
    return res.status(500).json({ message: "Error completing lesson" });
  }
};

/* -------------------------------------------------------------------
   UPDATE QUIZ PROGRESS
------------------------------------------------------------------- */
export const completeQuiz = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const userId = req.user?.id;
    const { year, subject, topic, score, passed } = req.body;

    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    if (!year || !subject || !topic || score == null || passed == null)
      return res.status(400).json({ message: "All quiz info required" });

    const updated = await updateQuizProgress(
      userId,
      year,
      subject,
      topic,
      score,
      passed
    );
    const currentYear = await getCurrentMergedProgressYear(userId);

    return res.status(200).json({
      message: "Quiz progress updated",
      updated,
      currentYear,
    });
  } catch (err: any) {
    console.error("Quiz update error:", err);
    return res.status(500).json({ message: "Error updating quiz progress" });
  }
};

/* -------------------------------------------------------------------
   MARK MATERIAL AS VIEWED
------------------------------------------------------------------- */
export const markMaterialAsViewed = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const userId = req.user?.id;
    const { year, subject, topic, materialId } = req.body;

    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    if (!year || !subject || !topic || !materialId)
      return res.status(400).json({ message: "Year, subject, topic, and materialId required" });

    const updated = await markMaterialViewed(userId, year, subject, topic, materialId);

    return res.status(200).json({
      message: "Material marked as viewed",
      updated,
    });
  } catch (err: any) {
    console.error("Mark material viewed error:", err);
    return res.status(500).json({ message: "Error marking material as viewed" });
  }
};

/* -------------------------------------------------------------------
   GET MATERIAL PROGRESS
------------------------------------------------------------------- */
export const getMaterialProgressEndpoint = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const userId = req.user?.id;
    const { year, subject, topic } = req.query;

    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    if (!year || !subject || !topic)
      return res.status(400).json({ message: "Year, subject, and topic required" });

    const materialsViewed = await getMaterialProgress(userId, parseInt(year as string), subject as string, topic as string);

    return res.status(200).json({
      materialsViewed,
    });
  } catch (err: any) {
    console.error("Get material progress error:", err);
    return res.status(500).json({ message: "Error fetching material progress" });
  }
};

/* -------------------------------------------------------------------
   INITIALIZE PROGRESS FOR NEW USER
------------------------------------------------------------------- */
export const initializeProgress = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const userId = req.user?.id;
    const { registrationYear } = req.body;

    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    if (!registrationYear)
      return res.status(400).json({ message: "Registration year is required" });

    await initializeMergedProgress(userId, registrationYear);

    const currentYear = await getCurrentMergedProgressYear(userId);

    return res.status(201).json({
      message: "Progress initialized successfully",
      currentYear,
    });
  } catch (err: any) {
    console.error("Initialize progress error:", err);
    return res.status(500).json({ message: "Error initializing progress" });
  }
};
