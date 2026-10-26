"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  GraduationCap,
  ArrowRight,
  Clock,
  Video,
  ShieldCheck,
  CheckCircle2,
  Award,
  Layers,
  ChevronRight,
  Sparkles,
  Phone,
  Mail,
  MapPin,
  Users,
  Sprout,
  Factory,
  TrendingUp,
  Download,
  Calendar,
} from "lucide-react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function AboutPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const heroContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      if (heroContentRef.current) {
        gsap.fromTo(
          heroContentRef.current.children,
          { opacity: 0, y: 24 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.1,
            ease: "power2.out",
          }
        );
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-white text-slate-900 flex flex-col font-sans selection:bg-aviation-yellow selection:text-black"
    >
      <Navbar />

      <main className="flex-1 w-full">
        {/* 1. HERO: THE PATHFINDER VISION */}
        <section
          ref={heroRef}
          className="relative w-full bg-slate-900 text-white pt-16 pb-20 overflow-hidden"
        >
          <div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-14 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <div ref={heroContentRef} className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-aviation-yellow/15 border border-aviation-yellow/40 text-xs font-bold uppercase tracking-wider text-aviation-yellow">
                  <Sparkles className="w-4 h-4 text-aviation-yellow" />
                  <span>The Pathfinder for Educated Youth</span>
                </div>

                <h1 className="text-3xl sm:text-5xl font-black font-heading leading-tight tracking-tight">
                  Ignited Dreams Integrated: Empowering Self-Dependent Youth.
                </h1>

                <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
                  Our country has millions of well-educated, ambitious graduates. Ignited Dreams Integrated stands as a Pathfinder before them — delivering industry-grade skill education and hands-on training to build career-oriented lives and create grassroots entrepreneurs.
                </p>

                <div className="pt-2 flex flex-wrap items-center gap-4">
                  <Link
                    href="/checkout?course=transportation-logistics-sap"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-aviation-yellow hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-md transition-all active:scale-[0.98]"
                  >
                    <span>Enroll at Minimum Fee</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <a
                    href="#founder"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-semibold text-sm transition-all active:scale-[0.98]"
                  >
                    <span>Read Founder Story</span>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </a>
                </div>
              </div>

              {/* Founder Spotlight Card */}
              <div className="lg:col-span-5">
                <div className="relative rounded-2xl overflow-hidden border border-slate-700 bg-slate-800 shadow-2xl p-6 sm:p-8 space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-600 to-aviation-yellow text-slate-950 flex items-center justify-center font-black text-2xl shadow-lg shrink-0">
                      JD
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-white font-heading">
                        Justin Burnard Dias
                      </h2>
                      <div className="text-xs text-aviation-yellow font-bold uppercase tracking-wider">
                        Project Coordinator • ID Integrated
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        16 Years Logistics & Aviation Specialist
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed italic border-l-2 border-aviation-yellow pl-3.5">
                    "Ignited Dreams is my dream project. We are not here just to train employees for corporates; we are here to produce self-reliant entrepreneurs who will transform our villages and our nation."
                  </p>

                  <div className="space-y-2 text-xs text-slate-300 border-t border-slate-700 pt-4">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-aviation-yellow shrink-0" />
                      <span>+91 7012002405</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-aviation-yellow shrink-0" />
                      <span>burnarddiasjustin@gmail.com</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. THE THREE INTEGRATED PILLARS */}
        <section className="py-20 bg-slate-50 border-b border-slate-200">
          <div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-14">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <Badge variant="yellow" size="sm" className="mb-3">
                The Integrated Ecosystem
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 font-heading tracking-tight">
                Three Pillars. One Transformative Mission.
              </h2>
              <p className="text-sm sm:text-base text-slate-600 mt-3 leading-relaxed">
                A hybrid model combining a commercial Skill Training Firm with non-profit Co-operative Societies and Agricultural NGO initiatives.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Pillar 1 */}
              <div className="p-8 rounded-2xl bg-white border-2 border-slate-200 hover:border-aviation-yellow shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-aviation-yellow/15 border border-aviation-yellow/40 text-aviation-yellowDeep flex items-center justify-center mb-6">
                    <GraduationCap className="w-6 h-6" />
                  </div>
                  <div className="text-[11px] font-mono font-bold uppercase text-amber-700 bg-amber-50 px-2 py-0.5 rounded w-fit mb-2">
                    For-Profit Firm Engine
                  </div>
                  <h3 className="text-xl font-black text-slate-900 font-heading mb-3">
                    1. Career Skill Academy
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed mb-4">
                    High-demand professional training in <strong>Transportation & Logistics Management with SAP</strong>, Aviation Management, and Business Operations at <strong>only ₹25,000 (tax included)</strong> — approximately 20% of private academy fees (₹1,25,000+).
                  </p>
                  <ul className="text-xs text-slate-600 space-y-2 mb-6">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>50 students cohort: 1 Mentor + 2 Trainers</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Daily 3 hours (2h live class + 1h doubt clearing)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>7-day student replay ➔ 2-year secure server archive</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Weekend project/speech submission + Viva exams</span>
                    </li>
                  </ul>
                </div>

                <Link
                  href="/courses"
                  className="text-xs font-bold text-slate-900 hover:text-amber-600 inline-flex items-center gap-1.5"
                >
                  <span>Explore Course Modules</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Pillar 2 */}
              <div className="p-8 rounded-2xl bg-white border-2 border-slate-200 hover:border-aviation-yellow shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-aviation-yellow/15 border border-aviation-yellow/40 text-aviation-yellowDeep flex items-center justify-center mb-6">
                    <Factory className="w-6 h-6" />
                  </div>
                  <div className="text-[11px] font-mono font-bold uppercase text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded w-fit mb-2">
                    Non-Profit Co-Operative Society
                  </div>
                  <h3 className="text-xl font-black text-slate-900 font-heading mb-3">
                    2. Micro-FMCG Production Units
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed mb-4">
                    Transforming youth and self-help groups into proud micro-factory owners producing <strong>toffees, chocolates, bakery, and FMCG products</strong>.
                  </p>
                  <ul className="text-xs text-slate-600 space-y-2 mb-6">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>End-to-end recipe, machinery & procurement training</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Complete FSSAI, GST & regulatory legal clearance</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Scheduled collection & direct retail distribution</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>10%–20% operational fee; 80%–90% net profit to units</span>
                    </li>
                  </ul>
                </div>

                <div className="text-xs font-mono font-bold text-slate-500">
                  Zero Marketing Risk for Youth
                </div>
              </div>

              {/* Pillar 3 */}
              <div className="p-8 rounded-2xl bg-white border-2 border-slate-200 hover:border-aviation-yellow shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-aviation-yellow/15 border border-aviation-yellow/40 text-aviation-yellowDeep flex items-center justify-center mb-6">
                    <Sprout className="w-6 h-6" />
                  </div>
                  <div className="text-[11px] font-mono font-bold uppercase text-blue-700 bg-blue-50 px-2 py-0.5 rounded w-fit mb-2">
                    Non-Profit NGO / Farmers Collective
                  </div>
                  <h3 className="text-xl font-black text-slate-900 font-heading mb-3">
                    3. Sustainable Village Agriculture
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed mb-4">
                    Ensuring every village achieves basic vegetable self-reliance through <strong>"Minimum Space, Maximum Production"</strong> and inverted gardens.
                  </p>
                  <ul className="text-xs text-slate-600 space-y-2 mb-6">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Inverted vegetable gardens & vertical compact farming</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Science-backed farming: Anti-corporate middleman cartels</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Direct raw material linkage (e.g. Village cocoa for chocolate)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Logistics students manage storage & export documentation</span>
                    </li>
                  </ul>
                </div>

                <div className="text-xs font-mono font-bold text-slate-500">
                  Closed-Loop Collaborative Model
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. FOUNDER PROFILE & 2-YEAR BLUEPRINT */}
        <section id="founder" className="py-20 bg-white">
          <div className="max-w-[1280px] mx-auto px-6 sm:px-10 lg:px-14">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-5 space-y-4">
                <div className="p-8 rounded-2xl bg-slate-900 text-white space-y-6">
                  <div className="w-14 h-14 rounded-2xl bg-aviation-yellow text-slate-950 flex items-center justify-center font-black text-2xl">
                    JD
                  </div>
                  <h3 className="text-2xl font-black font-heading">
                    Justin Burnard Dias
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    41 years old • Ernakulam, Kerala. 16 years teaching logistics and aviation, travel & tourism management, and 3PL operations. Designing growth strategies for corporate firms for the last 4 years.
                  </p>

                  <div className="p-4 rounded-xl bg-slate-800 border border-slate-700 text-xs space-y-2">
                    <div className="text-aviation-yellow font-bold">Two-Year Financial Projection Target:</div>
                    <div className="flex justify-between text-slate-300">
                      <span>Target Students:</span>
                      <strong className="text-white">2,000 Students</strong>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Target Revenue:</span>
                      <strong className="text-white">₹5.00 Crore</strong>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Capped Investor Return:</span>
                      <strong className="text-white">₹20 Lakhs (2 Million)</strong>
                    </div>
                    <div className="flex justify-between text-emerald-400">
                      <span>Surplus Destination:</span>
                      <strong className="text-emerald-400">100% Reinvested in Village Units</strong>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-400 italic">
                    "I will work 10–12 hours daily as a salaried employee alongside my team for the well-being of the students and our integrated projects."
                  </div>
                </div>
              </div>

              <div className="lg:col-span-7 space-y-6">
                <Badge variant="yellow" size="sm">
                  Phase 1 Technical Launch: 20th October 2026
                </Badge>
                <h2 className="text-3xl sm:text-4xl font-black text-slate-900 font-heading tracking-tight leading-snug">
                  From Kerala to All of India: Building Self-Reliant Youth.
                </h2>
                <p className="text-sm text-slate-600 leading-relaxed">
                  The initial phase focuses on our flagship <strong>Transportation & Logistics Management Course with SAP</strong>. Students can access interactive live classes directly on <code>www.igniteddreams.com</code> from anywhere in India.
                </p>
                <p className="text-sm text-slate-600 leading-relaxed">
                  With <strong>1 Mentor and 2 Trainers assigned to every 50 students</strong>, rigorous attendance and camera monitoring, and mandatory weekly project submissions, we guarantee that every single rupee invested in your education translates into tangible, career-ready competence.
                </p>

                <div className="pt-4 flex flex-wrap gap-4">
                  <Link href="/checkout?course=transportation-logistics-sap">
                    <Button variant="primary" size="lg" className="font-bold shadow-md" rightIcon={<ArrowRight className="w-4 h-4" />}>
                      Enroll in Batch (All-Inclusive)
                    </Button>
                  </Link>
                  <Link href="/contact">
                    <Button variant="outline" size="lg">
                      Contact Coordinator
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
