/** @format */

"use client";

import { NavLink } from "react-router-dom";
import { useState } from "react";
import type { LucideIcon } from "lucide-react"; //type only
import {
  Home,
  Megaphone,
  BookOpen,
  FileQuestion,
  HelpCircle,
  Activity,
  User,
  FileText,
  Menu,
  X,
} from "lucide-react";

// Define link type for better type safety
type SidebarLink = {
  name: string;
  path: string;
  icon: LucideIcon; // icon is a component, not JSX
};

export function Sidebar() {
  const [open, setOpen] = useState(false); // state for mobile sidebar

  const links: SidebarLink[] = [
    { name: "Laman Utama", path: "/admin/dashboard", icon: Home },
    { name: "Pengumuman", path: "/admin/announcements", icon: Megaphone },
    { name: "Modul Pembelajaran", path: "/admin/kafamodule", icon: BookOpen },
    { name: "Kertas Soalan", path: "/admin/upkk", icon: FileQuestion },
    { name: "Kuiz", path: "/admin/manageQuiz", icon: HelpCircle },
    { name: "Aktiviti", path: "/admin/aktivities", icon: Activity },
    { name: "Pengguna", path: "/admin/user", icon: User },
    { name: "Laporan", path: "/admin/reports", icon: FileText },
  ];

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setOpen(true)}
        className=" fixed top-4 left-4 z-50 p-2 bg-amber-200 text-gray-700 rounded-lg"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Mobile Overlay */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black/50 z-40"
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-sidebar text-sidebar-foreground p-6 transform transition-transform z-50
        ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* Mobile Close Button */}
        <button
          onClick={() => setOpen(false)}
          className="absolute top-4 right-4 bg-amber-200 text-gray-700"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Desktop Logo */}
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-sidebar-primary rounded-lg flex items-center justify-center">
            <span className="text-sidebar-primary-foreground font-bold text-sm">
              MK
            </span>
          </div>
          <span className="font-bold text-lg">MyKAFA</span>
        </div>

        {/* Navigation */}
        <nav className="space-y-2">
          {links.map(({ name, path, icon: Icon }) => (
            <NavLink
              key={name}
              to={path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                }`
              }
            >
              <Icon className="w-5 h-5" />
              <span>{name}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </>
  );
}
