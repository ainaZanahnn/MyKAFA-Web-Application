import { Request, Response } from 'express';
import pool from '../config/db';

export const getLessons = async (req: Request, res: Response) => {
  try {
    const { subject, year_level } = req.query;

    let query = `
      SELECT l.id, l.subject, l.title, l.description, l.year_level as "yearLevel", l.status, l.lesson_order as "order", l.created_at, l.updated_at,
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
    `;

    const conditions = [];
    const values = [];

    if (subject) {
      conditions.push(`l.subject = $${values.length + 1}`);
      values.push(subject);
    }

    if (year_level) {
      conditions.push(`l.year_level = $${values.length + 1}`);
      values.push(year_level);
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }

    query += ` GROUP BY l.id ORDER BY l.lesson_order ASC`;

    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching lessons:', error);
    res.status(500).json({ error: 'Failed to fetch lessons' });
  }
};

export const getLessonById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT l.id, l.subject, l.title, l.description, l.year_level as "yearLevel", l.status, l.lesson_order as "order", l.created_at, l.updated_at,
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

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching lesson:', error);
    res.status(500).json({ error: 'Failed to fetch lesson' });
  }
};

export const createLesson = async (req: Request, res: Response) => {
  try {
    const { subject, title, description, year_level, status, lesson_order, materials } = req.body;
    const files = req.files as Express.Multer.File[];

    // Create lesson
    const lessonQuery = `
      INSERT INTO lessons (subject, title, description, year_level, status, lesson_order, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
      RETURNING id
    `;

    const lessonResult = await pool.query(lessonQuery, [
      subject,
      title,
      description,
      year_level,
      status || 'Draft',
      lesson_order || 1,
    ]);

    const lessonId = lessonResult.rows[0].id;

    // Create materials if provided
    if (materials && materials.length > 0) {
      const materialsData = materials.map((material: any, index: number) => {
        let url = material.url;

        // If this material has a file upload, use the uploaded file path
        if (files && files[index]) {
          url = files[index].filename;
        }

        return {
          type: material.type,
          title: material.title,
          url: url,
        };
      });

      // Filter out materials without URLs
      const validMaterials = materialsData.filter((material: { type: string; title: string; url: string }) => material.url && material.url.trim() !== '');

      if (validMaterials.length > 0) {
        const materialsQuery = `
          INSERT INTO lesson_materials (lesson_id, type, title, url)
          VALUES ${validMaterials.map((_: any, index: number) => `($${index * 4 + 1}, $${index * 4 + 2}, $${index * 4 + 3}, $${index * 4 + 4})`).join(', ')}
        `;

        const materialsValues = validMaterials.flatMap((material: any) => [
          lessonId,
          material.type,
          material.title,
          material.url,
        ]);

        await pool.query(materialsQuery, materialsValues);
      }
    }

    // Fetch the created lesson with materials
    const fetchQuery = `
      SELECT l.id, l.subject, l.title, l.description, l.year_level as "yearLevel", l.status, l.lesson_order as "order", l.created_at, l.updated_at,
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

    const result = await pool.query(fetchQuery, [lessonId]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating lesson:', error);
    res.status(500).json({ error: 'Failed to create lesson' });
  }
};

export const updateLesson = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    let { subject, title, description, year_level, status, lesson_order, materials } = req.body;

    // Parse materials if it's sent as FormData (object with numeric keys)
    if (materials && typeof materials === 'object' && !Array.isArray(materials)) {
      materials = Object.values(materials);
    } else if (!materials) {
      materials = [];
    }

    // Check if lesson exists
    const checkQuery = 'SELECT id FROM lessons WHERE id = $1';
    const checkResult = await pool.query(checkQuery, [id]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    // Update lesson
    const updateQuery = `
      UPDATE lessons
      SET subject = $1, title = $2, description = $3, year_level = $4, status = $5, lesson_order = $6, updated_at = NOW()
      WHERE id = $7
    `;

    await pool.query(updateQuery, [
      subject,
      title,
      description,
      year_level,
      status,
      lesson_order,
      id,
    ]);

    // Update materials if provided
    if (materials !== undefined) {
      // Delete existing materials
      await pool.query('DELETE FROM lesson_materials WHERE lesson_id = $1', [id]);

      // Create new materials
      if (materials.length > 0) {
        const materialsQuery = `
          INSERT INTO lesson_materials (lesson_id, type, title, url)
          VALUES ${materials.map((_: any, index: number) => `($${index * 4 + 1}, $${index * 4 + 2}, $${index * 4 + 3}, $${index * 4 + 4})`).join(', ')}
        `;

        const materialsValues = materials.flatMap((material: any) => [
          id,
          material.type,
          material.title,
          material.url,
        ]);

        await pool.query(materialsQuery, materialsValues);
      }
    }

    // Fetch updated lesson with materials
    const fetchQuery = `
      SELECT l.id, l.subject, l.title, l.description, l.year_level as "yearLevel", l.status, l.lesson_order as "order", l.created_at, l.updated_at,
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

    const result = await pool.query(fetchQuery, [id]);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating lesson:', error);
    res.status(500).json({ error: 'Failed to update lesson' });
  }
};

export const updateLessonStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Check if lesson exists
    const checkQuery = 'SELECT id FROM lessons WHERE id = $1';
    const checkResult = await pool.query(checkQuery, [id]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    // Update lesson status
    const updateQuery = 'UPDATE lessons SET status = $1, updated_at = NOW() WHERE id = $2';
    await pool.query(updateQuery, [status, id]);

    res.json({ message: 'Lesson status updated successfully' });
  } catch (error) {
    console.error('Error updating lesson status:', error);
    res.status(500).json({ error: 'Failed to update lesson status' });
  }
};

export const deleteLesson = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if lesson exists
    const checkQuery = 'SELECT id FROM lessons WHERE id = $1';
    const checkResult = await pool.query(checkQuery, [id]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    // Delete materials first (due to foreign key constraint)
    await pool.query('DELETE FROM lesson_materials WHERE lesson_id = $1', [id]);

    // Delete lesson
    await pool.query('DELETE FROM lessons WHERE id = $1', [id]);

    res.json({ message: 'Lesson deleted successfully' });
  } catch (error) {
    console.error('Error deleting lesson:', error);
    res.status(500).json({ error: 'Failed to delete lesson' });
  }
};

export const viewMaterial = async (req: Request, res: Response) => {
  try {
    const { id, materialId } = req.params;

    // Get material details
    const materialQuery = `
      SELECT lm.* FROM lesson_materials lm
      JOIN lessons l ON lm.lesson_id = l.id
      WHERE lm.id = $1 AND l.id = $2
    `;

    const materialResult = await pool.query(materialQuery, [materialId, id]);

    if (materialResult.rows.length === 0) {
      return res.status(404).json({ error: 'Material not found' });
    }

    const material = materialResult.rows[0];
    const filePath = `uploads/${material.url}`;

    // Check if file exists
    const fs = require('fs');
    const path = require('path');

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Send file
    res.sendFile(path.resolve(filePath));
  } catch (error) {
    console.error('Error viewing material:', error);
    res.status(500).json({ error: 'Failed to view material' });
  }
};
