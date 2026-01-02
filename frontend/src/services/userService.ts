import apiClient from '@/lib/axios';

export interface User {
  id: number;
  role: "student" | "guardian" | "admin";
  id_pengguna: string;
  full_name: string;
  email: string;
  negeri: string;
  tahun_darjah?: string;
  jenis_sekolah?: string;
  nama_sekolah?: string;
  telefon?: string;
  status?: "active" | "suspended";
  created_at?: string;
}

export interface UsersResponse {
  data: User[];
  pagination: {
    totalPages: number;
    total: number;
  };
}

class UserService {
  async getUsers(params?: {
    role?: string;
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<UsersResponse> {
    const response = await apiClient.get('/users', { params });
    return response.data;
  }

  async suspendUser(userId: number): Promise<{ success: boolean; message?: string }> {
    const response = await apiClient.patch(`/users/${userId}/suspend`, {});
    return response.data;
  }

  async deleteUser(userId: number): Promise<{ success: boolean; message?: string }> {
    const response = await apiClient.delete(`/users/${userId}`);
    return response.data;
  }
}

export default new UserService();
