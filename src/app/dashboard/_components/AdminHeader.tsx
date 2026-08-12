"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, LogOut, Settings, ShieldAlert } from "lucide-react";

export function AdminHeader() {
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [adminEmail, setAdminEmail] = useState("admin@medicalexampro.com");
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("admin_user");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed.email) setAdminEmail(parsed.email);
        } catch (_) {}
      }
    }
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    setDropdownOpen(false);
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("admin_user");
    }
    router.push("/auth/sign-in");
  };

  return (
    <header className="h-16 w-full bg-[#0d2035] border-b border-[#152e4a]/80 pl-14 sm:pl-16 lg:px-8 pr-4 sm:pr-8 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      {/* Title */}
      <div className="flex items-center gap-2">
        <h1 className="text-sm sm:text-base lg:text-lg font-bold text-white tracking-tight truncate">
          Admin Management Control
        </h1>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3 sm:gap-4 shrink-0">
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2.5 p-0.5 rounded-full hover:ring-2 hover:ring-cyan-500/40 transition-all focus:outline-none cursor-pointer"
            aria-label="Admin profile menu"
          >
            <div className="w-8 h-8 rounded-full bg-[#184877] border border-cyan-500/40 flex items-center justify-center text-white font-bold text-xs shadow-xs">
              <User className="w-4 h-4 text-cyan-300" />
            </div>
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-[#0d2035] border border-[#183657] rounded-xl shadow-2xl z-50 p-2 text-slate-200 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-2.5 border-b border-[#183657] space-y-0.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-sm">System Admin</span>
                  <span className="text-[9px] font-extrabold px-1.5 py-0.5 bg-rose-900/80 text-rose-300 border border-rose-700/80 rounded-md">
                    ADMIN
                  </span>
                </div>
                <p className="text-[11px] text-[#97afc7] truncate">{adminEmail}</p>
              </div>

              <div className="py-1 space-y-0.5">
                <Link
                  href="/dashboard/settings"
                  onClick={() => setDropdownOpen(false)}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:bg-white/[0.06] hover:text-white flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <Settings className="w-4 h-4 text-[#97afc7]" />
                  <span>Platform Settings</span>
                </Link>
              </div>

              <div className="pt-1 border-t border-[#183657]">
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs font-bold text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4 text-rose-400" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
