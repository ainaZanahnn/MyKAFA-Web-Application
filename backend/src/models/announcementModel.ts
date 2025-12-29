/** @format */

import pool from "../config/db";

export interface Announcement {
  id?: number;
  title: string;
  content: string;
  date: string;
  type: "announcement" | "feedback";
  target?: "semua" | "penjaga" | "pelajar";
  author_id?: number;
  author_name?: string;
  created_at?: string;
}

// Create announcement
export const createAnnouncement = async (
  announcement: Announcement
): Promise<Announcement> => {
  const { title, content, date, type, target, author_id } = announcement;

  const result = await pool.query(
    `INSERT INTO announcements (title, content, date, type, target, author_id)
   VALUES ($1, $2, $3, $4, $5, $6)
   RETURNING  id, title, content, TO_CHAR(date, 'YYYY-MM-DD') AS date, type, target, author_id;`,
    [title, content, date, type, target, author_id]
  );

  return result.rows[0];
};

// Get all announcements and feedback
export const getAllAnnouncements = async (): Promise<Announcement[]> => {
  const result = await pool.query(`
    SELECT a.id, a.title, a.content, 
           TO_CHAR(a.date, 'YYYY-MM-DD') AS date, 
           a.type, a.target, u.full_name AS author_name
    FROM announcements a
    LEFT JOIN users u ON a.author_id = u.id
    ORDER BY a.date DESC
  `);

  return result.rows;
};

// Get announcements by type
export const getAnnouncementsByType = async (
  type: "announcement" | "feedback"
): Promise<Announcement[]> => {
  const result = await pool.query(
    `
    SELECT a.id, a.title, a.content, 
           TO_CHAR(a.date, 'YYYY-MM-DD') AS date, 
           a.type, a.target, u.full_name AS author_name
    FROM announcements a
    LEFT JOIN users u ON a.author_id = u.id
    WHERE a.type = $1
    ORDER BY a.date DESC
  `,
    [type]
  );

  return result.rows;
};

// Get latest announcement from admin
export const getLatestAnnouncement = async (): Promise<Announcement | null> => {
  const result = await pool.query(
    `
   SELECT a.id, a.title, a.content, 
           TO_CHAR(a.date, 'YYYY-MM-DD') AS date, 
           a.type, a.target, u.full_name AS author_name
    FROM announcements a
    LEFT JOIN users u ON a.author_id = u.id
    WHERE a.type = 'announcement'
    ORDER BY a.date DESC
    LIMIT 1

  `,
    []
  );

  return result.rows[0] || null;
};

// Get only guardian's own 2 latest feedbacks
export const getLatestFeedbacksByGuardian = async (
  guardianId: number
): Promise<Announcement[]> => {
  const result = await pool.query(
    `
    SELECT a.*, u.full_name as author_name
    FROM announcements a
    LEFT JOIN users u ON a.author_id = u.id
    WHERE a.type = 'feedback' AND a.author_id = $1
    ORDER BY a.date DESC
    LIMIT 2
    `,
    [guardianId]
  );
  return result.rows;
};

// Get feedback from guardians
export const getFeedbackFromGuardians = async (): Promise<Announcement[]> => {
  const result = await pool.query(
    `
    SELECT a.id, a.title, a.content,
           TO_CHAR(a.date, 'YYYY-MM-DD') AS date,
           a.type, a.target, a.author_id, u.full_name AS author_name
    FROM announcements a
    LEFT JOIN users u ON a.author_id = u.id
    WHERE a.type = 'feedback'
    ORDER BY a.date DESC
  `,
    []
  );

  return result.rows;
};
