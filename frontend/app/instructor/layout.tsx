"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useRequireRole } from "@/lib/use-require-role";
import { GraduationCap, LayoutDashboard, Calendar, Video, Clock, LogOut, Menu, X, Users, KeyRound } from "lucide-react";
import Badge from "@/components/ui/Badge";

export default function InstructorLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, isLoading } = useAuth();
  const isAllowed = useRequireRole(["INSTRUCTOR", "ADMIN"]);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const navigation = [
    { name: "Faculty Dashboard", href: "/instructor/dashboard", icon: LayoutDashboard },
    { name: "Assigned Classes", href: "/instructor/classes", icon: Calendar },
    { name: "My Account", href: "/instructor/account", icon: KeyRound },
  ];

  if (isLoading || !isAllowed) {
    return (
      <div className="min-h-screen bg-aviation-offWhite flex items-center justify-center">
        <GraduationCap className="w-8 h-8 text-aviation-yellow animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-aviation-offWhite">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col bg-aviation-black text-white border-r border-aviation-charcoal shrink-0">
        <div className="h-20 flex items-center gap-3 px-6 border-b border-aviation-charcoal">
          <img
            src="/logo.png"
            alt="Logo"
            className="w-9 h-9 rounded-full object-cover border border-aviation-yellow/50 shadow-sm shrink-0"
          />
          <div>
            <div className="font-extrabold text-base tracking-tight text-white font-heading">
              IGNITED<span className="text-aviation-yellow">DREAMS</span>
            </div>
            <div className="text-[9px] uppercase tracking-widest text-aviation-yellow font-bold">
              Faculty Studio
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-aviation-yellow text-aviation-black font-bold shadow-sm"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-aviation-charcoal bg-aviation-softBlack/40">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-aviation-yellow text-aviation-black font-bold text-xs flex items-center justify-center shrink-0">
              FAC
            </div>
            <div className="overflow-hidden">
              <div className="text-xs font-bold text-white truncate">{user?.name || "Faculty Mentor"}</div>
              <div className="text-[10px] text-gray-400 font-mono truncate">{user?.email}</div>
            </div>
          </div>
          <button
            onClick={() => logout()}
            className="w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-red-500/20 hover:text-red-400 text-xs font-semibold text-gray-400 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-aviation-border px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
              className="md:hidden p-2 rounded-lg text-aviation-charcoal hover:bg-aviation-lightGray"
            >
              {isMobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <span className="text-xs font-mono font-bold text-aviation-muted">
              FACULTY INSTRUCTION DESK
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Badge variant="yellow" size="sm">
              LiveKit Cloud Ready
            </Badge>
            <span className="text-xs font-bold text-aviation-black">{user?.name}</span>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-container mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
