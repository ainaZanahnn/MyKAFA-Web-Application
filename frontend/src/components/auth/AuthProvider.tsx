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
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // REFRESH TOKEN function
  const refreshToken = async (): Promise<boolean> => {
    try {
      const storedRefreshToken = localStorage.getItem("refreshToken");
      if (!storedRefreshToken) {
        return false;
      }

      const response = await axios.post("/api/auth/refresh", {
        refreshToken: storedRefreshToken,
      });

      const { token: newToken, refreshToken: newRefreshToken } = response.data;

      // Store new tokens
      localStorage.setItem("token", newToken);
      if (newRefreshToken) {
        localStorage.setItem("refreshToken", newRefreshToken);
      }

      // Update user state if needed
      const verifyResponse = await axios.get("/api/auth/verify");
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
              const response = await axios.get("/api/auth/verify", {
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
              const response = await axios.get("/api/auth/verify", {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              });
              const { user: userData } = response.data;

              // Update user state with fresh data
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
      const response = await axios.post(
        "/api/auth/login",
        { identifier, password }
      );

      const { user, message } = response.data;

      // Update frontend state with user data from backend
      const userData = {
        username: user.full_name,
        email: user.email,
        userId: user.id_pengguna,
        role: user.role,
        id: user.id,
        full_name: user.full_name,
        id_pengguna: user.id_pengguna,
        tahun_darjah: user.tahun_darjah,
      };
      setUser(userData);

      // Store tokens in localStorage
      localStorage.setItem("token", response.data.token);
      if (response.data.refreshToken) {
        localStorage.setItem("refreshToken", response.data.refreshToken);
      }

      toast.success(message);
      return { success: true, user: userData };
    } catch (error: unknown) {
      console.error("Login error:", error);
      const axiosError = error as AxiosError;
      const message = axiosError.response?.data?.message || "Ralat semasa log masuk";
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
      const response = await axios.post(
        "/api/auth/register",
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
    <AuthContext.Provider value={{ user, isLoading, refreshTrigger, login, logout, register, refreshToken }}>
      {children}
    </AuthContext.Provider>
  );
}
