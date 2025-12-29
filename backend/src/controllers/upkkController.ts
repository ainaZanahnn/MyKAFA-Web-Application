/** @format */

import { Request, Response } from "express";
import multer from "multer";
import {
  createPaper,
  getAllPapers,
  getPaperById,
  updatePaper,
  deletePaper,
  archivePaper,
  incrementDownloads,
} from "../models/upkkModel";

/**
 * GET /api/upkk - Get all UPKK papers
 */
export const getPapers = async (req: Request, res: Response) => {
  try {
    const papers = await getAllPapers();
    return res.status(200).json({
      success: true,
      data: papers,
    });
  } catch (err: any) {
    console.error("❌ Get papers error:", err);
    return res.status(500).json({
      success: false,
      message: "Ralat pelayan semasa mendapatkan kertas soalan.",
      error: err.message,
    });
  }
};

/**
 * GET /api/upkk/:id - Get single paper by ID
 */
export const getPaper = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const paperId = parseInt(id, 10);

    if (isNaN(paperId)) {
      return res.status(400).json({
        success: false,
        message: "ID kertas soalan tidak sah.",
      });
    }

    const paper = await getPaperById(paperId);
    if (!paper) {
      return res.status(404).json({
        success: false,
        message: "Kertas soalan tidak dijumpai.",
      });
    }

    return res.status(200).json({
      success: true,
      data: paper,
    });
  } catch (err: any) {
    console.error("❌ Get paper error:", err);
    return res.status(500).json({
      success: false,
      message: "Ralat pelayan semasa mendapatkan kertas soalan.",
      error: err.message,
    });
  }
};

/**
 * POST /api/upkk - Create new paper (Admin only)
 */
export const createPaperController = async (req: Request, res: Response) => {
  try {
    console.log("Request body:", req.body);
    console.log("Request files:", req.files);
    console.log("Request file:", req.file);

    const { year, subject, type, status } = req.body;
    const file = req.file;

    // Validate required fields
    if (!year || !subject || !type) {
      return res.status(400).json({
        success: false,
        message: "Sila isi semua maklumat wajib (tahun, subjek, jenis).",
      });
    }

    // Validate year format
    if (!/^\d{4}$/.test(year)) {
      return res.status(400).json({
        success: false,
        message: "Format tahun tidak sah (gunakan 4 digit).",
      });
    }

    // Handle file upload
    let file_path = null;
    if (file) {
      // For now, just store the filename. In production, you'd upload to cloud storage
      file_path = file.filename || file.originalname;
    }

    const newPaper = await createPaper({
      year,
      subject,
      type,
      file_path: file_path || undefined,
      status: status || "Active",
      downloads: 0,
    });

    console.log("✅ Paper created successfully:", {
      id: newPaper.id,
      year: newPaper.year,
      subject: newPaper.subject,
    });

    return res.status(201).json({
      success: true,
      message: "Kertas soalan berjaya ditambah!",
      data: newPaper,
    });
  } catch (err: any) {
    console.error("❌ Create paper error:", err);
    return res.status(500).json({
      success: false,
      message: "Ralat pelayan semasa menambah kertas soalan.",
      error: err.message,
    });
  }
};

/**
 * PUT /api/upkk/:id - Update paper (Admin only)
 */
export const updatePaperController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const paperId = parseInt(id, 10);
    const updates = req.body;

    if (isNaN(paperId)) {
      return res.status(400).json({
        success: false,
        message: "ID kertas soalan tidak sah.",
      });
    }

    // Validate year format if provided
    if (updates.year && !/^\d{4}$/.test(updates.year)) {
      return res.status(400).json({
        success: false,
        message: "Format tahun tidak sah (gunakan 4 digit).",
      });
    }

    const updatedPaper = await updatePaper(paperId, updates);
    if (!updatedPaper) {
      return res.status(404).json({
        success: false,
        message: "Kertas soalan tidak dijumpai.",
      });
    }

    console.log("✅ Paper updated successfully:", {
      id: updatedPaper.id,
      year: updatedPaper.year,
      subject: updatedPaper.subject,
    });

    return res.status(200).json({
      success: true,
      message: "Kertas soalan berjaya dikemaskini!",
      data: updatedPaper,
    });
  } catch (err: any) {
    console.error("❌ Update paper error:", err);
    return res.status(500).json({
      success: false,
      message: "Ralat pelayan semasa mengemaskini kertas soalan.",
      error: err.message,
    });
  }
};

