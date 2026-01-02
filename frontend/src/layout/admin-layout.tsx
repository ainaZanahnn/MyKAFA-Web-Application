/** @format */

"use client";

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "@/components/admin/sidebar";
import { Header } from "@/components/admin/header";
import { Banner } from "@/components/admin/banner";
import { Outlet } from "react-router-dom";
import { useAuth } from "@/components/auth/useAuth";

export function AdminLayout() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        navigate("/auth");
      } else if (user.role !== "admin") {
        // Redirect to appropriate dashboard based on role
        if (user.role === "student") {
          navigate("/student/dashboard");
        } else if (user.role === "guardian") {
          navigate("/guardian/dashboard");
        } else {
          navigate("/auth");
        }
      }
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return null;
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <Banner />
        <main className="flex-1 p-6 pt-0 overflow-auto">
          <Outlet />{" "}
          {/* Nested pages (Dashboard, Announcements, etc.) render here */}
        </main>
      </div>
    </div>
  );
}
