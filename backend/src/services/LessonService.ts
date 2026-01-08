import pool from '../config/db';
import { getTopicsBySubjectYear } from '../models/lessonModel';
import fs from 'fs';
import path from 'path';

interface LessonData {
  subject: string;
  title: string;
  description: string;
  year_level: string;
  status: string;
  lesson_order: number;
  materials?: any[];
}

interface MaterialData {
  type: string;
  title: string;
  url: string;
}

interface LessonFilters {
  subject?: string;
  year_level?: string;
  page?: number;
  limit?: number;
}

interface PaginationResult {
  data: any[];
  pagination: {
    currentPage: number;
    totalPages: number;
    total: number;
    limit: number;
  };
}

// Status mapping between English (DB) and Malay (Frontend)
const statusMap = {
  'draft': 'draf',
  'published': 'diterbitkan',
  'archived': 'diarkibkan'
};

const reverseStatusMap = {
  'draf': 'draft',
  'diterbitkan': 'published',
  'diarkibkan': 'archived'
};

// Year level mapping between English (DB) and Malay (Frontend)
const yearMap = {
  'Year 1': 'Tahun 1',
  'Year 2': 'Tahun 2',
  'Year 3': 'Tahun 3',
  'Year 4': 'Tahun 4',
  'Year 5': 'Tahun 5',
  'Year 6': 'Tahun 6'
};

const reverseYearMap = {
  'Tahun 1': 'Year 1',
  'Tahun 2': 'Year 2',
  'Tahun 3': 'Year 3',
  'Tahun 4': 'Year 4',
  'Tahun 5': 'Year 5',
  'Tahun 6': 'Year 6'
};

class LessonService {
  private mapLessonForFrontend(lesson: any) {
    return {
      ...lesson,
      status: statusMap[lesson.status as keyof typeof statusMap] || lesson.status,
      yearLevel: yearMap[lesson.yearLevel as keyof typeof yearMap] || lesson.yearLevel
    };
  }

  private mapLessonsForFrontend(lessons: any[]) {
    return lessons.map(lesson => this.mapLessonForFrontend(lesson));
  }

  async getLessons(filters: LessonFilters): Promise<PaginationResult> {
    const { subject, year_level, page = 1, limit = 10 } = filters;
    const offset = (Number(page) - 1) * Number(limit);

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

    // Get total count for pagination
    const countQuery = `SELECT COUNT(*) as total FROM (${query}) as subquery`;
    const countResult = await pool.query(countQuery, values);
    const total = parseInt(countResult.rows[0].total);

    // Add pagination to main query
    query += ` LIMIT $${values.length + 1} OFFSET $${values.length + 2}`;
    values.push(Number(limit), offset);

    const result = await pool.query(query, values);

    const mappedData = this.mapLessonsForFrontend(result.rows);
    const totalPages = Math.ceil(total / Number(limit));

    return {
      data: mappedData,
      pagination: {
        currentPage: Number(page),
        totalPages,
        total,
        limit: Number(limit)
      }
    };
  }

  async getLessonById(id: string) {
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
      throw new Error('Lesson not found');
    }

