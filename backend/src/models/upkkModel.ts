/** @format */

import pool from "../config/db";

export interface Paper {
  id?: number;
  year: string;
  subject: string;
  type: string;
  file_path?: string;
  status: string;
  downloads: number;
  created_at?: string;
  updated_at?: string;
}

// Create paper
export const createPaper = async (paper: Paper): Promise<Paper> => {
  const { year, subject, type, file_path, status, downloads } = paper;

  const result = await pool.query(
    `INSERT INTO upkk_papers (year, subject, type, file_path, status, downloads)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [year, subject, type, file_path, status, downloads]
  );

  return result.rows[0];
};

// Get all papers
export const getAllPapers = async (): Promise<Paper[]> => {
  const result = await pool.query(
    `SELECT * FROM upkk_papers ORDER BY created_at DESC`
  );
  return result.rows;
};

// Get paper by ID
export const getPaperById = async (id: number): Promise<Paper | null> => {
  const result = await pool.query(`SELECT * FROM upkk_papers WHERE id = $1`, [
    id,
  ]);
  return result.rows[0] || null;
};

// Update paper
export const updatePaper = async (
  id: number,
  updates: Partial<Paper>
): Promise<Paper | null> => {
  const fields = Object.keys(updates);
  const values = Object.values(updates);
  const setClause = fields
    .map((field, index) => `${field} = $${index + 1}`)
    .join(", ");

  const result = await pool.query(
    `UPDATE upkk_papers SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = $${
      fields.length + 1
    } RETURNING *`,
    [...values, id]
  );

  return result.rows[0] || null;
};

// Delete paper
export const deletePaper = async (id: number): Promise<boolean> => {
  const result = await pool.query(`DELETE FROM upkk_papers WHERE id = $1`, [
    id,
  ]);
  return (result.rowCount ?? 0) > 0;
};

// Archive paper
export const archivePaper = async (id: number): Promise<Paper | null> => {
  const result = await pool.query(
    `UPDATE upkk_papers SET status = 'arkib', updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`,
    [id]
  );
  return result.rows[0] || null;
};

// Increment downloads
export const incrementDownloads = async (id: number): Promise<void> => {
  await pool.query(
    `UPDATE upkk_papers SET downloads = downloads + 1 WHERE id = $1`,
    [id]
  );
};
