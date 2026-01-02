import apiClient from '@/lib/axios';

export interface LoginData {
  identifier: string;
  password: string;
}

export interface RegisterData {
  full_name: string;
  email: string;
  password: string;
  role: 'student' | 'guardian' | 'admin';
  id_pengguna: string;
  tahun_darjah?: number;
}

export interface User {
  id: number;
  full_name: string;
  email: string;
  role: string;
  id_pengguna: string;
  tahun_darjah?: number;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  token?: string;
  refreshToken?: string;
  message?: string;
}

class AuthService {
  async login(data: LoginData): Promise<AuthResponse> {
    const response = await apiClient.post('/auth/login', data);
    return response.data;
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await apiClient.post('/auth/register', data);
    return response.data;
  }

  async verifyToken(): Promise<{ user: User }> {
    const response = await apiClient.get('/auth/verify');
    return response.data;
  }

  async refreshToken(refreshToken: string): Promise<{ token: string; refreshToken?: string }> {
    const response = await apiClient.post('/auth/refresh', { refreshToken });
    return response.data;
  }

  async logout(): Promise<void> {
    await apiClient.post('/auth/logout');
  }
}

export default new AuthService();
