/** @format */

"use client";

import { Sidebar } from "@/components/admin/sidebar";
import { Header } from "@/components/admin/header";
import { Banner } from "@/components/admin/banner";
import { Outlet } from "react-router-dom";

export function AdminLayout() {
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
