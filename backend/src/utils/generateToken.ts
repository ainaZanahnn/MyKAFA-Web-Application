/** @format */

import jwt from "jsonwebtoken";

interface TokenPayload {
  id: number;
  role?: string;
}

export const generateToken = (payload: TokenPayload) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variables.");
  }

  // Extended expiry for admins to prevent frequent logins
  const expiresIn = payload.role === "admin" ? "30d" : "7d";

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn,
  });
};

export const generateRefreshToken = (payload: TokenPayload) => {
  if (!process.env.JWT_REFRESH_SECRET) {
    throw new Error("JWT_REFRESH_SECRET is not defined in environment variables.");
  }

  // Refresh tokens have longer expiry (90 days)
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: "90d",
  });
};

export const verifyRefreshToken = (token: string) => {
  if (!process.env.JWT_REFRESH_SECRET) {
    throw new Error("JWT_REFRESH_SECRET is not defined in environment variables.");
  }

  return jwt.verify(token, process.env.JWT_REFRESH_SECRET) as TokenPayload;
};
