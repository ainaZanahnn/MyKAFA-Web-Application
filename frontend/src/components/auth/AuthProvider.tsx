/** @format */

// components that make authentication state available to its children

import { useState, useEffect } from "react";
import type { ReactNode } from "react";
import { toast } from "react-toastify"; // ✅ import toast system
import axios from "axios";
import { AuthContext } from "./AuthContext";
import type { User, RegisterFormData } from "./AuthContext";
import authService from "@/services/authService";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // REFRESH TOKEN function
  const refreshToken = async (): Promise<boolean> => {
    try {
      const storedRefreshToken = localStorage.getItem("refreshToken");
      if (!storedRefreshToken) {
        return false;
      }

      const { token: newToken, refreshToken: newRefreshToken } = await authService.refreshToken(storedRefreshToken);

      // Store new tokens
      localStorage.setItem("token", newToken);
      if (newRefreshToken) {
        localStorage.setItem("refreshToken", newRefreshToken);
      }

      // Update user state if needed
      const { user: userData } = await authService.verifyToken();

      setUser({
        username: userData.full_name,
        email: userData.email,
        userId: userData.id_pengguna,
        role: userData.role as "student" | "admin" | "guardian",
        id: userData.id,
        full_name: userData.full_name,
        id_pengguna: userData.id_pengguna,
        tahun_darjah: userData.tahun_darjah?.toString(),
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
          const { user } = await authService.verifyToken();

          setUser({
            username: user.full_name,
            email: user.email,
            userId: user.id_pengguna,
            role: user.role as "student" | "admin" | "guardian",
            id: user.id,
            full_name: user.full_name,
            id_pengguna: user.id_pengguna,
            tahun_darjah: user.tahun_darjah?.toString(),
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

  // Set up axios response interceptor to handle 401 and 403 errors
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid, log out user
          setUser(null);
          localStorage.removeItem("token");
          localStorage.removeItem("refreshToken");
          toast.error("Sesi anda telah tamat. Sila log masuk semula.");
        } else if (error.response?.status === 403 && user && !error.config._retry) {
          // Access denied - could be role verification issue for any user type, try to refresh user data
          try {
            const token = localStorage.getItem("token");
            if (token) {
              const { user: userData } = await authService.verifyToken();

              // Update user state with fresh data
              setUser({
                username: userData.full_name,
                email: userData.email,
                userId: userData.id_pengguna,
                role: userData.role as "student" | "admin" | "guardian",
                id: userData.id,
                full_name: userData.full_name,
                id_pengguna: userData.id_pengguna,
                tahun_darjah: userData.tahun_darjah?.toString(),
              });

              // Trigger refresh for components that depend on user data
              setRefreshTrigger(prev => prev + 1);

              // Check if role changed
              if (userData.role !== user.role) {
                // Only show role change toast if the new role is valid
                const validRoles = ['student', 'guardian', 'admin'];
                if (validRoles.includes(userData.role)) {
                  toast.warning(`Peranan anda telah bertukar kepada ${userData.role}.`);
                }
              }
              // Removed session renewed toast to prevent spam

              // Retry the original request with updated token (mark as retried to prevent infinite loop)
              error.config._retry = true;
              error.config.headers.Authorization = `Bearer ${token}`;
              return axios(error.config);
            }
          } catch {
            // Refresh failed, log out
            setUser(null);
            localStorage.removeItem("token");
            localStorage.removeItem("refreshToken");
            toast.error("Sesi anda telah tamat. Sila log masuk semula.");
          }
        } else if (error.response?.status === 500) {
          // Internal server error
          toast.error("Maaf, sistem bermasalah. (500)");
        } else if (error.response?.status === 502) {
          // Bad gateway
          toast.error("Masalah pelayan. Cuba sebentar lagi. (502)");
        } else if (error.response?.status === 503) {
          // Service unavailable
          toast.error("Gangguan sementara. Sila cuba lagi. (503)");
        } else if (error.response?.status === 504) {
          // Gateway timeout
          toast.error("Sambungan lambat. Sila ulang semula. (504)");
        } else if (error.response?.status === 429) {
          // Too many requests
          toast.error("Terlalu banyak permintaan. Sila tunggu sebentar.");
        }
        return Promise.reject(error);
      }
    );

    // Cleanup interceptor on unmount
    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [user]);

  // LOGIN — now calls backend API
  const login = async (identifier: string, password: string) => {
    try {
      const response = await authService.login({ identifier, password });

      // Debug logging
      console.log("Login response:", response);

      // Check if we have a user object, which indicates successful login
      if (response.user && response.token) {
        const user = response.user;
        // Update frontend state with user data from backend
        const userData = {
          username: user.full_name,
          email: user.email,
          userId: user.id_pengguna,
          role: user.role as "student" | "admin" | "guardian",
          id: user.id,
          full_name: user.full_name,
          id_pengguna: user.id_pengguna,
          tahun_darjah: user.tahun_darjah?.toString(),
        };
        setUser(userData);

        // Store tokens in localStorage
        if (response.token) {
          localStorage.setItem("token", response.token);
        }
        if (response.refreshToken) {
          localStorage.setItem("refreshToken", response.refreshToken);
        }

        // Show success message - use Malay if the response message is in Malay
        const successMessage = response.message && response.message.includes("berjaya") ?
          response.message : "Log masuk berjaya";
        toast.success(successMessage);
        return { success: true, user: userData };
      } else {
        // Login failed
        toast.error(response.message || "Log masuk gagal");
        return { success: false, user: null };
      }
    } catch (error: unknown) {
      console.error("Login error:", error);
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || "Ralat semasa log masuk";
      toast.error(message);
      return { success: false, user: null };
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
      const response = await authService.register({
        full_name: formData.full_name,
        email: formData.email,
        password: formData.password,
        role: formData.role as "student" | "admin" | "guardian",
        id_pengguna: formData.id_pengguna,
        tahun_darjah: formData.grade ? parseInt(formData.grade) : undefined,
      });

      if (response.success && response.user) {
        const user = response.user;
        // (C) Update frontend state
        setUser({
          username: user.full_name,
          email: user.email,
          userId: user.id_pengguna,
          role: user.role as "student" | "admin" | "guardian",
          id: user.id,
          full_name: user.full_name,
          id_pengguna: user.id_pengguna,
          tahun_darjah: user.tahun_darjah?.toString(),
        });

        // Store token in localStorage
        if (response.token) {
          localStorage.setItem("token", response.token);
        }

        // (D) Show success toast
        toast.success(response.message || "Pendaftaran berjaya!");

        return { success: true, message: response.message || "Pendaftaran berjaya!" };
      } else {
        toast.error(response.message || "Registration failed");
        return { success: false, message: response.message || "Registration failed" };
      }
    } catch (error: unknown) {
      console.error("Register error:", error);

      // (E) Extract readable message
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || "Ralat semasa pendaftaran";

      // (F) Show error toast
      toast.error(message);

      return { success: false, message: message };
    }
  };

  // Provide all functions + user to app
  return (
    <AuthContext.Provider value={{ user, isLoading, refreshTrigger, login, logout, register, refreshToken }}>
      {children}
    </AuthContext.Provider>
  );
}
