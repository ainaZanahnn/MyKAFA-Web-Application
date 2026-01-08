/** @format */

import { Request, Response } from "express";
import {
  getAllAnnouncements,
  getAnnouncementsByType,
  getLatestAnnouncement,
  getFeedbackFromGuardians,
  getLatestFeedbacksByGuardian,
  createAnnouncement,
} from "../models/announcementModel";

interface AuthenticatedRequest extends Request {
  user?: { id: number; role: string };
}

/**
 * GET ALL ANNOUNCEMENTS AND FEEDBACK
 */
export const getAnnouncements = async (req: Request, res: Response) => {
  try {
    const announcements = await getAllAnnouncements();
    return res.status(200).json({
      success: true,
      data: announcements,
    });
  } catch (err: any) {
    console.error("❌ Get announcements error:", err);
    return res.status(500).json({
      success: false,
      message: "Ralat pelayan semasa mendapatkan pengumuman.",
      error: err.message,
    });
  }
};

/**
 * GET LATEST ANNOUNCEMENT FROM ADMIN
 */
export const getLatestAnnouncementController = async (
  req: Request,
  res: Response
) => {
  try {
    const announcement = await getLatestAnnouncement();
    return res.status(200).json({
      success: true,
      data: announcement,
    });
  } catch (err: any) {
    console.error("❌ Get latest announcement error:", err);
    return res.status(500).json({
      success: false,
      message: "Ralat pelayan semasa mendapatkan pengumuman terkini.",
      error: err.message,
    });
  }
};

/**
 * GET LATEST FEEDBACK FROM GUARDIAN
 */
export const getGuardianFeedbacks = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const guardianId = req.user?.id; // or req.params.id if you pass it manually
    if (!guardianId) {
      return res.status(400).json({ message: "Guardian ID is required" });
    }

    const feedbacks = await getLatestFeedbacksByGuardian(guardianId);
    res.json(feedbacks);
  } catch (error) {
    console.error("Error fetching guardian feedbacks:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * GET FEEDBACK FROM GUARDIANS
 */
export const getFeedback = async (req: Request, res: Response) => {
  try {
    const feedback = await getFeedbackFromGuardians();
    return res.status(200).json({
      success: true,
      data: feedback,
    });
  } catch (err: any) {
    console.error("❌ Get feedback error:", err);
    return res.status(500).json({
      success: false,
      message: "Ralat pelayan semasa mendapatkan maklum balas.",
      error: err.message,
    });
  }
};

/**
 * CREATE ANNOUNCEMENT (FOR ADMIN)
 */
export const createAnnouncementController = async (
  req: Request,
  res: Response
) => {
  try {
    const { title, content, date, type, target, author_id } = req.body;

    if (!title || !content || !type) {
      return res.status(400).json({
        success: false,
        message: "Sila isi semua maklumat wajib.",
      });
    }

    const announcement = await createAnnouncement({
      title,
      content,
      date: date || new Date().toISOString().split("T")[0],
      type,
      target,
      author_id,
    });

    return res.status(201).json({
      success: true,
      message: "Pengumuman berjaya dibuat.",
      data: announcement,
    });
  } catch (err: any) {
    console.error("❌ Create announcement error:", err);
    return res.status(500).json({
      success: false,
      message: "Ralat pelayan semasa membuat pengumuman.",
      error: err.message,
    });
  }
};
