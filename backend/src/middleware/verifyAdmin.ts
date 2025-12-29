/** @format */

import { Request, Response, NextFunction } from "express";
import { findUserById } from "../models/userModel";

export const verifyAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      return res
        .status(401)
        .json({ message: "Tiada maklumat pengguna dijumpai." });
    }

    const user = await findUserById(userId);
    if (!user || user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Akses ditolak. Hanya admin sahaja." });
    }

    next();
  } catch (error) {
    console.error("Verify admin error:", error);
    res
      .status(500)
      .json({ message: "Ralat pelayan semasa menyemak akses admin." });
  }
};