    return this.mapLessonForFrontend(result.rows[0]);
  }

  async createLesson(lessonData: LessonData, files?: Express.Multer.File[]) {
    let { subject, title, description, year_level, status, lesson_order, materials } = lessonData;

    // Parse materials if it's sent as FormData (object with numeric keys)
    if (materials && typeof materials === 'object' && !Array.isArray(materials)) {
      materials = Object.values(materials);
    } else if (!materials) {
      materials = [];
    }

    // Convert Malay year level to English for DB storage
    const dbYearLevel = reverseYearMap[year_level as keyof typeof reverseYearMap] || year_level;

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
      dbYearLevel,
      status || 'draft',
      lesson_order || 1,
    ]);

    const lessonId = lessonResult.rows[0].id;

    // Create materials if provided
    if (materials && materials.length > 0) {
      await this.createMaterials(lessonId, materials, files);
    }

    // Fetch the created lesson with materials
    return await this.getLessonById(lessonId);
  }

  private async createMaterials(lessonId: number, materials: any[], files?: Express.Multer.File[]) {
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
    const validMaterials = materialsData.filter((material: MaterialData) => material.url && material.url.trim() !== '');

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

  async updateLesson(id: string, lessonData: Partial<LessonData>) {
    let { subject, title, description, year_level, status, lesson_order, materials } = lessonData;

    // Parse materials if it's sent as FormData (object with numeric keys)
    if (materials && typeof materials === 'object' && !Array.isArray(materials)) {
      materials = Object.values(materials);
    } else if (!materials) {
      materials = [];
    }

    // Check if lesson exists and get current material count
    const checkQuery = `
      SELECT l.id, l.subject, l.title, l.year_level,
             COUNT(lm.id) as current_material_count
      FROM lessons l
      LEFT JOIN lesson_materials lm ON l.id = lm.lesson_id
      WHERE l.id = $1
      GROUP BY l.id, l.subject, l.title, l.year_level
    `;
    const checkResult = await pool.query(checkQuery, [id]);

    if (checkResult.rows.length === 0) {
      throw new Error('Lesson not found');
    }

    const currentMaterialCount = parseInt(checkResult.rows[0].current_material_count);

    // Convert Malay year level to English for DB storage
    const dbYearLevel = year_level ? (reverseYearMap[year_level as keyof typeof reverseYearMap] || year_level) : undefined;

    // Update lesson
    const updateFields = [];
    const updateValues = [];
    let paramIndex = 1;

    if (subject !== undefined) {
      updateFields.push(`subject = $${paramIndex++}`);
      updateValues.push(subject);
    }
    if (title !== undefined) {
      updateFields.push(`title = $${paramIndex++}`);
      updateValues.push(title);
    }
    if (description !== undefined) {
      updateFields.push(`description = $${paramIndex++}`);
      updateValues.push(description);
    }
    if (dbYearLevel !== undefined) {
      updateFields.push(`year_level = $${paramIndex++}`);
      updateValues.push(dbYearLevel);
    }
    if (status !== undefined) {
      updateFields.push(`status = $${paramIndex++}`);
      updateValues.push(status);
    }
    if (lesson_order !== undefined) {
      updateFields.push(`lesson_order = $${paramIndex++}`);
      updateValues.push(lesson_order);
    }

    updateFields.push(`updated_at = NOW()`);
    updateValues.push(id);

    const updateQuery = `
      UPDATE lessons
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex}
    `;

    await pool.query(updateQuery, updateValues);

    // Update materials if provided
    if (materials !== undefined) {
      await this.updateMaterials(id, materials);
    }

    // Fetch updated lesson with materials
    return await this.getLessonById(id);
  }

  private async updateMaterials(lessonId: string, materials: any[]) {
    // Get existing materials to preserve IDs when possible
    const existingMaterials = await pool.query(
      'SELECT id, type, title, url FROM lesson_materials WHERE lesson_id = $1 ORDER BY id',
      [lessonId]
    );

    // Create a map of existing materials by title+type for matching
    const existingMap = new Map();
    existingMaterials.rows.forEach((mat: any) => {
      const key = `${mat.title.trim()}-${mat.type}`;
      existingMap.set(key, mat);
    });

    // Process materials: update existing ones, create new ones
    const materialsToUpdate: any[] = [];
    const materialsToCreate: any[] = [];

    materials.forEach((material: any) => {
      const key = `${material.title.trim()}-${material.type}`;
      const existing = existingMap.get(key);

      if (existing) {
        // Update existing material (preserve ID)
        materialsToUpdate.push({
          id: existing.id,
          type: material.type,
          title: material.title,
          url: material.url,
        });
        // Remove from map so it doesn't get deleted
        existingMap.delete(key);
      } else {
        // Create new material
        materialsToCreate.push(material);
      }
    });

    // Update existing materials that matched
    for (const material of materialsToUpdate) {
      await pool.query(
        'UPDATE lesson_materials SET type = $1, title = $2, url = $3 WHERE id = $4',
        [material.type, material.title, material.url, material.id]
      );
    }

    // Create new materials
    if (materialsToCreate.length > 0) {
      const materialsQuery = `
        INSERT INTO lesson_materials (lesson_id, type, title, url)
        VALUES ${materialsToCreate.map((_: any, index: number) => `($${index * 4 + 1}, $${index * 4 + 2}, $${index * 4 + 3}, $${index * 4 + 4})`).join(', ')}
      `;

      const materialsValues = materialsToCreate.flatMap((material: any) => [
        lessonId,
        material.type,
        material.title,
        material.url,
      ]);

      await pool.query(materialsQuery, materialsValues);
    }

    // Delete materials that are no longer in the updated list
    const materialsToDelete = Array.from(existingMap.values()).map((mat: any) => mat.id);
    if (materialsToDelete.length > 0) {
      await pool.query(
        `DELETE FROM lesson_materials WHERE id = ANY($1)`,
        [materialsToDelete]
      );
    }
  }

  async updateLessonStatus(id: string, status: string) {
    // Check if lesson exists
    const checkQuery = 'SELECT id FROM lessons WHERE id = $1';
    const checkResult = await pool.query(checkQuery, [id]);

    if (checkResult.rows.length === 0) {
      throw new Error('Lesson not found');
    }

    // Convert Malay status to English for DB
    const dbStatus = reverseStatusMap[status as keyof typeof reverseStatusMap] || status;

    // Update lesson status
    const updateQuery = 'UPDATE lessons SET status = $1, updated_at = NOW() WHERE id = $2';
    await pool.query(updateQuery, [dbStatus, id]);
  }

  async deleteLesson(id: string) {
    // Check if lesson exists
    const checkQuery = 'SELECT id FROM lessons WHERE id = $1';
    const checkResult = await pool.query(checkQuery, [id]);

    if (checkResult.rows.length === 0) {
      throw new Error('Lesson not found');
    }

    // Delete related student progress records first (due to foreign key constraint)
    await pool.query('DELETE FROM student_progress WHERE lesson_id = $1', [id]);

    // Delete materials (due to foreign key constraint)
    await pool.query('DELETE FROM lesson_materials WHERE lesson_id = $1', [id]);

    // Delete lesson
    await pool.query('DELETE FROM lessons WHERE id = $1', [id]);
  }

  async getTopics(subject: string, year_level: string) {
    if (!subject || !year_level) {
      throw new Error('Subject and year_level are required');
    }

    return await getTopicsBySubjectYear(subject, year_level);
  }

  async viewMaterial(lessonId: string, materialId: string) {
    // Get material details
    const materialQuery = `
      SELECT lm.* FROM lesson_materials lm
      JOIN lessons l ON lm.lesson_id = l.id
      WHERE lm.id = $1 AND l.id = $2
    `;

    const materialResult = await pool.query(materialQuery, [materialId, lessonId]);

    if (materialResult.rows.length === 0) {
      throw new Error('Material not found');
    }

    const material = materialResult.rows[0];
    const filePath = `uploads/${material.url}`;

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      throw new Error('File not found');
    }

    return path.resolve(filePath);
  }
}

export default new LessonService();
