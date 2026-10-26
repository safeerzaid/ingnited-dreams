"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  Phone,
  Mail,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  User as UserIcon,
  LogIn,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import ArrowPillButton from "@/components/ui/ArrowPillButton";
import FloatingBottomNav from "./FloatingBottomNav";

interface NavbarProps {
  transparent?: boolean;
}

export const Navbar: React.FC<NavbarProps> = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { user } = useAuth();

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Courses", href: "/courses" },
    { name: "3 Pillars", href: "/#pillars" },
    { name: "Kindle Hub", href: "/library" },
    { name: "About Us", href: "/about" },
    { name: "Pricing", href: "/contact" },
  ];

  const getDashboardLink = () => {
    if (!user) return "/login";
    if (user.role === "ADMIN") return "/admin";
    if (user.role === "INSTRUCTOR") return "/instructor/dashboard";
    return "/student/dashboard";
  };

  return (
    <>
      {/* Top Bar (Dark Forest Green with Right Slanted Yellow Tab) - Scrolls off naturally with page */}
      <div className="w-full bg-[#0e271d] text-white border-b border-white/10 select-none">
        <div className="max-w-[1600px] mx-auto flex items-stretch justify-between min-h-[42px] sm:min-h-[44px] pl-5 sm:pl-8 lg:pl-12 pr-0">
          {/* Left Contact Details */}
          <div className="flex items-center flex-wrap gap-5 sm:gap-7 text-[11px] sm:text-[12px] font-medium py-1.5 text-slate-300">
            <a
              href="tel:+917012002405"
              className="inline-flex items-center gap-2 hover:text-[#F5C400] transition-all hover:translate-x-0.5"
            >
              <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[#F5C400]">
                <Phone className="w-3 h-3" />
              </span>
              <span className="font-semibold tracking-tight">+91 7012002405</span>
            </a>

            <a
              href="mailto:justin@igniteddreams.com"
              className="hidden sm:inline-flex items-center gap-2 hover:text-[#F5C400] transition-all hover:translate-x-0.5"
            >
              <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[#F5C400]">
                <Mail className="w-3 h-3" />
              </span>
              <span className="font-semibold tracking-tight">justin@igniteddreams.com</span>
            </a>

            <Link
              href="/login"
              className="hidden md:inline-flex items-center gap-2 hover:text-[#F5C400] transition-all hover:translate-x-0.5 text-slate-300 font-semibold"
            >
              <span className="w-5 h-5 rounded-full bg-[#F5C400]/20 flex items-center justify-center text-[#F5C400]">
                <LogIn className="w-3 h-3" />
              </span>
              <span className="text-[#F5C400]">Student Portal</span>
            </Link>
          </div>

          {/* Right Slanted Yellow Tab with Social Icons */}
          <div className="relative self-stretch flex items-center px-4 sm:px-7 ml-auto my-0.5 sm:my-1">
            <div
              className="absolute inset-0 bg-[#F5C400] -skew-x-[20deg] rounded-md sm:rounded-lg shadow-sm"
              style={{ borderRadius: "6px" }}
            />
            <div className="relative z-10 flex items-center gap-2 sm:gap-2.5">
              <a
                href="#"
                aria-label="Facebook"
                className="hidden sm:flex w-7 h-7 rounded-full bg-[#0e271d]/10 hover:bg-[#0e271d] text-[#0e271d] hover:text-[#F5C400] items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-xs"
              >
                <Facebook className="w-3.5 h-3.5" />
              </a>
              <a
                href="#"
                aria-label="Twitter"
                className="hidden sm:flex w-7 h-7 rounded-full bg-[#0e271d]/10 hover:bg-[#0e271d] text-[#0e271d] hover:text-[#F5C400] items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-xs"
              >
                <Twitter className="w-3.5 h-3.5" />
              </a>
              <a
                href="#"
                aria-label="Instagram"
                className="w-7 h-7 rounded-full bg-[#0e271d]/10 hover:bg-[#0e271d] text-[#0e271d] hover:text-[#F5C400] flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-xs"
              >
                <Instagram className="w-3.5 h-3.5" />
              </a>
              <a
                href="#"
                aria-label="LinkedIn"
                className="w-7 h-7 rounded-full bg-[#0e271d]/10 hover:bg-[#0e271d] text-[#0e271d] hover:text-[#F5C400] flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-xs"
              >
                <Linkedin className="w-3.5 h-3.5" />
              </a>
              <a
                href="#"
                aria-label="YouTube"
                className="w-7 h-7 rounded-full bg-[#0e271d]/10 hover:bg-[#0e271d] text-[#0e271d] hover:text-[#F5C400] flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-xs"
              >
                <Youtube className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar - Normal unpinned document flow */}
      <header className="w-full bg-white/95 border-b border-slate-100 select-none shadow-[0_1px_4px_rgba(0,0,0,0.03)]">
        <div className="max-w-[1600px] mx-auto px-5 sm:px-8 lg:px-12 py-3.5 sm:py-4 flex items-center justify-between">
          {/* Brand Logo & Name */}
          <Link href="/" className="flex items-center gap-2 sm:gap-3.5 group shrink-0">
            <div className="flex items-center gap-1 shrink-0 transition-transform group-hover:scale-105 duration-200">
              <span className="w-2 h-7 sm:w-2.5 sm:h-8 rounded-full bg-[#F5C400] transition-all group-hover:h-9 shadow-[0_0_14px_rgba(245,196,0,0.5)]" />
              <span className="w-2 h-5 sm:w-2.5 sm:h-6 rounded-full bg-[#0e271d] transition-all group-hover:h-7" />
            </div>
            <div className="relative w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-full overflow-hidden border-2 sm:border-[2.5px] border-[#F5C400] shadow-[0_0_16px_rgba(245,196,0,0.45)] shrink-0 transition-transform group-hover:rotate-6 duration-300 bg-white">
              <img
                src="/logo.png"
                alt="Ignited Dreams"
                className="w-full h-full object-cover scale-[1.05]"
              />
            </div>
            <span className="font-extrabold text-xl sm:text-2xl lg:text-[26px] tracking-[-0.03em] text-[#0e271d] font-heading leading-none">
              Ignited Dreams
            </span>
          </Link>

          {/* Centered Desktop Nav Menu */}
          <nav className="hidden lg:flex items-center gap-8 text-[13.5px] font-semibold text-slate-600">
            {navLinks.map((link) => {
              const isActive =
                pathname === link.href ||
                (link.href !== "/" && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`py-1.5 transition-colors relative group/link ${
                    isActive ? "text-[#0e271d] font-bold" : "text-slate-600 hover:text-[#0e271d]"
                  }`}
                >
                  <span>{link.name}</span>
                  <span
                    className={`absolute bottom-0 left-0 h-[2.5px] bg-[#F5C400] rounded-full transition-all duration-300 ${
                      isActive ? "w-full" : "w-0 group-hover/link:w-full"
                    }`}
                  />
                </Link>
              );
            })}
          </nav>

          {/* Right Action */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {user ? (
              <Link
                href={getDashboardLink()}
                id="student-dashboard-btn"
                className="inline-flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2.5 rounded-full bg-[#0e271d] text-[#F5C400] text-[11px] sm:text-[13px] font-bold hover:bg-slate-900 transition-all shadow-md active:scale-95 border border-[#0e271d]"
              >
                <UserIcon className="w-3.5 h-3.5 text-[#F5C400]" />
                <span className="hidden min-[380px]:inline">
                  {user.role === "ADMIN"
                    ? "Admin Portal"
                    : user.role === "INSTRUCTOR"
                    ? "Instructor Hub"
                    : "Student Portal"}
                </span>
                <span className="min-[380px]:hidden">Portal</span>
              </Link>
            ) : (
              <Link
                href="/login"
                id="student-login-btn"
                className="inline-flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2.5 rounded-full bg-[#0e271d] text-[#F5C400] hover:bg-slate-900 text-[11px] sm:text-[13px] font-bold shadow-md transition-all active:scale-95 border border-[#0e271d]"
              >
                <LogIn className="w-3.5 h-3.5 text-[#F5C400]" />
                <span className="hidden min-[380px]:inline">Student Login</span>
                <span className="min-[380px]:hidden">Login</span>
              </Link>
            )}

            <div className="hidden sm:block">
              <ArrowPillButton
                href="/checkout?course=transportation-logistics-sap"
                variant="yellow"
                className="text-xs sm:text-[13px] !py-2.5 !px-5"
              >
                Get Enrolled
              </ArrowPillButton>
            </div>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg transition-colors text-[#0e271d] hover:bg-slate-100"
              aria-label="Toggle Navigation Menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden px-5 sm:px-6 py-6 space-y-4 animate-in slide-in-from-top duration-200 border-t bg-white border-slate-100 text-[#0e271d] max-h-[82vh] overflow-y-auto overscroll-contain">
            <nav className="flex flex-col space-y-3">
              {navLinks.map((link) => {
                const isActive =
                  pathname === link.href ||
                  (link.href !== "/" && pathname.startsWith(link.href));
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`text-base font-medium py-2 transition-colors flex items-center justify-between ${
                      isActive ? "text-[#0e271d] font-bold" : "text-slate-600 hover:text-[#0e271d]"
                    }`}
                  >
                    <span>{link.name}</span>
                    {isActive && <span className="w-2 h-2 rounded-full bg-[#F5C400]" />}
                  </Link>
                );
              })}
            </nav>

            <div className="pt-4 border-t border-slate-100 flex flex-col gap-3">
              {user ? (
                <Link
                  href={getDashboardLink()}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-full bg-[#0e271d] text-[#F5C400] text-sm font-bold shadow-sm"
                >
                  <UserIcon className="w-4 h-4" />
                  <span>Go to Dashboard</span>
                </Link>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-full border-2 border-slate-300 text-[#0e271d] text-sm font-bold hover:bg-slate-50 transition-all"
                >
                  <LogIn className="w-4 h-4 text-amber-600" />
                  <span>Student Login</span>
                </Link>
              )}

              <ArrowPillButton
                href="/checkout?course=transportation-logistics-sap"
                variant="yellow"
                className="w-full text-center justify-center !py-3"
              >
                Get Enrolled
              </ArrowPillButton>
            </div>
          </div>
        )}
      </header>

      {/* Slaro-Style Floating Bottom Navigation Bar */}
      <FloatingBottomNav />
    </>
  );
};

export default Navbar;
