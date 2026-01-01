/** @format */

"use client";

import { User, LogOut } from "lucide-react";
import { useAuth } from "@/components/auth/useAuth";
import { useNavigate } from "react-router-dom";

export function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="bg-gradient-to-r from-emerald-50 to-amber-50 p-4">
      <div className="flex items-center justify-end gap-4">
        <span className="text-sm font-medium">{user?.id_pengguna || "pelajar"}</span>
        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
          <User className="w-4 h-4 text-primary-foreground" />
        </div>
        <LogOut
          className="w-5 h-5 text-muted-foreground hover:text-foreground cursor-pointer"
          onClick={handleLogout}
        />
      </div>
    </header>
  );
}
