"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FileCheck2,
  HelpCircle,
  Users,
  Settings,
  Menu,
  X,
  ShieldCheck,
  Eye,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface AdminSidebarProps {
  className?: string;
}

export function AdminSidebar({ className }: AdminSidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navSections = [
    {
      title: "CONTENT MANAGEMENT",
      items: [
        { label: "Overview", href: "/dashboard/overview-control", icon: Eye },
        { label: "Question Bank", href: "/dashboard/question-bank", icon: HelpCircle },
        { label: "Mock Exams", href: "/dashboard/mock-exams", icon: FileCheck2 },
      ],
    },
    {
      title: "ADMINISTRATION",
      items: [
        { label: "User Management", href: "/dashboard/users", icon: Users },
        { label: "Platform Settings", href: "/dashboard/settings", icon: Settings },
      ],
    },
  ];

  return (
    <>
      {/* Mobile menu trigger */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-3 left-4 z-50 p-2 rounded-lg bg-[#0d2035] text-white shadow-md border border-[#152e4a] cursor-pointer"
        aria-label="Toggle Navigation"
      >
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Overlay for mobile */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="lg:hidden fixed inset-0 bg-black/60 z-40 backdrop-blur-xs transition-opacity duration-200"
        />
      )}

      {/* Sidebar container matching frontend #0d2035 design */}
      <aside
        className={cn(
          "fixed top-0 left-0 bottom-0 z-40 w-64 bg-[#0d2035] text-[#97afc7] flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 border-r border-[#152e4a]/80 shadow-2xl select-none",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
          className
        )}
      >
        {/* Brand Logo Header with Admin Badge */}
        <div className="h-16 pl-12 pr-4 lg:px-5 flex items-center gap-2.5 border-b border-[#152e4a]/70">
          <Link href="/dashboard/overview-control" className="flex items-center shrink-0">
            <Image
              width={120}
              height={22}
              src="/images/commonLayout/headerlogo.png"
              alt="MedicalExamPro Admin"
              priority
              className="h-auto w-auto max-h-6.5 object-contain"
            />
          </Link>
          <span className="text-[9px] font-black px-1.5 py-0.5 bg-[#184877] text-cyan-300 border border-cyan-500/50 rounded-md tracking-wider shrink-0">
            ADMIN
          </span>
        </div>

        {/* Navigation Content */}
        <div className="flex-1 py-6 px-3.5 space-y-6 overflow-y-auto custom-scrollbar">
          {navSections.map((section, sIdx) => (
            <div key={sIdx} className="space-y-1.5">
              <h4 className="px-3.5 text-[11px] font-bold text-[#4e6f90] uppercase tracking-[0.14em]">
                {section.title}
              </h4>
              <nav className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    pathname === item.href ||
                    (item.href !== "/dashboard" && pathname.startsWith(item.href));

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "flex items-center gap-3.5 px-3.5 py-2.5 rounded-lg text-[14px] transition-all duration-150",
                        isActive
                          ? "bg-[#184877] text-white font-semibold shadow-xs"
                          : "text-[#97afc7] hover:text-white hover:bg-white/[0.04] font-medium"
                      )}
                    >
                      <Icon
                        className={cn(
                          "w-5 h-5 shrink-0 transition-colors",
                          isActive ? "text-white" : "text-[#97afc7]"
                        )}
                        strokeWidth={1.8}
                      />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>

        {/* Admin Footer matching frontend sidebar footer */}
        <div className="p-4 border-t border-[#152e4a]/70 text-[11px] text-[#4e6f90] flex items-center justify-between">
          <div className="flex items-center gap-1.5 font-bold text-[#97afc7]">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span>Admin Portal</span>
          </div>
          <span className="text-[10px] text-[#4e6f90]">v1.0.0</span>
        </div>
      </aside>
    </>
  );
}
