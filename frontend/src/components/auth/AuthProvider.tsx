/** @format */

// components that make authentication state available to its children

import { useState, useEffect } from "react";
import type { ReactNode } from "react";
import axios from "axios";
import { toast } from "react-toastify"; // ✅ import toast system
import { AuthContext } from "./AuthContext";
import type { User, RegisterFormData, AxiosError } from "./AuthContext";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // REFRESH TOKEN function
  const refreshToken = async (): Promise<boolean> => {
    try {
      const storedRefreshToken = localStorage.getItem("refreshToken");
      if (!storedRefreshToken) {
        return false;
      }

      const response = await axios.post("http://localhost:5000/api/auth/refresh", {
        refreshToken: storedRefreshToken,
      });

      const { token: newToken, refreshToken: newRefreshToken } = response.data;

      // Store new tokens
      localStorage.setItem("token", newToken);
      if (newRefreshToken) {
        localStorage.setItem("refreshToken", newRefreshToken);
      }

      // Update user state if needed
      const verifyResponse = await axios.get("http://localhost:5000/api/auth/verify");
      const { user: userData } = verifyResponse.data;

      setUser({
        username: userData.full_name,
        email: userData.email,
        userId: userData.id_pengguna,
        role: userData.role,
        id: userData.id,
        full_name: userData.full_name,
        id_pengguna: userData.id_pengguna,
        tahun_darjah: userData.tahun_darjah,
      });

      return true;
    } catch (error) {
      console.error("Token refresh failed:", error);
      // Clear tokens on refresh failure
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      setUser(null);
      return false;
    }
  };

  // Check for existing token on app load
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem("token");
      const storedRefreshToken = localStorage.getItem("refreshToken");

      if (token) {
        try {
          // Validate token with backend
          const response = await axios.get("http://localhost:5000/api/auth/verify", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          const { user } = response.data;

          setUser({
            username: user.full_name,
            email: user.email,
            userId: user.id_pengguna,
            role: user.role,
            id: user.id,
            full_name: user.full_name,
            id_pengguna: user.id_pengguna,
            tahun_darjah: user.tahun_darjah,
          });
        } catch {
          // Token invalid, try refresh
          if (storedRefreshToken) {
            await refreshToken();
          }
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  // Set up axios response interceptor to handle 401 errors
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid, log out user
          setUser(null);
          localStorage.removeItem("token");
          toast.error("Sesi anda telah tamat. Sila log masuk semula.");
        }
        return Promise.reject(error);
      }
    );

    // Cleanup interceptor on unmount
    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, []);

  // LOGIN — now calls backend API
  const login = async (identifier: string, password: string) => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/login",
        { identifier, password }
      );

      const { user, message } = response.data;

      // Update frontend state with user data from backend
      setUser({
        username: user.full_name,
        email: user.email,
        userId: user.id_pengguna,
        role: user.role,
        id: user.id,
        full_name: user.full_name,
        id_pengguna: user.id_pengguna,
        tahun_darjah: user.tahun_darjah,
      });

      // Store tokens in localStorage
      localStorage.setItem("token", response.data.token);
      if (response.data.refreshToken) {
        localStorage.setItem("refreshToken", response.data.refreshToken);
      }

      toast.success(message);
      return true;
    } catch (error: unknown) {
      console.error("Login error:", error);
      const axiosError = error as AxiosError;
      const message = axiosError.response?.data?.message || "Ralat semasa log masuk";
      toast.error(message);
      return false;
    }
  };

  // LOGOUT
  const logout = () => {
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    toast.info("Anda telah log keluar.");
  };

  // REGISTER — talks to your backend
  const register = async (formData: RegisterFormData) => {
    try {
      // (A) Send data to backend
      const response = await axios.post(
        "http://localhost:5000/api/auth/register",
        formData
      );

      // (B) Extract success data from backend
      const { message, user } = response.data;

      // (C) Update frontend state
      setUser({
        username: user.full_name,
        email: user.email,
        userId: user.id_pengguna,
        role: user.role,
        id: user.id,
        full_name: user.full_name,
        id_pengguna: user.id_pengguna,
        tahun_darjah: user.tahun_darjah,
      });

      // Store token in localStorage
      localStorage.setItem("token", response.data.token);

      // (D) Show success toast
      toast.success(message || "Pendaftaran berjaya!");

      return { success: true, message };
    } catch (error: unknown) {
      console.error("Register error:", error);

      // (E) Extract readable message
      const axiosError = error as AxiosError;
      const message =
        axiosError.response?.data?.message || "Ralat semasa pendaftaran";

      // (F) Show error toast
      toast.error(message);

      return { success: false, message };
    }
  };

  // Provide all functions + user to app
  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, register, refreshToken }}>
      {children}
    </AuthContext.Provider>
  );
}
