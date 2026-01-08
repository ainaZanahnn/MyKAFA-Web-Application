import { Request, Response } from 'express';
import LessonService from '../services/LessonService';

export const getLessons = async (req: Request, res: Response) => {
  try {
    const { subject, year_level, page = 1, limit = 10 } = req.query;

    const result = await LessonService.getLessons({
      subject: subject as string,
      year_level: year_level as string,
      page: Number(page),
      limit: Number(limit)
    });

    res.json(result);
  } catch (error: any) {
    console.error('Error fetching lessons:', error);
    res.status(500).json({ error: 'Failed to fetch lessons' });
  }
};

export const getLessonById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const lesson = await LessonService.getLessonById(id);
    res.json(lesson);
  } catch (error: unknown) {
  if (error instanceof Error && error.message === 'Lesson not found') {
    return res.status(404).json({ error: 'Lesson not found' });
  }

  console.error('Error fetching lesson:', error);
  res.status(500).json({ error: 'Failed to fetch lesson' });
}

};

export const createLesson = async (req: Request, res: Response) => {
  try {
    let { subject, title, description, year_level, status, lesson_order, materials } = req.body;
    const files = req.files as Express.Multer.File[];

    // Parse materials if it's sent as FormData (object with numeric keys)
    if (materials && typeof materials === 'object' && !Array.isArray(materials)) {
      materials = Object.values(materials);
    } else if (!materials) {
      materials = [];
    }

    const lesson = await LessonService.createLesson({
      subject,
      title,
      description,
      year_level,
      status: status || 'draft',
      lesson_order: lesson_order || 1,
      materials
    }, files);

    res.status(201).json(lesson);
  } catch (error: any) {
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

    const updatedLesson = await LessonService.updateLesson(id, {
      subject,
      title,
      description,
      year_level,
      status,
      lesson_order,
      materials
    });

    res.json(updatedLesson);
  } catch (error: any) {
    if (error.message === 'Lesson not found') {
      return res.status(404).json({ error: 'Lesson not found' });
    }
    console.error('Error updating lesson:', error);
    res.status(500).json({ error: 'Failed to update lesson' });
  }
};

export const updateLessonStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    await LessonService.updateLessonStatus(id, status);

    res.json({ message: 'Lesson status updated successfully' });
  } catch (error: any) {
    if (error.message === 'Lesson not found') {
      return res.status(404).json({ error: 'Lesson not found' });
    }
    console.error('Error updating lesson status:', error);
    res.status(500).json({ error: 'Failed to update lesson status' });
  }
};

export const deleteLesson = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await LessonService.deleteLesson(id);

    res.json({ message: 'Lesson deleted successfully' });
  } catch (error: any) {
    if (error.message === 'Lesson not found') {
      return res.status(404).json({ error: 'Lesson not found' });
    }
    console.error('Error deleting lesson:', error);
    res.status(500).json({ error: 'Failed to delete lesson' });
  }
};

export const getTopics = async (req: Request, res: Response) => {
  try {
    const { subject, year_level } = req.query;

    const topics = await LessonService.getTopics(subject as string, year_level as string);
    res.json(topics);
  } catch (error: any) {
    if (error.message === 'Subject and year_level are required') {
      return res.status(400).json({ error: 'Subject and year_level are required' });
    }
    console.error('Error fetching topics:', error);
    res.status(500).json({ error: 'Failed to fetch topics' });
  }
};

export const viewMaterial = async (req: Request, res: Response) => {
  try {
    const { id, materialId } = req.params;

    const filePath = await LessonService.viewMaterial(id, materialId);

    // Send file
    res.sendFile(filePath);
  } catch (error: any) {
    if (error.message === 'Material not found' || error.message === 'File not found') {
      return res.status(404).json({ error: error.message });
    }
    console.error('Error viewing material:', error);
    res.status(500).json({ error: 'Failed to view material' });
  }
};
