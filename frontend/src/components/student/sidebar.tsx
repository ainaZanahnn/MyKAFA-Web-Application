/** @format */

"use client";

import { NavLink } from "react-router-dom";
import { useState } from "react";
import type { LucideIcon } from "lucide-react"; //type only
import {
  Home,
  BookOpen,
  Megaphone,
  FileQuestion,
  Activity,
  FileText,
  BarChart,
  Menu,
  X,
  Star,
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
    { name: "Laman Utama", path: "/student/dashboard", icon: Home },
    { name: "Pengumuman", path: "/student/announcement", icon: Megaphone },
    {
      name: "Modul KAFA",
      path: "/student/Kafalearning",
      icon: BookOpen,
    },
    {
      name: "Kertas Soalan UPKK",
      path: "/student/upkkPastYear",
      icon: FileQuestion,
    },
    {
      name: "Aktiviti Interaktif",
      path: "/student/interactiveactivities",
      icon: Activity,
    },
    { name: "Prestasi", path: "/student/reports", icon: BarChart },
    { name: "Profil", path: "/student/profile", icon: FileText },
  ];

  return (
    <>
      {/* Toggle Button for all devices */}
      <button
        onClick={() => setOpen(true)}
        className="fixed top-4 left-4 z-50 p-2 bg-amber-200 text-gray-700 rounded-lg"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Overlay */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black/50 z-40"
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-gradient-to-r bg-emerald-100 shadow-lg border-r border-emerald-100 text-sidebar-foreground p-6 transform transition-transform z-50
        ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* Close Button */}
        <button
          onClick={() => setOpen(false)}
          className="absolute top-4 right-4 bg-amber-200 text-gray-700 p-2 rounded-lg"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Desktop Logo */}
        <div className="flex items-center gap-2 mb-8">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-lg flex items-center justify-center">
              <Star className="w-6 h-6 text-white" />
            </div>
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
                    ? "bg-amber-300 text-sidebar-accent-foreground border-2 border-amber-500"
                    : " hover:bg-amber-200 hover:text-sidebar-accent-foreground"
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
