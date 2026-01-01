/** @format */

import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import {
  createUser,
  findUserByEmail,
  findUserByIdPengguna,
  findUserById,
  comparePassword,
} from "../models/userModel";
import jwt from "jsonwebtoken";
import { generateToken, generateRefreshToken, verifyRefreshToken } from "../utils/generateToken";
import {
  getCurrentProgressYear,
  getUserProgress,
  initializeProgress,
} from "../models/progressModel";
import pool from "../config/db";

// Database operation retry utility
const retryDatabaseOperation = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;

      // Check if it's a connection error that we should retry
      if (error.code === 'ECONNREFUSED' ||
          error.code === 'ENOTFOUND' ||
          error.message?.includes('connection') ||
          error.message?.includes('timeout')) {

        if (attempt < maxRetries) {
          console.warn(`Database operation failed (attempt ${attempt}/${maxRetries}), retrying in ${delay}ms:`, error.message);
          await new Promise(resolve => setTimeout(resolve, delay));
          delay *= 2; // Exponential backoff
          continue;
        }
      }

      // For non-connection errors or if we've exhausted retries, throw immediately
      throw error;
    }
  }

  throw lastError!;
};

/**
 * REGISTER USER CONTROLLER
 * Handles incoming registration requests from frontend.
 * This controller processes request, validates data, saves it to database, and returns a success response with a token.
 */

export const registerUser = async (req: Request, res: Response) => {
  try {
    // Destructure fields from request body into variables for convenience.
    // Make sure these names match the frontend (Register form + validator.ts)
    const {
      role,
      id_pengguna, // changed from userId to id_pengguna (matches frontend)
      full_name,
      email,
      state,
      grade,
      schoolType,
      schoolName,
      phone,
      password,
    } = req.body;

    // Validate required fields
    if (!role || !full_name || !email || !id_pengguna || !password) {
      return res
        .status(400)
        .json({ message: "Sila isi semua maklumat wajib." });
    }

    // Check if email already exists (with retry)
    const existingEmail = await retryDatabaseOperation(() => findUserByEmail(email));
    if (existingEmail) {
      return res.status(400).json({ message: "E-mel telah digunakan." });
    }

    // Check if ID pengguna already exists (with retry)
    const existingId = await retryDatabaseOperation(() => findUserByIdPengguna(id_pengguna));
    if (existingId) {
      return res.status(400).json({ message: "ID pengguna telah digunakan." });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Create new user in DB (using userModel) with retry
    const newUser = await retryDatabaseOperation(() => createUser({
      role,
      id_pengguna,
      full_name,
      email,
      negeri: state,
      tahun_darjah: role === "student" ? grade : null,
      jenis_sekolah: role === "student" ? schoolType : null,
      nama_sekolah: role === "student" ? schoolName : null,
      telefon: role === "guardian" ? phone : null,
      password_hash,
      status: "active", // default status
    }));

    if (!newUser.id) {
      throw new Error("User ID not found after creation");
    }
    const token = generateToken({ id: newUser.id, role: newUser.role }); // Generate JWT token | token will be stored on frontend (usually in localStorage) | Used for authenticated API requests later.

    if (role === "student") {
      const registrationYear = parseInt(grade || "1");
      await retryDatabaseOperation(() => initializeProgress(newUser.id!, registrationYear));
    }

    // Log successful registration for verification
    console.log("✅ User registered successfully:", {
      id: newUser.id,
      role: newUser.role,
      full_name: newUser.full_name,
      email: newUser.email,
      id_pengguna: newUser.id_pengguna,
    });

    // Send success response
    return res.status(201).json({
      message: "Pendaftaran berjaya!",
      user: {
        id: newUser.id,
        role: newUser.role,
        full_name: newUser.full_name,
        email: newUser.email,
      },
      token,
    });
  } catch (err: any) {
    console.error("❌ Register error:", err);
    return res.status(500).json({
      message: "Ralat pelayan semasa pendaftaran.",
      error: err.message,
    });
  }
};

/**
 * LOGIN USER CONTROLLER
 * Handles incoming login requests from frontend.
 */

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { identifier, password } = req.body;

    // Validate required fields
    if (!identifier || !password) {
      return res.status(400).json({
        message: "Sila isi alamat e-mel/ID pengguna dan kata laluan.",
      });
    }

    // Find user by email or id_pengguna
    let user = await findUserByEmail(identifier);
    if (!user) {
      user = await findUserByIdPengguna(identifier);
    }

    if (!user) {
      return res.status(401).json({ message: "Pengguna tidak dijumpai." });
    }

    if (user.status === "suspended") {
      return res
        .status(403)
        .json({ message: "Akaun anda telah digantung. Sila hubungi Admin" });
    }

    // Compare password
    const isPasswordValid = await comparePassword(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Kata laluan salah." });
    }

    // Generate JWT tokens
    const token = generateToken({ id: user.id!, role: user.role });
    const refreshToken = generateRefreshToken({ id: user.id!, role: user.role });

    // Get progress information for students
    let progressInfo = null;
    if (user.role === "student") {
      //Determine current adaptive year
      const registrationYear = user.tahun_darjah ? parseInt(user.tahun_darjah) : 1;
      const currentYear = await getCurrentProgressYear(user.id!, registrationYear); // highest completed year ≥ threshold
      const progress = await getUserProgress(user.id!); // per subject completion %

      progressInfo = {
        registrationYear,
        currentYear, // controls activity unlocking
        progress, // subject-wise completion
      };
    }

    // Send success response
    return res.status(200).json({
      message: "Log masuk berjaya!",
      user: {
        id: user.id,
        role: user.role,
        full_name: user.full_name,
        email: user.email,
        id_pengguna: user.id_pengguna,
        ...(user.role === "student" && {
          tahun_darjah: user.tahun_darjah,
          ...progressInfo,
        }),
      },
      token,
      refreshToken,
    });
  } catch (err) {
    console.error("❌ Login error:", err);
    return res.status(500).json({ message: "Ralat pelayan semasa log masuk." });
  }
};

