"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useRequireRole } from "@/lib/use-require-role";
import {
  GraduationCap,
  LayoutDashboard,
  Users,
  BookOpen,
  Layers,
  Calendar,
  Video,
  Clock,
  Settings,
  ShieldAlert,
  LogOut,
  Menu,
  X,
  FileText,
  Activity,
  CreditCard,
  Mail,
  Library,
  KeyRound,
} from "lucide-react";
import Badge from "@/components/ui/Badge";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, isLoading } = useAuth();
  const isAllowed = useRequireRole(["ADMIN"]);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  interface NavItem {
    name: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
  }

  interface NavSection {
    title: string;
    items: NavItem[];
  }

  const sections: NavSection[] = [
    {
      title: "OVERVIEW",
      items: [
        { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
      ],
    },
    {
      title: "PEOPLE",
      items: [
        { name: "Enrolled Students", href: "/admin/students", icon: GraduationCap },
        { name: "Faculty / Mentors", href: "/admin/instructors", icon: Users },
      ],
    },
    {
      title: "ACADEMICS",
      items: [
        { name: "Courses & Modules", href: "/admin/courses", icon: BookOpen },
        { name: "Batches", href: "/admin/batches", icon: Layers },
        { name: "Classes & Labs", href: "/admin/classes", icon: Calendar },
        { name: "Study Library", href: "/admin/library", icon: Library },
      ],
    },
    {
      title: "ADMISSIONS",
      items: [
        { name: "Payments", href: "/admin/payments", icon: CreditCard },
        { name: "Enquiries", href: "/admin/inquiries", icon: Mail },
      ],
    },
    {
      title: "MEDIA & LIFECYCLE",
      items: [
        {
          name: "Recordings Manager",
          href: "/admin/recordings",
          icon: Clock,
          badge: "7-Day",
        },
      ],
    },
    {
      title: "SYSTEM",
      items: [
        { name: "Platform Settings", href: "/admin/settings", icon: Settings },
        { name: "Audit Trail", href: "/admin/audit-logs", icon: Activity },
        { name: "My Account", href: "/admin/account", icon: KeyRound },
      ],
    },
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
      {/* Desktop Admin Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col bg-aviation-black text-white border-r border-aviation-charcoal shrink-0">
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
              Skill Academy Admin
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-6 overflow-y-auto">
          {sections.map((sec) => (
            <div key={sec.title} className="space-y-1">
              <div className="px-3 text-[10px] font-extrabold uppercase tracking-widest text-gray-500">
                {sec.title}
              </div>
              {sec.items.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center justify-between px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                      isActive
                        ? "bg-aviation-yellow text-aviation-black font-bold shadow-sm"
                        : "text-gray-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
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
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-aviation-charcoal bg-aviation-softBlack/40">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-aviation-yellow text-aviation-black font-bold text-xs flex items-center justify-center shrink-0">
              ADM
            </div>
            <div className="overflow-hidden">
              <div className="text-xs font-bold text-white truncate">{user?.name || "Administrator"}</div>
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

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-aviation-border px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
              className="lg:hidden p-2 rounded-lg text-aviation-charcoal hover:bg-aviation-lightGray"
            >
              {isMobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <span className="text-xs font-mono font-bold text-aviation-muted">
              ACADEMY ADMINISTRATION SAAS
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Badge variant="yellow" size="sm">
              R2 Storage Active
            </Badge>
            <span className="text-xs font-bold text-aviation-black">{user?.name}</span>
          </div>
        </header>

        {isMobileNavOpen && (
          <div className="lg:hidden bg-aviation-black text-white p-4 space-y-4 border-b border-aviation-charcoal max-h-[80vh] overflow-y-auto">
            {sections.map((sec) => (
              <div key={sec.title} className="space-y-1">
                <div className="text-[10px] uppercase font-bold text-gray-400 px-2">{sec.title}</div>
                {sec.items.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMobileNavOpen(false)}
                    className={`block p-2 rounded-lg text-xs ${
                      pathname === item.href ? "bg-aviation-yellow text-aviation-black font-bold" : "text-gray-300"
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            ))}
            <button
              onClick={() => logout()}
              className="w-full text-left p-2 rounded-lg text-xs text-red-400 hover:bg-white/5"
            >
              Sign Out
            </button>
          </div>
        )}

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-container mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
