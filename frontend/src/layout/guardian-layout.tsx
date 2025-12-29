/** @format */

"use client";

import { Sidebar } from "@/components/guardian/sidebar";
import { Header } from "@/components/guardian/header";
import { Outlet } from "react-router-dom";

export function Layout() {
  return (
    <div className="flex h-screen bg-background bg-gradient-to-r from-emerald-50 to-amber-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6 pt-0 overflow-auto ">
          <Outlet />{" "}
          {/* Nested pages (Dashboard, Announcements, etc.) render here */}
        </main>
      </div>
    </div>
  );
}