/**
 * REFRESH TOKEN CONTROLLER
 * Handles token refresh requests
 */
export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { refreshToken: token } = req.body;

    if (!token) {
      return res.status(400).json({ message: "Refresh token diperlukan." });
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(token);

    // Find user
    const user = await findUserById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: "Pengguna tidak dijumpai." });
    }

    if (user.status === "suspended") {
      return res.status(403).json({ message: "Akaun anda telah digantung." });
    }

    // Generate new tokens
    const newToken = generateToken({ id: user.id!, role: user.role });
    const newRefreshToken = generateRefreshToken({ id: user.id!, role: user.role });

    return res.status(200).json({
      message: "Token berjaya diperbaharui.",
      token: newToken,
      refreshToken: newRefreshToken,
    });
  } catch (err) {
    console.error("❌ Refresh token error:", err);
    return res.status(401).json({ message: "Token refresh tidak sah." });
  }
};

/**
 * VERIFY TOKEN CONTROLLER
 * Verifies JWT token and returns user information
 */
export const verifyToken = async (req: Request, res: Response) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Token tidak disediakan." });
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: number; role: string };

    // Find user
    const user = await findUserById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: "Pengguna tidak dijumpai." });
    }

    if (user.status === "suspended") {
      return res.status(403).json({ message: "Akaun anda telah digantung." });
    }

    // Get progress information for students
    let progressInfo = null;
    if (user.role === "student") {
      const registrationYear = user.tahun_darjah ? parseInt(user.tahun_darjah) : 1;
      const currentYear = await getCurrentProgressYear(user.id!, registrationYear);
      const progress = await getUserProgress(user.id!);

      progressInfo = {
        registrationYear,
        currentYear,
        progress,
      };
    }

    return res.status(200).json({
      user: {
        id: user.id,
        role: user.role,
        full_name: user.full_name,
        email: user.email,
        id_pengguna: user.id_pengguna,
        ...(user.role === "student" && {
          tahun_darjah: user.tahun_darjah,
          ...progressInfo,
        }),
      },
    });
  } catch (err) {
    console.error("❌ Verify token error:", err);
    return res.status(401).json({ message: "Token tidak sah." });
  }
};
