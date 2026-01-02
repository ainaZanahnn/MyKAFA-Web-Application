import apiClient from '@/lib/axios';

export interface ApiPaper {
  id: number;
  year: string;
  subject: string;
  type?: string;
  file_path?: string;
  status?: string;
  downloads?: number;
  color?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Paper {
  id: string;
  year: number;
  subject: string;
  type?: string;
  file_path?: string;
  status?: string;
  downloads?: number;
  color: string;
  created_at?: string;
  updated_at?: string;
}

export interface UPKKResponse {
  success: boolean;
  data?: ApiPaper[];
  message?: string;
}

class UPKKService {
  async getPapers(): Promise<UPKKResponse> {
    const response = await apiClient.get('/upkk');
    return response.data;
  }

  async createPaper(formData: FormData): Promise<{ success: boolean; data?: ApiPaper; message?: string }> {
    const response = await apiClient.post('/upkk', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async updatePaper(id: number, formData: FormData): Promise<{ success: boolean; data?: ApiPaper; message?: string }> {
    const response = await apiClient.put(`/upkk/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async deletePaper(id: number): Promise<{ success: boolean; message?: string }> {
    const response = await apiClient.delete(`/upkk/${id}`);
    return response.data;
  }

  async archivePaper(id: number): Promise<{ success: boolean; message?: string }> {
    const response = await apiClient.patch(`/upkk/${id}/archive`, {});
    return response.data;
  }

  async downloadPaper(paperId: string): Promise<Blob> {
    const response = await apiClient.post(`/upkk/${paperId}/download`, {}, {
      responseType: 'blob',
    });
    return response.data;
  }

  async viewPaper(paperId: string): Promise<string> {
    const response = await apiClient.get(`/upkk/${paperId}/view`);
    return response.data;
  }
}

export default new UPKKService();
