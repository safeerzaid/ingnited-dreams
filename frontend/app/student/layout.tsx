"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useRequireRole } from "@/lib/use-require-role";
import {
  Compass,
  GraduationCap,
  LayoutDashboard,
  BookOpen,
  Video,
  Clock,
  CheckSquare,
  Bell,
  LogOut,
  Menu,
  X,
  User as UserIcon,
  Library,
  Receipt,
  KeyRound,
} from "lucide-react";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, isLoading } = useAuth();
  const isAllowed = useRequireRole(["STUDENT", "ADMIN"]);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const navigation = [
    { name: "Dashboard", href: "/student/dashboard", icon: LayoutDashboard },
    { name: "My Courses", href: "/student/courses", icon: BookOpen },
    { name: "Class Recordings", href: "/student/recordings", icon: Clock, badge: "7-Day" },
    { name: "Attendance", href: "/student/attendance", icon: CheckSquare },
    { name: "Study Library", href: "/library", icon: Library },
    { name: "Payments & Receipts", href: "/student/payments", icon: Receipt },
    { name: "My Account", href: "/student/account", icon: KeyRound },
  ];

  if (isLoading || !isAllowed) {
    return (
      <div className="min-h-screen bg-aviation-offWhite flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Compass className="w-8 h-8 text-aviation-yellow animate-spin" />
          <p className="text-xs font-bold text-aviation-charcoal uppercase tracking-widest">
            Loading Student Portal...
          </p>
        </div>
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
              Skill LMS
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-aviation-yellow text-aviation-black font-bold shadow-sm"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </div>
                {item.badge && !isActive && (
                  <Badge variant="yellow" size="sm">
                    {item.badge}
                  </Badge>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Card & Logout */}
        <div className="p-4 border-t border-aviation-charcoal bg-aviation-softBlack/40">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-aviation-yellow text-aviation-black font-bold text-xs flex items-center justify-center shrink-0">
              {user?.name ? user.name[0].toUpperCase() : "S"}
            </div>
            <div className="overflow-hidden">
              <div className="text-xs font-bold text-white truncate">{user?.name || "Enrolled Student"}</div>
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

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-aviation-border px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
              className="md:hidden p-2 rounded-lg text-aviation-charcoal hover:bg-aviation-lightGray"
            >
              {isMobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <span className="text-xs font-mono font-bold text-aviation-muted hidden sm:inline-block">
              {user?.studentProfile?.registrationNumber ? `REG: ${user.studentProfile.registrationNumber}` : "STUDENT PORTAL"}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/student/recordings">
              <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-aviation-charcoal px-2.5 py-1 rounded-full bg-aviation-yellow/15 border border-aviation-yellow/30">
                <Clock className="w-3.5 h-3.5 text-aviation-yellowDeep" />
                7-Day Recording Retention Active
              </span>
            </Link>

            <div className="flex items-center gap-2 border-l border-aviation-border pl-4">
              <span className="text-xs font-bold text-aviation-black">{user?.name}</span>
            </div>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {isMobileNavOpen && (
          <div className="md:hidden bg-aviation-black text-white p-4 space-y-2 border-b border-aviation-charcoal">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsMobileNavOpen(false)}
                className={`flex items-center justify-between p-2.5 rounded-lg text-sm ${
                  pathname === item.href ? "bg-aviation-yellow text-aviation-black font-bold" : "text-gray-300"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <item.icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </div>
              </Link>
            ))}
            <button
              onClick={() => logout()}
              className="w-full text-left p-2.5 rounded-lg text-sm text-red-400 hover:bg-white/5 flex items-center gap-2.5"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        )}

        {/* Main Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-container mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
