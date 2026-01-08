/** @format */
// src/models/userModel.ts

import pool from "../config/db";
import bcrypt from "bcryptjs";

export interface User {
  id?: number;
  role: "student" | "guardian" | "admin";
  id_pengguna: string;
  full_name: string;
  email: string;
  negeri: string;
  tahun_darjah?: string;
  jenis_sekolah?: string;
  nama_sekolah?: string;
  telefon?: string;
  password_hash: string;
  status?: "active" | "suspended";
  created_at?: Date;
  profile_picture?: string;
}

// Create user
export const createUser = async (user: User): Promise<User> => {
  const {
    role,
    id_pengguna,
    full_name,
    email,
    negeri,
    tahun_darjah,
    jenis_sekolah,
    nama_sekolah,
    telefon,
    password_hash,
    profile_picture,
  } = user;

  const result = await pool.query(
    `INSERT INTO users
    (role, id_pengguna, full_name, email, negeri, tahun_darjah, jenis_sekolah, nama_sekolah, telefon, password_hash, profile_picture)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
    RETURNING *`,
    [
      role,
      id_pengguna,
      full_name,
      email,
      negeri,
      tahun_darjah,
      jenis_sekolah,
      nama_sekolah,
      telefon,
      password_hash,
      profile_picture || null,
    ]
  );

  return result.rows[0];
};

// Find by email
export const findUserByEmail = async (email: string): Promise<User | null> => {
  const result = await pool.query("SELECT * FROM users WHERE email = $1", [
    email,
  ]);
  return result.rows[0] || null;
};

// Find by id_pengguna ( for user-facing identification
export const findUserByIdPengguna = async (
  id_pengguna: string
): Promise<User | null> => {
  const result = await pool.query(
    "SELECT * FROM users WHERE id_pengguna = $1",
    [id_pengguna]
  );
  return result.rows[0] || null;
};

// Compare password
export const comparePassword = async (
  entered: string,
  stored: string
): Promise<boolean> => {
  return bcrypt.compare(entered, stored);
};

// Find by ID (For DB operations)
export const findUserById = async (id: number): Promise<User | null> => {
  const result = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
  return result.rows[0] || null;
};

// Get all users with optional filtering
export const getAllUsers = async (
  role?: string,
  status?: string,
  limit?: number,
  offset?: number,
  search?: string
): Promise<User[]> => {
  let query = "SELECT * FROM users WHERE 1=1";
  const params: any[] = [];

  if (role) {
    query += " AND role = $" + (params.length + 1);
    params.push(role);
  }

  if (status) {
    query += " AND status = $" + (params.length + 1);
    params.push(status);
  }

  if (search) {
    query +=
      " AND (full_name ILIKE $" +
      (params.length + 1) +
      " OR email ILIKE $" +
      (params.length + 2) +
      " OR id_pengguna ILIKE $" +
      (params.length + 3) +
      ")";
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  query += " ORDER BY created_at DESC";

  if (limit) {
    query += " LIMIT $" + (params.length + 1);
    params.push(limit);
  }

  if (offset) {
    query += " OFFSET $" + (params.length + 1);
    params.push(offset);
  }

  const result = await pool.query(query, params);
  return result.rows;
};

// Update user
export const updateUser = async (
  id: number,
  updates: Partial<User>
): Promise<User | null> => {
  const fields = Object.keys(updates);
  if (fields.length === 0) return null;

  const setClause = fields
    .map((field, index) => `${field} = $${index + 1}`)
    .join(", ");
  const values = fields.map((field) => (updates as any)[field]);
  values.push(id);

  const query = `UPDATE users SET ${setClause} WHERE id = $${values.length} RETURNING *`;
  const result = await pool.query(query, values);
  return result.rows[0] || null;
};

// Suspend/Activate user
export const toggleUserStatus = async (id: number): Promise<User | null> => {
  const user = await findUserById(id);
  if (!user) return null;

  const newStatus = user.status === "active" ? "suspended" : "active";
  return updateUser(id, { status: newStatus });
};

// Delete user
export const deleteUser = async (id: number): Promise<boolean> => {
  const result = await pool.query("DELETE FROM users WHERE id = $1", [id]);
  if (result.rowCount === null) {
    return false; // or throw an error
  }
  return result.rowCount > 0;
};