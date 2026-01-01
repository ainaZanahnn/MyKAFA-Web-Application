/** @format */

import pool from "../config/db";

/* -------------------------------------------------------------------
   INTERFACE (matches lessons table)
------------------------------------------------------------------- */
export interface Lesson {
  id?: number;
  subject: string;
  title: string;
  description?: string;
  year_level: string;
  status?: 'draft' | 'published' | 'archived';
  lesson_order: number;
  created_at?: Date;
  updated_at?: Date;
}

/* -------------------------------------------------------------------
   CREATE LESSON
------------------------------------------------------------------- */
export const createLesson = async (lesson: Lesson) => {
  const { subject, title, description, year_level, status, lesson_order } = lesson;

  const result = await pool.query(
    `INSERT INTO lessons
      (subject, title, description, year_level, status, lesson_order, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
     RETURNING *`,
    [subject, title, description, year_level, status || 'draft', lesson_order]
  );

  return result.rows[0];
};

/* -------------------------------------------------------------------
   GET ALL LESSONS
------------------------------------------------------------------- */
export const getAllLessons = async () => {
  const result = await pool.query(
    `SELECT * FROM lessons ORDER BY lesson_order ASC`
  );

  return result.rows;
};

/* -------------------------------------------------------------------
   GET LESSONS BY SUBJECT AND YEAR LEVEL
------------------------------------------------------------------- */
export const getLessonsBySubjectYear = async (subject?: string, year_level?: string) => {
  let query = `SELECT * FROM lessons WHERE 1=1`;
  const values = [];

  if (subject) {
    query += ` AND subject = $${values.length + 1}`;
    values.push(subject);
  }

  if (year_level) {
    query += ` AND year_level = $${values.length + 1}`;
    values.push(year_level);
  }

  query += ` ORDER BY lesson_order ASC`;

  const result = await pool.query(query, values);
  return result.rows;
};

/* -------------------------------------------------------------------
   GET LESSON BY ID
------------------------------------------------------------------- */
export const getLessonById = async (id: number) => {
  const result = await pool.query(
    `SELECT * FROM lessons WHERE id = $1`,
    [id]
  );

  return result.rows[0];
};

/* -------------------------------------------------------------------
   UPDATE LESSON
------------------------------------------------------------------- */
export const updateLesson = async (id: number, updates: Partial<Lesson>) => {
  const fields = [];
  const values = [];
  let paramIndex = 1;

  for (const [key, value] of Object.entries(updates)) {
    if (value !== undefined) {
      fields.push(`${key} = $${paramIndex}`);
      values.push(value);
      paramIndex++;
    }
  }

  if (fields.length === 0) return null;

  const query = `UPDATE lessons SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${paramIndex} RETURNING *`;
  values.push(id);

  const result = await pool.query(query, values);
  return result.rows[0];
};

/* -------------------------------------------------------------------
   UPDATE LESSON STATUS
------------------------------------------------------------------- */
export const updateLessonStatus = async (id: number, status: string) => {
  const result = await pool.query(
    `UPDATE lessons SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
    [status, id]
  );

  return result.rows[0];
};

/* -------------------------------------------------------------------
   DELETE LESSON
------------------------------------------------------------------- */
export const deleteLesson = async (id: number) => {
  const result = await pool.query(
    `DELETE FROM lessons WHERE id = $1 RETURNING *`,
    [id]
  );

  return result.rows[0];
};

/* -------------------------------------------------------------------
   GET LESSONS WITH MATERIALS
------------------------------------------------------------------- */
export const getLessonsWithMaterials = async (subject?: string, year_level?: string) => {
  let query = `
    SELECT l.*,
           json_agg(
             json_build_object(
               'id', lm.id,
               'type', lm.type,
               'title', lm.title,
               'url', lm.url
             )
           ) FILTER (WHERE lm.id IS NOT NULL) as materials
    FROM lessons l
    LEFT JOIN lesson_materials lm ON l.id = lm.lesson_id
    WHERE 1=1
  `;
  const values = [];

  if (subject) {
    query += ` AND l.subject = $${values.length + 1}`;
    values.push(subject);
  }

  if (year_level) {
    query += ` AND l.year_level = $${values.length + 1}`;
    values.push(year_level);
  }

  query += ` GROUP BY l.id ORDER BY l.lesson_order ASC`;

  const result = await pool.query(query, values);
  return result.rows;
};

/* -------------------------------------------------------------------
   GET LESSON WITH MATERIALS BY ID
------------------------------------------------------------------- */
export const getLessonWithMaterialsById = async (id: number) => {
  const query = `
    SELECT l.*,
           json_agg(
             json_build_object(
               'id', lm.id,
               'type', lm.type,
               'title', lm.title,
               'url', lm.url
             )
           ) FILTER (WHERE lm.id IS NOT NULL) as materials
    FROM lessons l
    LEFT JOIN lesson_materials lm ON l.id = lm.lesson_id
    WHERE l.id = $1
    GROUP BY l.id
  `;

  const result = await pool.query(query, [id]);
  return result.rows[0];
};

/* -------------------------------------------------------------------
   GET DISTINCT TOPICS (TITLES) BY SUBJECT AND YEAR LEVEL
------------------------------------------------------------------- */
export const getTopicsBySubjectYear = async (subject: string, year_level: string) => {
  const query = `
    SELECT DISTINCT title as topic
    FROM lessons
    WHERE subject = $1 AND year_level = $2 AND status = 'published'
    ORDER BY title ASC
  `;

  const result = await pool.query(query, [subject, year_level]);
  return result.rows.map(row => row.topic);
};
