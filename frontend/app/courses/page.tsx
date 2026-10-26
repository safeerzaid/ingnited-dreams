"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CustomSelect from "@/components/ui/Select";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import api from "@/lib/api";
import { formatInr, initials } from "@/lib/format";
import type { PublicCourse } from "@/lib/types";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}
import {
  Search,
  Clock,
  Users,
  ArrowUpRight,
  GraduationCap,
  AlertCircle,
} from "lucide-react";

const ALL_CATEGORIES = "All";
const ALL_LEVELS = "All Levels";

export default function CoursesPage() {
  const [courses, setCourses] = useState<PublicCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(ALL_CATEGORIES);
  const [selectedLevel, setSelectedLevel] = useState(ALL_LEVELS);
  const [sortBy, setSortBy] = useState("curated");

  useEffect(() => {
    api
      .get<PublicCourse[]>("/public/courses")
      .then(setCourses)
      .catch((err) => setLoadError(err.message || "Could not load courses"))
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(
    () => [ALL_CATEGORIES, ...Array.from(new Set(courses.map((c) => c.category).filter(Boolean) as string[]))],
    [courses]
  );
  const levels = useMemo(
    () => [ALL_LEVELS, ...Array.from(new Set(courses.map((c) => c.level).filter(Boolean) as string[]))],
    [courses]
  );

  const filteredCourses = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return courses
      .filter((course) => {
        const matchesSearch =
          course.title.toLowerCase().includes(q) ||
          course.description.toLowerCase().includes(q) ||
          (course.facultyName || "").toLowerCase().includes(q) ||
          (course.category || "").toLowerCase().includes(q);

        const matchesCategory = selectedCategory === ALL_CATEGORIES || course.category === selectedCategory;
        const matchesLevel = selectedLevel === ALL_LEVELS || course.level === selectedLevel;

        return matchesSearch && matchesCategory && matchesLevel;
      })
      .sort((a, b) => {
        if (sortBy === "price-low") return a.price - b.price;
        if (sortBy === "price-high") return b.price - a.price;
        if (sortBy === "duration") return b.durationHours - a.durationHours;
        return 0;
      });
  }, [courses, searchQuery, selectedCategory, selectedLevel, sortBy]);

  const containerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const filterRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      if (headerRef.current) {
        gsap.fromTo(
          headerRef.current.children,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.8, stagger: 0.14, ease: "power2.out" }
        );
      }
      if (filterRef.current) {
        gsap.fromTo(
          filterRef.current,
          { opacity: 0, y: 22 },
          { opacity: 1, y: 0, duration: 0.7, ease: "power2.out", delay: 0.15 }
        );
      }
      if (gridRef.current && gridRef.current.children.length) {
        gsap.fromTo(
          gridRef.current.children,
          { opacity: 0, y: 35, scale: 0.98 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.75,
            stagger: 0.08,
            ease: "power2.out",
            scrollTrigger: {
              trigger: gridRef.current,
              start: "top 85%",
            },
          }
        );
      }
    }, containerRef);

    return () => ctx.revert();
  }, [filteredCourses]);

  return (
    <div ref={containerRef} className="min-h-screen flex flex-col bg-[#FAFAF8]">
      <Navbar />

      <main className="flex-1 max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-14 py-12 lg:py-16 w-full">
        {/* Page Header */}
        <div ref={headerRef} className="max-w-3xl mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-aviation-yellow/15 border border-aviation-yellow/40 text-xs font-bold uppercase tracking-wider text-[#9E7300] mb-3">
            <GraduationCap className="w-4 h-4 text-aviation-yellow" />
            <span>Integrated Skill Education & Skill Training</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold text-[#0A0A0A] font-heading tracking-tight leading-[1.24] sm:leading-[1.2] mb-4">
            Integrated Training Programs
          </h1>
          <p className="text-base sm:text-lg text-[#687080] leading-relaxed">
            Career-focused programs in Transportation &amp; Logistics, SAP ERP, Aviation Ground Operations and Business Management — live daily classes with 7-day recording access.
          </p>
        </div>

        {/* Filter Controls Bar */}
        <div ref={filterRef} className="space-y-5 mb-10">
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by course topic, faculty, or skill..."
                className="w-full pl-11 pr-4 py-3 bg-white border border-[#E7E7E7] rounded-xl text-sm text-[#0A0A0A] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FFC400] focus:border-transparent transition-all shadow-sm"
              />
            </div>

            <div className="relative min-w-[160px]">
              <CustomSelect
                options={levels.map((level) => ({ value: level, label: level }))}
                value={selectedLevel}
                onChange={setSelectedLevel}
                buttonClassName="py-3 px-4 rounded-xl border-[#E7E7E7]"
              />
            </div>

            <div className="relative min-w-[170px]">
              <CustomSelect
                options={[
                  { value: "curated", label: "Curated Order" },
                  { value: "price-low", label: "Fee: Low to High" },
                  { value: "price-high", label: "Fee: High to Low" },
                  { value: "duration", label: "Longest Duration" },
                ]}
                value={sortBy}
                onChange={setSortBy}
                buttonClassName="py-3 px-4 rounded-xl border-[#E7E7E7]"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {categories.map((category) => {
              const isActive = selectedCategory === category;
              return (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                    isActive
                      ? "bg-[#FFC400] text-[#0A0A0A] shadow-sm font-bold scale-[1.02]"
                      : "bg-white border border-[#E7E7E7] text-[#0A0A0A] hover:bg-gray-50 hover:border-gray-300"
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>
        </div>

        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-[420px] rounded-2xl bg-white border border-[#E7E7E7] animate-pulse" />
            ))}
          </div>
        )}

        {loadError && (
          <div className="p-6 rounded-2xl bg-red-50 border border-red-200 text-sm text-red-800 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>Courses could not be loaded right now ({loadError}). Please refresh the page.</span>
          </div>
        )}

        {!loading && !loadError && filteredCourses.length === 0 && (
          <div className="p-10 rounded-2xl bg-white border border-[#E7E7E7] text-center text-sm text-gray-500">
            No courses match your filters.
          </div>
        )}

        {/* Courses Grid */}
        <div
          ref={gridRef}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
        >
          {filteredCourses.map((course) => {
            const seatsLeft = course.batches.reduce((sum, b) => sum + b.seatsLeft, 0);
            return (
              <div
                key={course.id}
                className="bg-white rounded-2xl border border-[#E7E7E7] overflow-hidden hover:border-[#FFC400] hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className="relative aspect-[16/9] overflow-hidden bg-slate-900">
                    {course.thumbnail && (
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    )}
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-black/75 backdrop-blur-md text-white text-[11px] font-mono font-semibold">
                      {course.code}
                    </div>
                    {course.level && (
                      <div className="absolute top-3 right-3 px-2.5 py-1 rounded-md bg-[#FFC400] text-[#0A0A0A] text-[11px] font-bold">
                        {course.level}
                      </div>
                    )}
                  </div>

                  <div className="p-6">
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                      <span className="font-semibold text-[#A17C00] uppercase tracking-wider">
                        {course.category}
                      </span>
                      <span className="font-bold text-[#0A0A0A]">{formatInr(course.price)}</span>
                    </div>

                    <h3 className="text-lg font-bold text-[#0A0A0A] font-heading mb-2 group-hover:text-[#A17C00] transition-colors leading-snug">
                      {course.title}
                    </h3>

                    <p className="text-xs text-[#555E6D] leading-relaxed mb-4 line-clamp-2">
                      {course.description}
                    </p>

                    <div className="flex items-center gap-4 text-xs text-gray-500 pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#FFC400]" />
                        <span>{course.durationHours} Hours</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-[#FFC400]" />
                        <span>{course.batches.length ? `${seatsLeft} seats open` : "No open batch"}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 pt-0">
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-[#0e271d] text-[#F5C400] text-[11px] font-black flex items-center justify-center">
                        {initials(course.facultyName || "ID")}
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-[#0A0A0A]">
                          {course.facultyName || "Academy Faculty"}
                        </div>
                        <div className="text-[10px] text-gray-500">{course.facultyTitle}</div>
                      </div>
                    </div>

                    <Link
                      href={`/courses/${course.slug}`}
                      aria-label={`View ${course.title}`}
                      className="p-2 rounded-xl bg-gray-100 hover:bg-[#FFC400] text-gray-700 hover:text-black transition-colors"
                    >
                      <ArrowUpRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      <Footer />
    </div>
  );
}