/**
 * DELETE /api/upkk/:id - Delete paper (Admin only)
 */
export const deletePaperController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const paperId = parseInt(id, 10);

    if (isNaN(paperId)) {
      return res.status(400).json({
        success: false,
        message: "ID kertas soalan tidak sah.",
      });
    }

    const deleted = await deletePaper(paperId);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Kertas soalan tidak dijumpai.",
      });
    }

    console.log("✅ Paper deleted successfully:", { id: paperId });

    return res.status(200).json({
      success: true,
      message: "Kertas soalan berjaya dipadam!",
    });
  } catch (err: any) {
    console.error("❌ Delete paper error:", err);
    return res.status(500).json({
      success: false,
      message: "Ralat pelayan semasa memadam kertas soalan.",
      error: err.message,
    });
  }
};

/**
 * PATCH /api/upkk/:id/archive - Archive paper (Admin only)
 */
export const archivePaperController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const paperId = parseInt(id, 10);

    if (isNaN(paperId)) {
      return res.status(400).json({
        success: false,
        message: "ID kertas soalan tidak sah.",
      });
    }

    const archivedPaper = await archivePaper(paperId);
    if (!archivedPaper) {
      return res.status(404).json({
        success: false,
        message: "Kertas soalan tidak dijumpai.",
      });
    }

    console.log("✅ Paper archived successfully:", {
      id: archivedPaper.id,
      year: archivedPaper.year,
      subject: archivedPaper.subject,
    });

    return res.status(200).json({
      success: true,
      message: "Kertas soalan berjaya diarkib!",
      data: archivedPaper,
    });
  } catch (err: any) {
    console.error("❌ Archive paper error:", err);
    return res.status(500).json({
      success: false,
      message: "Ralat pelayan semasa mengarkib kertas soalan.",
      error: err.message,
    });
  }
};

/**
 * GET /api/upkk/:id/view - Serve file for viewing (without incrementing download count)
 */
export const viewPaper = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const paperId = parseInt(id, 10);

    if (isNaN(paperId)) {
      return res.status(400).json({
        success: false,
        message: "ID kertas soalan tidak sah.",
      });
    }

    const paper = await getPaperById(paperId);
    if (!paper) {
      return res.status(404).json({
        success: false,
        message: "Kertas soalan tidak dijumpai.",
      });
    }

    if (!paper.file_path) {
      return res.status(404).json({
        success: false,
        message: "Fail kertas soalan tidak tersedia.",
      });
    }

    // Serve the file for viewing (inline in browser)
    const filePath = `uploads/${paper.file_path}`;

    // Set headers for inline viewing
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "inline");

    res.sendFile(filePath, { root: process.cwd() }, (err) => {
      if (err) {
        console.error("❌ File serving error:", err);
        return res.status(500).json({
          success: false,
          message: "Ralat semasa memuatkan fail.",
        });
      }
    });
  } catch (err: any) {
    console.error("❌ View paper error:", err);
    return res.status(500).json({
      success: false,
      message: "Ralat pelayan semasa memuatkan kertas soalan.",
      error: err.message,
    });
  }
};

/**
 * POST /api/upkk/:id/download - Increment download count and serve file
 */
export const downloadPaper = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const paperId = parseInt(id, 10);

    if (isNaN(paperId)) {
      return res.status(400).json({
        success: false,
        message: "ID kertas soalan tidak sah.",
      });
    }

    const paper = await getPaperById(paperId);
    if (!paper) {
      return res.status(404).json({
        success: false,
        message: "Kertas soalan tidak dijumpai.",
      });
    }

    if (!paper.file_path) {
      return res.status(404).json({
        success: false,
        message: "Fail kertas soalan tidak tersedia.",
      });
    }

    // Increment download count
    await incrementDownloads(paperId);

    // Serve the file for download
    const filePath = `uploads/${paper.file_path}`;
    const fileName = `Kertas_${paper.subject}_${paper.year}.pdf`;

    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    res.sendFile(filePath, { root: process.cwd() }, (err) => {
      if (err) {
        console.error("❌ File download error:", err);
        return res.status(500).json({
          success: false,
          message: "Ralat semasa memuat turun fail.",
        });
      }
    });
  } catch (err: any) {
    console.error("❌ Download paper error:", err);
    return res.status(500).json({
      success: false,
      message: "Ralat pelayan semasa merekod muat turun.",
      error: err.message,
    });
  }
};
