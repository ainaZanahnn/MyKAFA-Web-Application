/** @format */

import { Request, Response } from "express";
import multer from "multer";
import pool from "../config/db";
import {
  getAllUsers,
  findUserById,
  updateUser,
  toggleUserStatus,
  deleteUser,
} from "../models/userModel";

interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    role: string;
  };
}

/**
 * GET /api/users - Get all users (Admin only)
 */
export const getUsers = async (req: Request, res: Response) => {
  try {
    const { role, status, page = 1, limit = 10, search } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const users = await getAllUsers(
      role as string,
      status as string,
      Number(limit),
      offset,
      search as string
    );

    // Get total count for pagination
    let totalQuery = "SELECT COUNT(*) as total FROM users WHERE 1=1";
    const params: any[] = [];
    if (role) {
      totalQuery += " AND role = $" + (params.length + 1);
      params.push(role);
    }
    if (status) {
      totalQuery += " AND status = $" + (params.length + 1);
      params.push(status);
    }
    if (search) {
      totalQuery +=
        " AND (full_name ILIKE $" +
        (params.length + 1) +
        " OR email ILIKE $" +
        (params.length + 2) +
        " OR id_pengguna ILIKE $" +
        (params.length + 3) +
        ")";
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    const totalResult = await pool.query(totalQuery, params);
    const total = parseInt(totalResult.rows[0].total, 10);

    return res.status(200).json({
      success: true,
      data: users,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (err: any) {
    console.error("❌ Get users error:", err);
    return res.status(500).json({
      success: false,
      message: "Ralat pelayan semasa mendapatkan pengguna.",
      error: err.message,
    });
  }
};

/**
 * GET /api/users/:id - Get single user (Admin only)
 */
export const getUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = parseInt(id, 10);

    if (isNaN(userId)) {
      return res.status(400).json({
        success: false,
        message: "ID pengguna tidak sah.",
      });
    }

    const user = await findUserById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Pengguna tidak dijumpai.",
      });
    }

    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (err: any) {
    console.error("❌ Get user error:", err);
    return res.status(500).json({
      success: false,
      message: "Ralat pelayan semasa mendapatkan pengguna.",
      error: err.message,
    });
  }
};

/**
 * PUT /api/users/:id - Update user (Admin only)
 */
export const updateUserController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = parseInt(id, 10);
    const updates = req.body;

    if (isNaN(userId)) {
      return res.status(400).json({
        success: false,
        message: "ID pengguna tidak sah.",
      });
    }

    const updatedUser = await updateUser(userId, updates);
    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "Pengguna tidak dijumpai.",
      });
    }

    console.log("✅ User updated successfully:", {
      id: updatedUser.id,
      full_name: updatedUser.full_name,
    });

    return res.status(200).json({
      success: true,
      message: "Pengguna berjaya dikemaskini!",
      data: updatedUser,
    });
  } catch (err: any) {
    console.error("❌ Update user error:", err);
    return res.status(500).json({
      success: false,
      message: "Ralat pelayan semasa mengemaskini pengguna.",
      error: err.message,
    });
  }
};

/**
 * PATCH /api/users/:id/suspend - Suspend/Activate user (Admin only)
 */
export const suspendUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = parseInt(id, 10);

    if (isNaN(userId)) {
      return res.status(400).json({
        success: false,
        message: "ID pengguna tidak sah.",
      });
    }

    const updatedUser = await toggleUserStatus(userId);
    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "Pengguna tidak dijumpai.",
      });
    }

    const action =
      updatedUser.status === "suspended" ? "digantung" : "diaktifkan";
    console.log(`✅ User ${action} successfully:`, {
      id: updatedUser.id,
      full_name: updatedUser.full_name,
    });

    return res.status(200).json({
      success: true,
      message: `Pengguna berjaya ${action}!`,
      data: updatedUser,
    });
  } catch (err: any) {
    console.error("❌ Suspend user error:", err);
    return res.status(500).json({
      success: false,
      message: "Ralat pelayan semasa menggantung pengguna.",
      error: err.message,
    });
  }
};

/**
 * DELETE /api/users/:id - Delete user (Admin only)
 */
export const deleteUserController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = parseInt(id, 10);

    if (isNaN(userId)) {
      return res.status(400).json({
        success: false,
        message: "ID pengguna tidak sah.",
      });
    }

    const deleted = await deleteUser(userId);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Pengguna tidak dijumpai.",
      });
    }

    console.log("✅ User deleted successfully:", { id: userId });

    return res.status(200).json({
      success: true,
      message: "Pengguna berjaya dipadam!",
    });
  } catch (err: any) {
    console.error("❌ Delete user error:", err);
    return res.status(500).json({
      success: false,
      message: "Ralat pelayan semasa memadam pengguna.",
      error: err.message,
    });
  }
};

/**
 * GET /api/users/profile - Get current user profile (Student/Guardian)
 */
export const getUserProfile = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Pengguna tidak disahkan.",
      });
    }

    const user = await findUserById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Pengguna tidak dijumpai.",
      });
    }

    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (err: any) {
    console.error("❌ Get user profile error:", err);
    return res.status(500).json({
      success: false,
      message: "Ralat pelayan semasa mendapatkan profil pengguna.",
      error: err.message,
    });
  }
};

/**
 * PUT /api/users/profile - Update current user profile (Student/Guardian)
 */
export const updateUserProfile = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const userId = req.user?.id;
    const updates = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Pengguna tidak disahkan.",
      });
    }

    // Remove sensitive fields that shouldn't be updated directly
    delete updates.id;
    delete updates.password_hash;
    delete updates.role;
    delete updates.status;
    delete updates.created_at;

    const updatedUser = await updateUser(userId, updates);
    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "Pengguna tidak dijumpai.",
      });
    }

    console.log("✅ User profile updated successfully:", {
      id: updatedUser.id,
      full_name: updatedUser.full_name,
    });

    return res.status(200).json({
      success: true,
      message: "Profil berjaya dikemaskini!",
      data: updatedUser,
    });
  } catch (err: any) {
    console.error("❌ Update user profile error:", err);
    return res.status(500).json({
      success: false,
      message: "Ralat pelayan semasa mengemaskini profil.",
      error: err.message,
    });
  }
};

/**
 * PUT /api/users/profile/picture - Update profile picture (Student/Guardian)
 */
export const updateProfilePicture = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const userId = req.user?.id;
    const file = req.file;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Pengguna tidak disahkan.",
      });
    }

    if (!file) {
      return res.status(400).json({
        success: false,
        message: "Fail gambar diperlukan.",
      });
    }

    // Save file path to database
    const filePath = `uploads/profiles/${file.filename}`;
    const updatedUser = await updateUser(userId, { profile_picture: filePath });

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "Pengguna tidak dijumpai.",
      });
    }

    console.log("✅ Profile picture updated successfully:", {
      id: updatedUser.id,
      profile_picture: updatedUser.profile_picture,
    });

    return res.status(200).json({
      success: true,
      message: "Gambar profil berjaya dikemaskini!",
      data: updatedUser,
    });
  } catch (err: any) {
    console.error("❌ Update profile picture error:", err);
    return res.status(500).json({
      success: false,
      message: "Ralat pelayan semasa mengemaskini gambar profil.",
      error: err.message,
    });
  }
};
