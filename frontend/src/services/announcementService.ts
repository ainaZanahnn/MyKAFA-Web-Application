import apiClient from '@/lib/axios';

export interface Announcement {
  id: number;
  title: string;
  content: string;
  date: string;
  target: 'semua' | 'penjaga' | 'pelajar';
  author_id?: number;
  type?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateAnnouncementData {
  title: string;
  content: string;
  date: string;
  type: string;
  target: 'semua' | 'penjaga' | 'pelajar';
  author_id?: number;
}

class AnnouncementService {
  async getAnnouncements(): Promise<{ data: Announcement[]; success: boolean }> {
    const response = await apiClient.get('/announcements');
    return response.data;
  }

  async createAnnouncement(data: CreateAnnouncementData): Promise<{ success: boolean; message?: string; data?: Announcement }> {
    const response = await apiClient.post('/announcements', data);
    return response.data;
  }

  async updateAnnouncement(id: number, data: Partial<CreateAnnouncementData>): Promise<{ success: boolean; message?: string }> {
    const response = await apiClient.put(`/announcements/${id}`, data);
    return response.data;
  }

  async deleteAnnouncement(id: number): Promise<{ success: boolean; message?: string }> {
    const response = await apiClient.delete(`/announcements/${id}`);
    return response.data;
  }
}

export default new AnnouncementService();
