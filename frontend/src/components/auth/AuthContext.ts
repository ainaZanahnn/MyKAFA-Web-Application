
//all types (User, RegisterFormData, AxiosError, AuthContextType) and the AuthContext in this file.

import { createContext } from "react";

// (1) Define user data type
export interface User {
  username: string;
  email: string;
  userId: string;
  role: "student" | "admin" | "guardian";
  id?: number;
  full_name?: string;
  id_pengguna?: string;
  tahun_darjah?: string;
}

// (2) Define registration form data type
export interface RegisterFormData {
  role: string;
  id_pengguna: string;
  full_name: string;
  email: string;
  state: string;
  grade?: string;
  schoolType?: string;
  schoolName?: string;
  phone?: string;
  password: string;
}

// (3) Define axios error type for type assertions
export interface AxiosError {
  response?: {
    data?: {
      message?: string;
    };
    status?: number;
  };
}

// (4) Define what our AuthContext provides
export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (identifier: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (
    formData: RegisterFormData
  ) => Promise<{ success: boolean; message: string }>;
  refreshToken: () => Promise<boolean>;
}

// (5) Create the actual context
export const AuthContext = createContext<AuthContextType | undefined>(undefined);
