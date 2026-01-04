import apiClient from '@/lib/axios';

export interface LessonMaterial {
  id: number;
  type: "PDF" | "PPT" | "Video" | "Audio" | "Link";
  title: string;
  url?: string;
  file?: File;
}

export interface Lesson {
  id: number;
  subject: string;
  title: string;
  description: string;
  yearLevel: string;
  status: string;
  order: number;
  materials: LessonMaterial[];
  created_at?: string;
  updated_at?: string;
}

export interface CreateLessonData {
  subject: string;
  title: string;
  description: string;
  year_level: string;
  status: string;
  lesson_order: number;
  materials: Array<{
    type: string;
    title: string;
    url?: string;
  }>;
}

// UpdateLessonData is the same as CreateLessonData for now
export type UpdateLessonData = CreateLessonData;

class LessonService {
  async getLessons(params?: {
    year_level?: string;
    subject?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    data: Lesson[];
    pagination: {
      total: number;
      totalPages: number;
      currentPage: number;
    };
  }> {
    const response = await apiClient.get('/lessons', { params });
    return response.data;
  }

  async createLesson(data: CreateLessonData, files?: File[]): Promise<Lesson> {
    const formData = new FormData();

    // Add lesson data
    Object.entries(data).forEach(([key, value]) => {
      if (key === 'materials') {
        (value as Array<{ type: string; title: string; url?: string }>).forEach((material, index) => {
          formData.append(`materials[${index}][type]`, material.type);
          formData.append(`materials[${index}][title]`, material.title);
          if (material.url) {
            formData.append(`materials[${index}][url]`, material.url);
          }
        });
      } else {
        formData.append(key, value.toString());
      }
    });

    // Add files
    if (files) {
      files.forEach(file => {
        formData.append('files', file);
      });
    }

    const response = await apiClient.post('/lessons', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async updateLesson(id: number, data: CreateLessonData, files?: File[]): Promise<Lesson> {
    const formData = new FormData();

    // Add lesson data
    Object.entries(data).forEach(([key, value]) => {
      if (key === 'materials') {
        (value as Array<{ type: string; title: string; url?: string }>).forEach((material, index) => {
          formData.append(`materials[${index}][type]`, material.type);
          formData.append(`materials[${index}][title]`, material.title);
          if (material.url) {
            formData.append(`materials[${index}][url]`, material.url);
          }
        });
      } else {
        formData.append(key, value.toString());
      }
    });

    // Add files
    if (files) {
      files.forEach(file => {
        formData.append('files', file);
      });
    }

    const response = await apiClient.put(`/lessons/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async updateLessonStatus(id: number, status: string): Promise<{ success: boolean; message?: string }> {
    const response = await apiClient.patch(`/lessons/${id}/status`, { status });
    return response.data;
  }

  async deleteLesson(id: number): Promise<{ success: boolean; message?: string }> {
    const response = await apiClient.delete(`/lessons/${id}`);
    return response.data;
  }

  async getTopics(subject: string, year_level: string): Promise<string[]> {
    const response = await apiClient.get('/lessons/topics', {
      params: { subject, year_level }
    });
    return response.data;
  }
}

export default new LessonService();
