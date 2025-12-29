/** @format */

import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import pool from "../config/db"; //import PostgreSQL connection

interface JwtPayload {
  id: number;
}

export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Expect "Authorization: Bearer <token>"
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Tiada token pengesahan." });
    }

    const token = authHeader.split(" ")[1];
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      throw new Error(
        "JWT_SECRET tidak ditetapkan dalam environment variable."
      );
    }

    // Verify token
    const decoded = jwt.verify(token, secret) as JwtPayload;

    //fetch user from DB
    const result = await pool.query(
      "SELECT id, status, role FROM users WHERE id = $1",
      [decoded.id]
    );
    const user = result.rows[0];

    if (!user) {
      return res.status(404).json({ message: "Pengguna tidak dijumpai." });
    }

    // Check if user is suspended
    if (user.status === "suspended") {
      return res
        .status(403)
        .json({
          message: "Akaun anda telah digantung.Aksess tidak dibenarkan",
        });
    }

    // Attach user ID to request
    (req as any).user = { id: user.id, role: user.role };

    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res
      .status(401)
      .json({ message: "Token tidak sah atau telah tamat tempoh." });
  }
};
