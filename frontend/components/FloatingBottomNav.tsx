"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Home, BookOpen, Video, Radio, User, LogIn } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export const FloatingBottomNav = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Hide on classroom / full-screen test or checkout routes if needed
  if (!mounted) return null;
  if (pathname?.startsWith("/classroom/") || pathname === "/checkout") {
    return null;
  }

  const getDashboardLink = () => {
    if (!user) return "/login";
    if (user.role === "ADMIN") return "/admin";
    if (user.role === "INSTRUCTOR") return "/instructor/dashboard";
    return "/student/dashboard";
  };

  // For logged-in students, show their direct portal classroom & recordings.
  // For public visitors: hide live classes & recordings completely from public view.
  const navItems = user
    ? [
        {
          id: "home",
          label: "Home",
          icon: Home,
          href: "/",
          isActive: pathname === "/",
        },
        {
          id: "my-courses",
          label: "Courses",
          icon: BookOpen,
          href: "/student/courses",
          isActive: pathname?.startsWith("/student/courses"),
        },
        {
          id: "portal",
          label: "Dashboard",
          icon: User,
          href: "/student/dashboard",
          isActive: pathname === "/student/dashboard",
        },
        {
          id: "recordings",
          label: "Recordings",
          icon: Video,
          href: "/student/recordings",
          badge: "7D",
          badgeBg: "#F5C400",
          badgeColor: "#0e271d",
          isActive: pathname?.startsWith("/student/recordings"),
        },
        {
          id: "live",
          label: "Live Class",
          icon: Radio,
          // The dashboard shows the "LIVE NOW" join banner when a batch class is running
          href: "/student/dashboard#live",
          isActive: pathname?.startsWith("/classroom"),
        },
      ]
    : [
        {
          id: "home",
          label: "Home",
          icon: Home,
          href: "/",
          isActive: pathname === "/",
        },
        {
          id: "courses",
          label: "Courses",
          icon: BookOpen,
          href: "/courses",
          isActive: pathname?.startsWith("/courses"),
        },
        {
          id: "hub",
          label: "Kindle Hub",
          icon: BookOpen,
          href: "/library",
          isActive: pathname?.startsWith("/library"),
        },
        {
          id: "enroll",
          label: "Enroll",
          icon: BookOpen,
          href: "/checkout",
          badge: "ADMIT",
          badgeBg: "#F5C400",
          badgeColor: "#0e271d",
          isActive: pathname === "/checkout",
        },
        {
          id: "portal",
          label: "Portal",
          icon: LogIn,
          href: "/login",
          isActive: pathname === "/login",
        },
      ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 80, opacity: 0, scale: 0.92 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 80, opacity: 0, scale: 0.92 }}
        transition={{ type: "spring", stiffness: 420, damping: 28 }}
        className="fixed bottom-3.5 sm:bottom-5 left-0 right-0 mx-auto z-[99999] w-[calc(100%-24px)] max-w-[460px] box-border pointer-events-auto select-none"
      >
        <div
          className="flex items-center justify-between p-1.5 sm:p-2 rounded-full relative overflow-hidden"
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.96)",
            backdropFilter: "blur(24px) saturate(190%)",
            WebkitBackdropFilter: "blur(24px) saturate(190%)",
            border: "1.5px solid rgba(226, 232, 240, 0.95)",
            boxShadow:
              "0 18px 45px rgba(0, 0, 0, 0.14), 0 2px 10px rgba(0, 0, 0, 0.05), inset 0 1px 1.5px rgba(255, 255, 255, 0.9)",
          }}
        >
          {navItems.map((item) => {
            const IconComp = item.icon;
            const active = !!item.isActive;

            return (
              <motion.button
                key={item.id}
                whileTap={{ scale: 0.88 }}
                onClick={() => router.push(item.href)}
                className="relative flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-full cursor-pointer transition-colors duration-200 gap-1 outline-none z-10"
                style={{
                  color: active ? "#0e271d" : "rgba(14, 39, 29, 0.75)",
                }}
                aria-label={item.label}
              >
                {/* Slaro-style Animated Sliding Golden Pill */}
                {active && (
                  <motion.div
                    layoutId="activeBottomNavPill"
                    transition={{ type: "spring", stiffness: 500, damping: 34 }}
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: "linear-gradient(135deg, #F5C400 0%, #FFD21F 100%)",
                      boxShadow: "0 4px 16px rgba(245, 196, 0, 0.45)",
                      zIndex: -1,
                    }}
                  />
                )}

                {/* Icon with badge */}
                <div className="relative flex items-center justify-center">
                  <IconComp
                    size={20}
                    strokeWidth={active ? 2.6 : 2.2}
                    style={{
                      color: active ? "#0e271d" : "rgba(14, 39, 29, 0.85)",
                    }}
                  />

                  {/* Badge */}
                  {item.badge && (
                    <span
                      className="absolute -top-1.5 -right-3 text-[9px] font-black rounded-full px-1.5 py-0.2 leading-tight shadow-sm"
                      style={{
                        backgroundColor: item.badgeBg,
                        color: item.badgeColor,
                        border: "1.5px solid #ffffff",
                        boxShadow: "0 2px 6px rgba(0,0,0,0.18)",
                      }}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>

                {/* High Contrast Visible Label */}
                <span
                  style={{
                    fontSize: "0.72rem",
                    fontWeight: active ? 800 : 700,
                    color: active ? "#0e271d" : "rgba(14, 39, 29, 0.85)",
                    lineHeight: 1,
                    letterSpacing: "-0.2px",
                  }}
                >
                  {item.label}
                </span>
              </motion.button>
            );
          })}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default FloatingBottomNav;
