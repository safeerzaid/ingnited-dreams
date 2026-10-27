"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Card from "@/components/ui/Card";
import FaqAccordion from "@/components/FaqAccordion";
import { motion } from "framer-motion";
import AnimatedTitle from "@/components/common/AnimatedTitle";
import ArrowPillButton from "@/components/ui/ArrowPillButton";
import CountUpNumber from "@/components/common/CountUpNumber";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  GraduationCap,
  ArrowRight,
  Video,
  Clock,
  Download,
  Shield,
  Layers,
  CheckCircle2,
  Users,
  Airplay,
  ChevronRight,
  Calendar,
  BookOpen,
  Sparkles,
  Bookmark,
  Play,
  ChevronLeft,
  ChevronDown,
  Volume2,
  Settings,
  Maximize,
  Share2,
  MoreVertical,
  Briefcase,
  TrendingUp,
  FileSpreadsheet,
  Factory,
  Sprout,
  Mail,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  ArrowUpRight,
  Truck,
  Cpu,
  Plane,
} from "lucide-react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// Gold line-art sprig of a Christmas rose, used as side decoration in the memorial section
function MemorialSprig({ className = "" }: { className?: string }) {
  const petals = [0, 72, 144, 216, 288];
  const stamens = Array.from({ length: 10 }, (_, i) => (i * Math.PI * 2) / 10);
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 200 300"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.1"
      strokeLinecap="round"
      className={className}
    >
      {/* Stem and side stem with bud */}
      <path d="M100 298 C 94 245, 110 190, 100 128" />
      <path d="M101 170 C 118 158, 132 140, 138 118" />
      <ellipse cx="141" cy="108" rx="7" ry="11" transform="rotate(28 141 108)" />
      {/* Leaves with midribs */}
      <path d="M99 236 C 72 218, 48 224, 36 250 C 62 256, 84 250, 99 236 Z" />
      <path d="M99 236 Q 68 242 36 250" />
      <path d="M103 200 C 128 180, 152 184, 166 204 C 142 214, 120 214, 103 200 Z" />
      <path d="M103 200 Q 134 200 166 204" />
      {/* Five-petal flower */}
      {petals.map((angle) => (
        <ellipse key={angle} cx="100" cy="72" rx="20" ry="27" transform={`rotate(${angle} 100 100)`} />
      ))}
      <circle cx="100" cy="100" r="7" />
      {stamens.map((a) => (
        <circle
          key={a}
          cx={100 + Math.cos(a) * 13}
          cy={100 + Math.sin(a) * 13}
          r="1.4"
          fill="currentColor"
          stroke="none"
        />
      ))}
    </svg>
  );
}

function Sparkle({ className = "" }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2c.6 3.9 2.1 5.4 6 6-3.9.6-5.4 2.1-6 6-.6-3.9-2.1-5.4-6-6 3.9-.6 5.4-2.1 6-6Z" />
    </svg>
  );
}

// Leadership messages shown on the home page, in this order (Chairman first)
const LEADERSHIP_MESSAGES = [
  {
    role: "Chairman",
    name: "Febin Sunny",
    initials: "FS",
    seal: "✦ CHAIRMAN ✦ IGNITED DREAMS ✦",
    photo: "/images/leadership/chairman-febin-sunny.jpg",
    photoPosition: "50% 30%",
    headline: "Transforming Your Dreams Into Reality.",
    message: [
      "At Ignited Dreams, we believe that every young person has the potential to achieve great things with the right skills and guidance.",
      "Our motto is to empower youth through skill-based education and prepare them for a successful future.",
      "We are committed to making quality skill education accessible and affordable to all aspiring learners.",
      "We aim to nurture talent, inspire innovation, and encourage entrepreneurship to build a self-reliant generation.",
      "At Ignited Dreams, we will help you transform your dreams into reality and make your dreams shine bright.",
      "I wish all our students great success, confidence, and a bright future filled with endless opportunities!",
    ],
  },
  {
    role: "CEO",
    name: "Justin Burnard Dias",
    initials: "JBD",
    seal: "✦ CEO ✦ IGNITED DREAMS ✦",
    photo: "/images/leadership/ceo.jpg",
    photoPosition: "50% 40%",
    headline: "Education Is a Right, Not a Business.",
    message: [
      "At Ignited Dreams, we believe that quality education and skill development should be accessible to every young person at an affordable cost.",
      "We believe education is a right, not merely a business for profit.",
      "Our vision is to educate youth to empower our country by nurturing skilled professionals and future entrepreneurs.",
      "Together, let us build a self-reliant generation and a stronger nation.",
      "Wishing all our youth a bright future filled with knowledge, confidence, success, and endless opportunities!",
    ],
  },
];

export default function HomePage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  // Hero section refs
  const heroLeftRef = useRef<HTMLDivElement>(null);
  const heroRightRef = useRef<HTMLDivElement>(null);
  const statsSectionRef = useRef<HTMLDivElement>(null);

  // Pillars refs
  const pillarsRef = useRef<HTMLElement>(null);
  const pillarsHeaderRef = useRef<HTMLDivElement>(null);
  const pillarCardsRef = useRef<HTMLDivElement>(null);

  // Courses refs
  const coursesRef = useRef<HTMLElement>(null);
  const coursesHeaderRef = useRef<HTMLDivElement>(null);
  const courseGridRef = useRef<HTMLDivElement>(null);
  const coursesCtaRef = useRef<HTMLDivElement>(null);


  // Steps refs
  const stepsRef = useRef<HTMLElement>(null);
  const stepsHeaderRef = useRef<HTMLDivElement>(null);
  const stepsGridRef = useRef<HTMLDivElement>(null);

  // FAQ refs
  const faqRef = useRef<HTMLElement>(null);
  const faqHeaderRef = useRef<HTMLDivElement>(null);
  const faqListRef = useRef<HTMLDivElement>(null);

  // CTA refs
  const ctaRef = useRef<HTMLElement>(null);
  const ctaBgRef = useRef<HTMLDivElement>(null);
  const ctaCardRef = useRef<HTMLDivElement>(null);

  const courses = [
    {
      title: "Transportation & Logistics Management with SAP",
      code: "ID-TLM-SAP-101",
      slug: "transportation-logistics-sap",
      duration: "6 Months (3h / Day)",
      category: "Transportation & Logistics",
      price: "₹25,000 (Tax Included)",
      description:
        "Comprehensive practical training covering multimodal freight, container logistics, port terminal flow, customs clearance, and practical SAP S/4HANA Logistics Execution (VL01N, PGI, transfer orders). Includes English soft skills and viva preparation at running cost.",
      image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=85",
      tags: ["Flagship 6 Months", "All-Inclusive"],
      bottomColor: "#0A1724",
      midColor: "rgba(10, 23, 36, 0.92)",
    },
    {
      title: "Aviation Management & Airport Ground Operations",
      code: "ID-AVM-201",
      slug: "aviation-management-airport-operations",
      duration: "6 Months (3h / Day)",
      category: "Aviation Management",
      price: "₹25,000 (Tax Included)",
      description:
        "Airport operations and ground handling training covering ramp safety, passenger terminal customer service, baggage sorting, airway bills (AWB), and airline ticketing systems.",
      image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=800&q=85",
      tags: ["Airport Operations"],
      bottomColor: "#0E1C14",
      midColor: "rgba(14, 28, 20, 0.92)",
    },
    {
      title: "Global Supply Chain & Freight Forwarding with ERP",
      code: "ID-SCM-301",
      slug: "supply-chain-freight-forwarding",
      duration: "6 Months (3h / Day)",
      category: "Transportation & Logistics",
      price: "₹25,000 (Tax Included)",
      description:
        "Master international freight forwarding, shipping lines coordination, customs ICEGATE portal compliance, Letter of Credit (LC), and automated warehouse inventory control systems.",
      image: "https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=800&q=85",
      tags: ["Freight Forwarding"],
      bottomColor: "#17121F",
      midColor: "rgba(23, 18, 31, 0.92)",
    },
    {
      title: "Air Cargo Operations & Dangerous Goods (DGR)",
      code: "ID-CARGO-401",
      slug: "air-cargo-logistics-dgr",
      duration: "6 Months (3h / Day)",
      category: "Aviation Management",
      price: "₹25,000 (Tax Included)",
      description:
        "Specialized training for air cargo freight forwarders, pharma cold-chain handlers, and airport cargo terminal supervisors adhering strictly to IATA standards.",
      image: "https://images.unsplash.com/photo-1519074069444-1ba4ea16e879?auto=format&fit=crop&w=800&q=85",
      tags: ["IATA DGR Cargo"],
      bottomColor: "#0A1624",
      midColor: "rgba(10, 22, 36, 0.92)",
    },
    {
      title: "FMCG Micro-Manufacturing & Supply Chain Distribution",
      code: "ID-FMCG-501",
      slug: "fmcg-production-supply-chain",
      duration: "6 Months (3h / Day)",
      category: "Integrated Projects",
      price: "₹25,000 (Tax Included)",
      description:
        "Learn to establish and operate self-dependent micro-manufacturing units (toffees, chocolates, FMCG packaged foods), legal FSSAI/GST clearance, and manage distribution via our Co-operative logistics network.",
      image: "https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=800&q=85",
      tags: ["Entrepreneurship"],
      bottomColor: "#111A22",
      midColor: "rgba(17, 26, 34, 0.92)",
    },
    {
      title: "Executive Business Operations & Corporate Administration",
      code: "ID-BOM-601",
      slug: "business-operations-management",
      duration: "6 Months (3h / Day)",
      category: "Business & Management",
      price: "₹25,000 (Tax Included)",
      description:
        "Comprehensive training for corporate administration readiness covering enterprise ERP workflows, procurement administration, business communication, and multinational client service protocols.",
      image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=85",
      tags: ["Corporate Ready"],
      bottomColor: "#11141A",
      midColor: "rgba(17, 20, 26, 0.92)",
    },
  ];

  const steps = [
    {
      number: "01",
      title: "Online Admission & Fee (₹25K)",
      desc: "Enroll at running cost (tax-inclusive vs ₹1,25,000+ in private academies) and get your digital admission pass.",
      icon: Users,
      highlight: "80% Cost Saving",
    },
    {
      number: "02",
      title: "50-Student Batch Check-In",
      desc: "Get assigned to your dedicated cohort staffed with 1 Master Mentor and 2 Specialized Trainers for personalized instruction.",
      icon: BookOpen,
      highlight: "1:25 Faculty Ratio",
    },
    {
      number: "03",
      title: "Monitored Live Classroom",
      desc: "Attend daily 3-hour sessions (2h live class + 1h doubt clearing, 5 days/wk) directly on this website with webcam monitoring.",
      icon: Video,
      highlight: "Strict Proctoring",
    },
    {
      number: "04",
      title: "7-Day Replay & Revision",
      desc: "Every session is available on your dashboard for 7 full days to revise SAP transaction steps and freight workflows.",
      icon: Play,
      highlight: "7-Day Revision",
    },
    {
      number: "05",
      title: "Day 7 Server Vault Archival",
      desc: "On the 7th midnight, sessions are downloaded and safely stored in the company server vault for 2 years for verification.",
      icon: Download,
      highlight: "2-Year Vault",
    },
    {
      number: "06",
      title: "Weekend Project & Viva Exam",
      desc: "Submit weekly reports or speech presentations every weekend, followed by SAP written and Logistics/English Viva exit exams.",
      icon: Briefcase,
      highlight: "Viva Certified",
    },
  ];

  const faqs = [
    {
      q: "How does the ₹25,000 fee comparison work?",
      a: "Commercial private academies charge between ₹1,25,000 and ₹1,50,000 + 18% GST. Ignited Dreams Integrated charges only ₹25,000 with all taxes included (approximately 20% of private academy rates), providing top-tier training at running cost to democratize skills for all educated youth.",
    },
    {
      q: "Where do students and mentors meet for live classes?",
      a: "Classes take place directly on our website (www.igniteddreams.com) via our embedded virtual classroom. No third-party apps like Zoom are needed. Daily schedule is 3 hours: 2 hours of core lecture + 1 hour of interactive doubt clearance, 5 days every week.",
    },
    {
      q: "How are classes monitored for discipline?",
      a: "Both trainers and students are strictly monitored via webcams during class hours. Attendance and active participation are verified every single day to ensure high academic rigor and corporate readiness.",
    },
    {
      q: "What is the recording lifecycle policy?",
      a: "Every live class is recorded in HD and kept on the website for 7 days for student reference and revision. On the 7th day, the session is downloaded and safely archived in our secure company server vault for 2 years.",
    },
    {
      q: "What are the weekend project and examination requirements?",
      a: "Every weekend, students must submit a synthesis project on what they studied during the week, either as a written report or a speech presentation. Final certification at 6 months includes an online written exam for SAP ERP and VIVA (oral board) exams for Logistics and English soft skills.",
    },
    {
      q: "How do the Integrated Agriculture and FMCG Production units connect?",
      a: "Ignited Dreams operates a closed-loop hybrid model. While the Skill Academy is a for-profit firm, the Micro-FMCG production units (toffees, chocolates) and Village Agriculture initiatives (inverted vegetable gardens, direct farmer cocoa procurement) run as non-profit Co-operative Societies and NGOs, with Logistics academy students managing storage, transport, and exports!",
    },
  ];

  useEffect(() => {
    if (typeof window === "undefined") return;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      // 0. Top Scroll Progress Bar (Enhanced with Lime-Green Glow)
      if (progressBarRef.current) {
        gsap.to(progressBarRef.current, {
          scaleX: 1,
          ease: "none",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.15,
          },
        });
      }

      // 1. Hero Content & Collage Entrance Animation
      if (heroLeftRef.current) {
        gsap.fromTo(
          heroLeftRef.current.children,
          { opacity: 0, y: 35 },
          {
            opacity: 1,
            y: 0,
            duration: 0.85,
            stagger: 0.12,
            ease: "power3.out",
          }
        );
      }

      if (heroRightRef.current) {
        gsap.fromTo(
          heroRightRef.current,
          { opacity: 0, scale: 0.94, y: 30 },
          {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 1.1,
            ease: "power3.out",
            delay: 0.15,
          }
        );

        // Smooth Parallax on Hero Right Collage when scrolling down
        gsap.to(heroRightRef.current, {
          y: -40,
          ease: "none",
          scrollTrigger: {
            trigger: heroRightRef.current,
            start: "top center",
            end: "bottom top",
            scrub: 1,
          },
        });
      }

      // 2. "By The Numbers" Stats Counter & Cards Reveal on Scroll
      if (statsSectionRef.current) {
        gsap.fromTo(
          statsSectionRef.current.children,
          { opacity: 0, y: 35, scale: 0.95 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.75,
            stagger: 0.12,
            ease: "power2.out",
            scrollTrigger: {
              trigger: statsSectionRef.current,
              start: "top 85%",
            },
          }
        );
      }

      // 3. Pillars Section Reveal on Scroll
      if (pillarsHeaderRef.current) {
        gsap.fromTo(
          pillarsHeaderRef.current,
          { opacity: 0, y: 32 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power2.out",
            scrollTrigger: {
              trigger: pillarsHeaderRef.current,
              start: "top 85%",
            },
          }
        );
      }

      if (pillarCardsRef.current) {
        gsap.fromTo(
          pillarCardsRef.current.children,
          { opacity: 0, y: 40, scale: 0.97 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.8,
            stagger: 0.16,
            ease: "power2.out",
            scrollTrigger: {
              trigger: pillarCardsRef.current,
              start: "top 82%",
            },
          }
        );
      }

      // 3. Courses / Curriculum Section Reveal on Scroll
      if (coursesHeaderRef.current) {
        gsap.fromTo(
          coursesHeaderRef.current,
          { opacity: 0, y: 32 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power2.out",
            scrollTrigger: {
              trigger: coursesHeaderRef.current,
              start: "top 85%",
            },
          }
        );
      }


      // Course Cards Staggered Reveal
      if (courseGridRef.current) {
        gsap.fromTo(
          courseGridRef.current.children,
          { opacity: 0, y: 45, scale: 0.98 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.8,
            stagger: 0.12,
            ease: "power2.out",
            scrollTrigger: {
              trigger: courseGridRef.current,
              start: "top 82%",
            },
          }
        );
      }

      if (coursesCtaRef.current) {
        gsap.fromTo(
          coursesCtaRef.current,
          { opacity: 0, y: 25 },
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            ease: "power2.out",
            scrollTrigger: {
              trigger: coursesCtaRef.current,
              start: "top 92%",
            },
          }
        );
      }


      // 5. How Academy Learning Works
      if (stepsHeaderRef.current) {
        gsap.fromTo(
          stepsHeaderRef.current,
          { opacity: 0, y: 32 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power2.out",
            scrollTrigger: {
              trigger: stepsHeaderRef.current,
              start: "top 85%",
            },
          }
        );
      }

      if (stepsGridRef.current) {
        gsap.fromTo(
          stepsGridRef.current.children,
          { opacity: 0, y: 36, scale: 0.97 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.75,
            stagger: 0.1,
            ease: "power2.out",
            scrollTrigger: {
              trigger: stepsGridRef.current,
              start: "top 80%",
            },
          }
        );
      }

      // 6. FAQ Section
      if (faqHeaderRef.current) {
        gsap.fromTo(
          faqHeaderRef.current,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.75,
            ease: "power2.out",
            scrollTrigger: {
              trigger: faqHeaderRef.current,
              start: "top 85%",
            },
          }
        );
      }

      if (faqListRef.current) {
        gsap.fromTo(
          faqListRef.current,
          { opacity: 0, y: 35 },
          {
            opacity: 1,
            y: 0,
            duration: 0.85,
            ease: "power2.out",
            scrollTrigger: {
              trigger: faqListRef.current,
              start: "top 82%",
            },
          }
        );
      }

      // 7. CTA Banner
      if (ctaCardRef.current && ctaRef.current) {
        gsap.fromTo(
          ctaCardRef.current,
          { opacity: 0, y: 40, scale: 0.97 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.85,
            ease: "power2.out",
            scrollTrigger: {
              trigger: ctaRef.current,
              start: "top 82%",
            },
          }
        );
      }

      if (ctaBgRef.current && ctaRef.current) {
        gsap.to(ctaBgRef.current, {
          yPercent: -15,
          ease: "none",
          scrollTrigger: {
            trigger: ctaRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        });
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="min-h-screen flex flex-col bg-white relative">
      {/* Sleek GSAP Scroll Progress Bar (Neon Lime Theme) */}
      <div
        ref={progressBarRef}
        className="fixed top-0 left-0 right-0 h-[3px] bg-[#F5C400] z-[9999] origin-left shadow-[0_0_12px_rgba(245,196,0,0.9)] pointer-events-none"
        style={{ transform: "scaleX(0)" }}
      />

      {/* Top Bar and Pinned Navigation Header with Student Login */}
      <Navbar />

      {/* 1. EXACT REFERENCE HERO SECTION (Full Width Edge-to-Edge Layout) */}
      <section className="w-full bg-white border-b border-slate-200/80 overflow-hidden">
        {/* Full-Width Hero Main Content (2-Column Grid + Collage) */}
        <div className="relative w-full bg-white pt-10 sm:pt-16 lg:pt-20 pb-16 sm:pb-24 lg:pb-28 overflow-hidden">
          {/* Decorative Dot Patterns */}
          <svg className="absolute top-6 left-1/2 -translate-x-1/2 opacity-25 pointer-events-none" width="140" height="60" viewBox="0 0 140 60" fill="#94a3b8">
            <circle cx="10" cy="10" r="2.5" />
            <circle cx="30" cy="15" r="2" />
            <circle cx="50" cy="8" r="2.5" />
            <circle cx="70" cy="18" r="2" />
            <circle cx="90" cy="12" r="2.5" />
            <circle cx="110" cy="22" r="2" />
            <circle cx="130" cy="14" r="2.5" />
            <circle cx="20" cy="35" r="2" />
            <circle cx="45" cy="40" r="2.5" />
            <circle cx="65" cy="32" r="2" />
            <circle cx="85" cy="45" r="2.5" />
            <circle cx="105" cy="35" r="2" />
            <circle cx="125" cy="42" r="2" />
          </svg>

          <svg className="absolute bottom-8 left-1/4 opacity-25 pointer-events-none" width="110" height="50" viewBox="0 0 110 50" fill="#94a3b8">
            <circle cx="15" cy="15" r="2" />
            <circle cx="35" cy="12" r="2.5" />
            <circle cx="55" cy="20" r="2" />
            <circle cx="75" cy="10" r="2.5" />
            <circle cx="95" cy="18" r="2" />
            <circle cx="25" cy="35" r="2.5" />
            <circle cx="45" cy="32" r="2" />
            <circle cx="65" cy="38" r="2" />
            <circle cx="85" cy="30" r="2.5" />
          </svg>

          <div className="max-w-[1600px] mx-auto px-5 sm:px-8 lg:px-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 xl:gap-14 items-center relative z-10">
              {/* Left Column (Content) */}
              <div ref={heroLeftRef} className="lg:col-span-6 space-y-6">
                {/* Eyebrow Pill */}
                <div className="inline-flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#F5C400] inline-block" />
                  <span className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.16em] text-[#0e271d]">
                    Elevate Your Career With Us
                  </span>
                </div>

                {/* Main Bold Title (Exact typography from reference image) */}
                <h1 className="text-4xl sm:text-5xl lg:text-[60px] xl:text-[68px] font-extrabold text-[#0e271d] font-heading tracking-[-0.035em] leading-[1.08]">
                  Empowering Your<br />
                  Success with<br />
                  Practical Logistics.
                </h1>

                {/* Subtitle Description */}
                <p className="text-slate-600 text-sm sm:text-base lg:text-[17px] leading-[1.65] max-w-xl font-normal">
                  Structured skill training in Transportation, Logistics Management with SAP ERP, and Aviation Operations at pure running cost with live interactive classes and a guaranteed 7-day revision engine.
                </p>

                {/* Buttons Row */}
                <div className="flex flex-wrap items-center gap-5 pt-2">
                  <ArrowPillButton href="/checkout?course=transportation-logistics-sap">
                    Explore More
                  </ArrowPillButton>

                  <Link
                    href="/courses"
                    className="text-xs sm:text-sm font-bold text-[#0e271d] hover:text-[#184432] underline underline-offset-4 decoration-2 decoration-[#0e271d]/25 hover:decoration-[#0e271d] transition-all tracking-[-0.01em]"
                  >
                    + View All Services
                  </Link>
                </div>
              </div>

              {/* RIGHT COLUMN: Exact reference image collage layout (Left Card + 3-Slice continuous right stack) */}
              <div ref={heroRightRef} className="lg:col-span-6 relative flex items-center justify-center min-h-[440px] sm:min-h-[520px] lg:min-h-[560px]">
                {/*
                  Layout (exact reference match):
                  - Left: Portrait rounded card with team photo.
                  - Badge: Scalloped circular badge overlapping bottom-left of Left Card.
                  - Right: Taller 3-slice stack slicing ONE seamless continuous photo with white gaps.
                  - Sparkles: Lime 4-point stars at bottom-right of bottom slice.
                */}
                <div className="relative w-full max-w-[530px] h-[460px] sm:h-[530px] flex items-center justify-center scale-[0.82] min-[380px]:scale-[0.88] min-[430px]:scale-[0.95] sm:scale-100 origin-center transition-transform">

                  {/* ELEMENT 1: Left Card — Vertical Rounded Card (Team Collaboration) */}
                  <div className="absolute left-2 sm:left-4 top-[70px] sm:top-[80px] w-[190px] sm:w-[230px] h-[320px] sm:h-[360px] rounded-[30px] sm:rounded-[36px] overflow-hidden shadow-2xl border-[3px] border-white bg-slate-200 z-10 transition-transform hover:scale-[1.02] duration-300">
                    <img
                      src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=800"
                      alt="Students collaborating at Ignited Dreams"
                      className="w-full h-full object-cover object-center grayscale contrast-[1.1]"
                    />
                  </div>

                  {/* Circular Rotating Badge — overlaps bottom-left corner of Left Card */}
                  <div className="absolute top-[345px] sm:top-[390px] left-0 sm:left-1 z-30 w-[84px] h-[84px] sm:w-[94px] sm:h-[94px] rounded-full bg-[#0e271d] shadow-2xl border-[3px] border-white flex items-center justify-center">
                    {/* Spinning circular text */}
                    <svg
                      className="absolute w-full h-full animate-[spin_14s_linear_infinite]"
                      viewBox="0 0 100 100"
                    >
                      <path
                        id="sealCirclePathHero"
                        d="M 50,50 m -36,0 a 36,36 0 1,1 72,0 a 36,36 0 1,1 -72,0"
                        fill="none"
                      />
                      <text fontSize="7.8" fontWeight="800" fill="#F5C400" letterSpacing="1.5">
                        <textPath href="#sealCirclePathHero" startOffset="0%">
                          ✦ IGNITED DREAMS ✦ ADMISSION OPEN ✦
                        </textPath>
                      </text>
                    </svg>
                    {/* Center golden yellow circle with dark arrow */}
                    <Link
                      href="/checkout?course=transportation-logistics-sap"
                      aria-label="Join Course"
                      className="relative z-10 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#F5C400] flex items-center justify-center text-[#0e271d] shadow-[0_0_12px_rgba(245,196,0,0.5)] hover:scale-110 transition-transform"
                    >
                      <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
                    </Link>
                  </div>

                  {/* ELEMENT 2: Right Stack — 3 Horizontal Slices of ONE continuous seamless photo */}
                  <div className="absolute right-1 sm:right-3 top-2 sm:top-4 w-[215px] sm:w-[255px] flex flex-col gap-2 z-20 [transform:skewX(-2.5deg)] transition-transform hover:scale-[1.01] duration-300">
                    
                    {/* Slice 1: Top Slice (Curved top-left & top-right) */}
                    <div className="h-[135px] sm:h-[150px] w-full rounded-t-[34px] sm:rounded-t-[38px] rounded-b-[12px] sm:rounded-b-[14px] overflow-hidden relative shadow-md border-2 border-white/80 bg-slate-200">
                      <img
                        src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&q=80&w=1000"
                        alt="Logistics training session - top view"
                        className="absolute top-0 left-0 w-full h-[470px] sm:h-[515px] max-w-none object-cover object-top grayscale contrast-[1.1]"
                      />
                    </div>

                    {/* Slice 2: Middle Slice (Subtle rounded corners) */}
                    <div className="h-[165px] sm:h-[180px] w-full rounded-[14px] sm:rounded-[16px] overflow-hidden relative shadow-md border-2 border-white/80 bg-slate-200">
                      <img
                        src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&q=80&w=1000"
                        alt="Logistics training session - middle view"
                        className="absolute -top-[143px] sm:-top-[158px] left-0 w-full h-[470px] sm:h-[515px] max-w-none object-cover object-top grayscale contrast-[1.1]"
                      />
                    </div>

                    {/* Slice 3: Bottom Slice (Curved bottom-left & bottom-right) */}
                    <div className="h-[150px] sm:h-[165px] w-full rounded-t-[12px] sm:rounded-t-[14px] rounded-b-[36px] sm:rounded-b-[40px] overflow-hidden relative shadow-md border-2 border-white/80 bg-slate-200">
                      <img
                        src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&q=80&w=1000"
                        alt="Logistics training session - bottom view"
                        className="absolute -top-[316px] sm:-top-[346px] left-0 w-full h-[470px] sm:h-[515px] max-w-none object-cover object-top grayscale contrast-[1.1]"
                      />
                    </div>

                    {/* Sparkle Stars: Overlapping bottom-right of bottom slice */}
                    <div className="absolute -bottom-4 -right-4 z-30 pointer-events-none flex flex-col items-end">
                      <svg
                        className="w-10 h-10 sm:w-12 sm:h-12 fill-[#F5C400] animate-pulse drop-shadow-[0_0_8px_rgba(245,196,0,0.7)]"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
                      </svg>
                      <svg
                        className="w-5 h-5 sm:w-6 sm:h-6 fill-[#F5C400] animate-pulse delay-300 -mt-2 mr-3 drop-shadow-[0_0_5px_rgba(245,196,0,0.6)]"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
                      </svg>
                    </div>

                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TICKER / MARQUEE BAR — after hero, before stats (Smooth Continuous Moving Track) */}
      <div className="w-full bg-[#0e271d] overflow-hidden py-3.5 border-y border-[#163a2b] shadow-inner">
        <div className="marquee-container">
          {/* Track 1 */}
          <div className="marquee-track">
            {[
              "Transportation Management",
              "Logistics Operations",
              "SAP ERP for Supply Chain",
              "Aviation Ground Operations",
              "Freight Forwarding",
              "Customs & EXIM Procedures",
              "Warehouse Management",
              "3PL & Last-Mile Delivery",
              "Port & Shipping Logistics",
              "Supply Chain Analytics",
              "Career Placement Support",
              "7-Day Revision Engine",
            ].map((item, i) => (
              <span key={i} className="inline-flex items-center gap-4 px-5">
                <svg
                  className="w-4 h-4 fill-[#F5C400] shrink-0"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
                </svg>
                <span className="text-white font-bold text-xs sm:text-[13px] tracking-[0.06em] uppercase whitespace-nowrap">
                  {item}
                </span>
              </span>
            ))}
          </div>

          {/* Track 2 (Exact duplicate for 100% gapless continuous infinite scroll) */}
          <div className="marquee-track" aria-hidden="true">
            {[
              "Transportation Management",
              "Logistics Operations",
              "SAP ERP for Supply Chain",
              "Aviation Ground Operations",
              "Freight Forwarding",
              "Customs & EXIM Procedures",
              "Warehouse Management",
              "3PL & Last-Mile Delivery",
              "Port & Shipping Logistics",
              "Supply Chain Analytics",
              "Career Placement Support",
              "7-Day Revision Engine",
            ].map((item, i) => (
              <span key={i} className="inline-flex items-center gap-4 px-5">
                <svg
                  className="w-4 h-4 fill-[#F5C400] shrink-0"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
                </svg>
                <span className="text-white font-bold text-xs sm:text-[13px] tracking-[0.06em] uppercase whitespace-nowrap">
                  {item}
                </span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 2. STATS & ECOSYSTEM IMPACT SECTION (Exact Reference Agency Dual-Tone Headline + Gallery + By The Numbers) */}
      <section ref={pillarsRef} className="w-full bg-white py-20 sm:py-28">
        <div className="max-w-[1240px] mx-auto px-6 sm:px-10 lg:px-16">

          {/* Section Header: Pill + Dual-Tone Headline + Right Studio Link (Matches Reference Screenshot) */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-14">
            <div className="max-w-3xl">
              <span className="inline-flex items-center gap-2 text-[11px] sm:text-xs font-bold uppercase tracking-[0.16em] text-[#0e271d] mb-4">
                <span className="w-2 h-2 rounded-full bg-[#F5C400]" />
                Who We Are
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-extrabold text-[#0e271d] leading-[1.12] tracking-[-0.035em]">
                We build practical logistics &amp; SAP systems to help category{" "}
                <span className="text-[#0e271d]/35">cadets lead global industries.</span>
              </h2>
            </div>
            <Link
              href="/about"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#0e271d] uppercase tracking-[0.08em] hover:text-emerald-700 transition-colors whitespace-nowrap self-start lg:self-end"
            >
              <span>+ About The Academy</span>
            </Link>
          </div>

          {/* Top Split: Left (images) + Right (text + bars + btn) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

            {/* LEFT: Two overlapping stacked photos */}
            <div className="relative">
              <div className="relative h-[320px] sm:h-[370px]">
                {/* Bottom-right card (behind) */}
                <div className="absolute bottom-0 right-4 sm:right-8 w-[62%] h-[56%] rounded-2xl overflow-hidden shadow-xl border-[3px] border-white z-10">
                  <img
                    src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=700"
                    alt="Students collaborating in Ignited Dreams classroom"
                    className="w-full h-full object-cover grayscale"
                  />
                </div>
                {/* Top-left card (front) */}
                <div className="absolute top-0 left-0 w-[70%] h-[68%] rounded-2xl overflow-hidden shadow-2xl border-[3px] border-white z-20">
                  <img
                    src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=700"
                    alt="Ignited Dreams professional logistics training"
                    className="w-full h-full object-cover grayscale"
                  />
                </div>
                {/* Circular seal badge overlapping corner */}
                <div className="absolute bottom-[30%] right-[22%] z-30 w-[72px] h-[72px] rounded-full bg-[#0e271d] border-[3px] border-white shadow-xl flex items-center justify-center">
                  <svg className="absolute w-full h-full animate-[spin_14s_linear_infinite]" viewBox="0 0 100 100">
                    <path id="aboutSealPath" d="M 50,50 m -34,0 a 34,34 0 1,1 68,0 a 34,34 0 1,1 -68,0" fill="none" />
                    <text fontSize="7.5" fontWeight="800" fill="#F5C400" letterSpacing="1.5">
                      <textPath href="#aboutSealPath" startOffset="0%">✦ IGNITED DREAMS ✦ EST. 2024 ✦</textPath>
                    </text>
                  </svg>
                  <span className="relative z-10 text-[#F5C400] font-black text-[10px] text-center leading-tight">ID</span>
                </div>
              </div>
            </div>

            {/* RIGHT: Description + Skill Bars + Button */}
            <div className="flex flex-col gap-7">
              {/* Description paragraph */}
              <p className="text-slate-600 text-sm sm:text-base leading-[1.65] font-normal">
                Ignited Dreams delivers industry-grade skill training in Transportation &amp; Logistics Management, SAP ERP, and Aviation Ground Operations — built on live real-world terminal simulations and active co-operative link projects. Every course runs as a live 3-hour daily session with a 7-day HD revision engine, mentored by working industry professionals.
              </p>

              {/* Skill Progress Bars - Advanced, Clean & High-Tech Aesthetic */}
              <div className="flex flex-col gap-3.5">
                {[
                  {
                    label: "Transportation & Logistics Management",
                    tag: "Multimodal Freight • Port & CFS Flow",
                    pct: 92,
                    icon: Truck,
                    color: "from-[#F5C400] via-[#ffd21f] to-[#F5C400]",
                  },
                  {
                    label: "SAP ERP for Supply Chain",
                    tag: "S/4HANA VL01N • Live ERP Terminal",
                    pct: 87,
                    icon: Cpu,
                    color: "from-[#F5C400] via-[#ffd21f] to-[#F5C400]",
                  },
                  {
                    label: "Aviation Ground Operations",
                    tag: "IATA Ramp Safety • Turnaround Protocols",
                    pct: 95,
                    icon: Plane,
                    color: "from-[#F5C400] via-[#ffd21f] to-[#F5C400]",
                  },
                ].map(({ label, tag, pct, icon: Icon, color }) => (
                  <div
                    key={label}
                    className="group relative p-3.5 sm:p-4 rounded-2xl bg-white/95 hover:bg-white border border-slate-200/80 hover:border-[#F5C400]/70 shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_28px_rgba(245,196,0,0.12)] hover:-translate-y-0.5 transition-all duration-300"
                  >
                    {/* Top Row: Icon + Title & Tag on Left, Pill Percentage on Right */}
                    <div className="flex items-center justify-between gap-3 mb-2.5">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-[#0e271d]/5 text-[#0e271d] group-hover:bg-[#F5C400] group-hover:text-[#0e271d] flex items-center justify-center shrink-0 transition-all duration-300 shadow-2xs">
                          <Icon className="w-4 h-4 stroke-[2.2]" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs sm:text-[13.5px] font-bold text-[#0e271d] tracking-tight truncate">
                            {label}
                          </h4>
                          <p className="text-[10.5px] font-medium text-slate-500 tracking-tight truncate mt-0.5">
                            {tag}
                          </p>
                        </div>
                      </div>

                      {/* High-tech percentage badge with glowing pulse dot and count up */}
                      <div className="shrink-0 flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full bg-[#0e271d] text-[#F5C400] border border-[#0e271d] shadow-xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#F5C400] animate-pulse" />
                        <span className="text-xs font-extrabold font-mono tracking-tight leading-none">
                          <CountUpNumber end={pct} suffix="%" duration={1500} />
                        </span>
                      </div>
                    </div>

                    {/* Progress Track & Fill Bar */}
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden p-[2px] shadow-inner border border-slate-200/50">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${color} relative shadow-[0_0_10px_rgba(245,196,0,0.45)] transition-all duration-700 ease-out`}
                        style={{ width: `${pct}%` }}
                      >
                        {/* Glowing white tip dot at end of progress bar */}
                        <div className="absolute right-0.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_6px_#ffffff]" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* CTA Button */}
              <div className="pt-2">
                <ArrowPillButton href="/courses">
                  Explore Curriculum
                </ArrowPillButton>
              </div>
            </div>
          </div>

          {/* EXACT "BY THE NUMBERS" STATS ROW (Matching Reference Screenshot) */}
          <div ref={pillarsHeaderRef} className="mt-20 pt-12 border-t border-[#e8f0ea]">
            <div className="mb-6">
              <span className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[#0e271d]">
                <span className="w-2 h-2 rounded-full bg-[#F5C400]" />
                By The Numbers
              </span>
            </div>

            <div ref={statsSectionRef} className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
              <div>
                <div className="text-4xl sm:text-5xl lg:text-[62px] font-extrabold text-[#0e271d] tracking-[-0.04em] leading-none">
                  <CountUpNumber end={500} suffix="+" duration={2000} />
                </div>
                <div className="text-sm font-bold text-[#0e271d] tracking-tight mt-2.5">
                  Cadets enrolled
                </div>
                <p className="text-xs text-slate-500 leading-relaxed font-normal mt-1 max-w-[220px]">
                  Trained across live logistics batches with daily supervised webcams.
                </p>
              </div>

              <div>
                <div className="text-4xl sm:text-5xl lg:text-[62px] font-extrabold text-[#0e271d] tracking-[-0.04em] leading-none">
                  <CountUpNumber end={100} suffix="%" duration={1800} />
                </div>
                <div className="text-sm font-bold text-[#0e271d] tracking-tight mt-2.5">
                  Practical Labs
                </div>
                <p className="text-xs text-slate-500 leading-relaxed font-normal mt-1 max-w-[220px]">
                  Real-time ERP terminals and live logistics casework with zero simulated fluff.
                </p>
              </div>

              <div>
                <div className="text-4xl sm:text-5xl lg:text-[62px] font-extrabold text-[#0e271d] tracking-[-0.04em] leading-none">
                  <CountUpNumber end={100} suffix="%" duration={1800} />
                </div>
                <div className="text-sm font-bold text-[#0e271d] tracking-tight mt-2.5">
                  Viva certified
                </div>
                <p className="text-xs text-slate-500 leading-relaxed font-normal mt-1 max-w-[220px]">
                  Comprehensive SAP ERP written exam and oral evaluation board.
                </p>
              </div>

              <div>
                <div className="text-4xl sm:text-5xl lg:text-[62px] font-extrabold text-[#0e271d] tracking-[-0.04em] leading-none">
                  <CountUpNumber end={16} suffix="+" duration={1600} />
                </div>
                <div className="text-sm font-bold text-[#0e271d] tracking-tight mt-2.5">
                  Years of expertise
                </div>
                <p className="text-xs text-slate-500 leading-relaxed font-normal mt-1 max-w-[220px]">
                  Deep mastery in multimodal shipping, port customs, and aviation ground ops.
                </p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* OUR PROGRAMS — Services style dark green section (reference image match) */}
      <section className="w-full bg-[#0e271d] py-20 sm:py-24 overflow-hidden">
        <div className="max-w-[1200px] mx-auto px-6 sm:px-10 lg:px-16">

          {/* Top row: pill + heading (left) | View All button (right) */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
            <div>
              <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#F5C400] mb-4">
                <span className="w-2.5 h-2.5 rounded-full bg-[#F5C400] inline-block" />
                Our Programs
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-[2.6rem] font-extrabold text-white leading-[1.18] max-w-md">
                Build Your Career<br />with Industry Expertise
              </h2>
            </div>
            <Link
              href="/courses"
              className="self-start sm:self-auto inline-flex items-center gap-2 border border-white/30 hover:border-[#F5C400] text-white hover:text-[#F5C400] text-sm font-semibold px-6 py-3 rounded-full transition-all group whitespace-nowrap"
            >
              View All Programs
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {/* 3 Program Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* Card 1: Transportation & Logistics */}
            <div className="bg-[#163a2b] border border-white/10 rounded-2xl overflow-hidden flex flex-col group hover:-translate-y-1 transition-transform duration-300">
              <div className="h-44 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=700"
                  alt="Transportation & Logistics Management"
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 scale-105 group-hover:scale-100"
                />
              </div>
              <div className="p-6 flex flex-col flex-1">
                <h3 className="text-white font-bold text-lg mb-2 leading-snug">
                  Transportation &amp; Logistics
                </h3>
                <p className="text-slate-200 text-sm leading-relaxed flex-1 font-normal">
                  Multimodal freight routing, port operations, container shipping, and customs EXIM — practical field-ready training.
                </p>
                <Link
                  href="/courses/transportation-logistics-sap"
                  className="inline-flex items-center gap-1.5 text-[#F5C400] text-xs font-bold mt-5 hover:gap-3 transition-all"
                >
                  Learn more <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Card 2: SAP ERP — FEATURED (High-Contrast Gold Bordered Card) */}
            <div className="bg-[#163a2b] border-2 border-[#F5C400] rounded-2xl overflow-hidden flex flex-col group hover:-translate-y-1 transition-transform duration-300 shadow-[0_15px_40px_rgba(245,196,0,0.15)] relative">
              <div className="h-44 overflow-hidden relative">
                <img
                  src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=700"
                  alt="SAP ERP Supply Chain Training"
                  className="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 transition-all duration-500 scale-105 group-hover:scale-100"
                />
                <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-extrabold font-mono bg-[#F5C400] text-[#0e271d] uppercase tracking-wider shadow-md">
                  FEATURED
                </span>
              </div>
              <div className="p-6 flex flex-col flex-1">
                <h3 className="text-white font-bold text-lg mb-2 leading-snug">
                  SAP ERP for Supply Chain
                </h3>
                <p className="text-slate-200 text-sm leading-relaxed flex-1 font-normal">
                  Hands-on SAP S/4HANA: Outbound Delivery (VL01N), Post Goods Issue, transfer orders &amp; ICEGATE clearance with live ERP access.
                </p>
                <Link
                  href="/courses/transportation-logistics-sap"
                  className="inline-flex items-center gap-1.5 text-[#F5C400] text-xs font-bold mt-5 hover:gap-3 transition-all"
                >
                  Learn more <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Card 3: Aviation Ground Operations */}
            <div className="bg-[#163a2b] border border-white/10 rounded-2xl overflow-hidden flex flex-col group hover:-translate-y-1 transition-transform duration-300">
              <div className="h-44 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&q=80&w=700"
                  alt="Aviation Ground Operations"
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 scale-105 group-hover:scale-100"
                />
              </div>
              <div className="p-6 flex flex-col flex-1">
                <h3 className="text-white font-bold text-lg mb-2 leading-snug">
                  Aviation Ground Operations
                </h3>
                <p className="text-slate-200 text-sm leading-relaxed flex-1 font-normal">
                  Airport ramp handling, cargo documentation, passenger services, safety protocols, and airline ground crew operations.
                </p>
                <Link
                  href="/courses/aviation-ground-operations"
                  className="inline-flex items-center gap-1.5 text-[#F5C400] text-xs font-bold mt-5 hover:gap-3 transition-all"
                >
                  Learn more <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. WHY CHOOSE SECTION (White Background - Clean Cards Grid) */}
      <section className="w-full bg-white py-20 sm:py-28 border-t border-[#e8f0ea]">
        <div className="max-w-[1240px] mx-auto px-6 sm:px-10 lg:px-16">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-14">
            <div>
              <span className="inline-flex items-center gap-2 text-[11px] sm:text-xs font-bold uppercase tracking-[0.16em] text-[#0e271d] mb-4">
                <span className="w-2 h-2 rounded-full bg-[#F5C400] inline-block" />
                Why Ignited Dreams
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-extrabold text-[#0e271d] leading-[1.12] tracking-[-0.035em] max-w-xl">
                A Proven Launchpad for Careers &amp; Communities.
              </h2>
            </div>
            <p className="text-slate-600 text-sm sm:text-base max-w-md leading-[1.65] font-normal">
              Bridging the vast divide between graduation and high-growth corporate careers with authentic execution, daily proctoring, and zero commercial mark-up.
            </p>
          </div>

          {/* 4 Feature Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1 */}
            <div className="bg-[#f8faf8] border border-[#e8f0ea] hover:border-[#F5C400] rounded-2xl p-7 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl group flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-[#0e271d] text-[#F5C400] flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                  <Briefcase className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#0e271d]/60 block mb-2">
                  FLAGSHIP CURRICULUM
                </span>
                <h3 className="text-lg font-bold text-[#0e271d] mb-3 leading-snug tracking-tight">
                  Logistics &amp; SAP ERP Execution
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed font-normal">
                  Multimodal freight routing, container port flows, customs EXIM, and hands-on SAP S/4HANA (VL01N, LT03, PGI) with exit Viva.
                </p>
              </div>
              <Link
                href="/courses/transportation-logistics-sap"
                className="inline-flex items-center gap-2 text-xs font-bold text-[#0e271d] mt-6 group-hover:text-emerald-700 transition-colors tracking-[-0.01em]"
              >
                <span>View Curriculum</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Card 2 */}
            <div className="bg-[#f8faf8] border border-[#e8f0ea] hover:border-[#F5C400] rounded-2xl p-7 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl group flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-[#0e271d] text-[#F5C400] flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                  <Shield className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#0e271d]/60 block mb-2">
                  AFFORDABILITY CHARTER
                </span>
                <h3 className="text-lg font-bold text-[#0e271d] mb-3 leading-snug tracking-tight">
                  Pure Running Cost
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed font-normal">
                  Offered at actual operational expense with zero commercial profit margin — saving 80% compared to private academies charging ₹1.25L+.
                </p>
              </div>
              <Link
                href="/checkout"
                className="inline-flex items-center gap-2 text-xs font-bold text-[#0e271d] mt-6 group-hover:text-emerald-700 transition-colors tracking-[-0.01em]"
              >
                <span>Check Admission</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Card 3 */}
            <div className="bg-[#f8faf8] border border-[#e8f0ea] hover:border-[#F5C400] rounded-2xl p-7 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl group flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-[#0e271d] text-[#F5C400] flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                  <Sprout className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#0e271d]/60 block mb-2">
                  CLOSED-LOOP ECOSYSTEM
                </span>
                <h3 className="text-lg font-bold text-[#0e271d] mb-3 leading-snug tracking-tight">
                  3 Integrated Pillars
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed font-normal">
                  Career Academy paired with non-profit micro-FMCG manufacturing (toffees/chocolates) and village vegetable self-reliance societies.
                </p>
              </div>
              <Link
                href="/about"
                className="inline-flex items-center gap-2 text-xs font-bold text-[#0e271d] mt-6 group-hover:text-emerald-700 transition-colors tracking-[-0.01em]"
              >
                <span>Explore Ecosystem</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Card 4 */}
            <div className="bg-[#f8faf8] border border-[#e8f0ea] hover:border-[#F5C400] rounded-2xl p-7 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl group flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-[#0e271d] text-[#F5C400] flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                  <Video className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#0e271d]/60 block mb-2">
                  DAILY MONITORING
                </span>
                <h3 className="text-lg font-bold text-[#0e271d] mb-3 leading-snug tracking-tight">
                  Webcam Proctoring &amp; Viva
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed font-normal">
                  Daily 3-hour live sessions with webcam attendance verification, weekly synthesis reports, and final oral Viva board examination.
                </p>
              </div>
              <Link
                href="/live-classes"
                className="inline-flex items-center gap-2 text-xs font-bold text-[#0e271d] mt-6 group-hover:text-emerald-700 transition-colors tracking-[-0.01em]"
              >
                <span>Live Classroom</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 4. CURRICULUM ARCHITECTURE / PROGRESSION (Dark Green Background) */}
      <section className="w-full bg-[#0e271d] py-20 sm:py-28 border-t border-[#163a2b]">
        <div className="max-w-[1240px] mx-auto px-6 sm:px-10 lg:px-16">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-14">
            <div>
              <span className="inline-flex items-center gap-2 text-[11px] sm:text-xs font-bold uppercase tracking-[0.16em] text-[#F5C400] mb-4">
                <span className="w-2.5 h-2.5 rounded-full bg-[#F5C400] inline-block" />
                6-Month Progression Pathway
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-extrabold text-white leading-[1.12] tracking-[-0.035em] max-w-xl">
                From Core Logistics to Enterprise SAP Execution.
              </h2>
            </div>
            <Link
              href="/courses"
              className="self-start sm:self-auto inline-flex items-center gap-2 border border-white/30 hover:border-[#F5C400] text-white hover:text-[#F5C400] text-xs sm:text-sm font-bold px-6 py-3 rounded-full transition-all group whitespace-nowrap tracking-[-0.01em]"
            >
              <span>View All Modules</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {/* 2 Stage Progression Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Stage 1 Card */}
            <div className="bg-[#163a2b] border border-white/10 rounded-2xl p-8 sm:p-10 flex flex-col justify-between hover:border-white/20 transition-all">
              <div>
                <div className="flex items-center justify-between gap-4 mb-6">
                  <span className="px-3 py-1 rounded-full text-xs font-bold font-mono bg-white/10 text-[#F5C400] uppercase tracking-wider">
                    MONTH 01 – MONTH 03
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white">
                    <Layers className="w-5 h-5" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-white mb-6">
                  Stage 1: Foundation &amp; Field Operations
                </h3>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3.5">
                    <CheckCircle2 className="w-5 h-5 text-[#F5C400] shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white text-sm block">Multimodal Freight &amp; Shipping Lines</strong>
                      <p className="text-slate-200 text-xs sm:text-sm mt-0.5 leading-relaxed font-normal">
                        Ocean freight, containerization, Incoterms 2020, and air cargo handling standards.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3.5">
                    <CheckCircle2 className="w-5 h-5 text-[#F5C400] shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white text-sm block">Port &amp; Customs Clearance (ICEGATE)</strong>
                      <p className="text-slate-200 text-xs sm:text-sm mt-0.5 leading-relaxed font-normal">
                        Bill of Lading (B/L), Airway Bills (AWB), customs appraisal, and bonded warehousing flow.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3.5">
                    <CheckCircle2 className="w-5 h-5 text-[#F5C400] shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white text-sm block">English Soft Skills &amp; Corporate Etiquette</strong>
                      <p className="text-slate-200 text-xs sm:text-sm mt-0.5 leading-relaxed font-normal">
                        Daily spoken business communication, client emailing, and professional presentation confidence.
                      </p>
                    </div>
                  </li>
                </ul>
              </div>
              <div className="pt-6 mt-8 border-t border-white/10 flex items-center justify-between text-xs text-slate-300 font-medium">
                <span>Phase 1 Completion</span>
                <span className="text-[#F5C400] font-bold">Written Domain Viva</span>
              </div>
            </div>

            {/* Stage 2 Card (Featured with Lime Border) */}
            <div className="bg-[#163a2b] border-2 border-[#F5C400]/60 rounded-2xl p-8 sm:p-10 flex flex-col justify-between shadow-[0_15px_45px_rgba(245,196,0,0.15)] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#F5C400]/10 rounded-full blur-2xl pointer-events-none" />
              <div>
                <div className="flex items-center justify-between gap-4 mb-6">
                  <span className="px-3.5 py-1 rounded-full text-xs font-black font-mono bg-[#F5C400] text-[#0e271d] uppercase tracking-wider">
                    MONTH 04 – MONTH 06
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-[#F5C400]/20 border border-[#F5C400]/40 flex items-center justify-center text-[#F5C400]">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-white mb-6">
                  Stage 2: Enterprise SAP ERP &amp; Board Viva
                </h3>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3.5">
                    <CheckCircle2 className="w-5 h-5 text-[#F5C400] shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white text-sm block">Live SAP S/4HANA Logistics Execution</strong>
                      <p className="text-slate-200 text-xs sm:text-sm mt-0.5 leading-relaxed font-normal">
                        Hands-on transaction codes: VL01N (Outbound Delivery), LT03 (Transfer Order), and PGI posting.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3.5">
                    <CheckCircle2 className="w-5 h-5 text-[#F5C400] shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white text-sm block">Weekly Synthesis Projects &amp; Case Studies</strong>
                      <p className="text-slate-200 text-xs sm:text-sm mt-0.5 leading-relaxed font-normal">
                        Weekend project submissions in written report and oral presentation format evaluated by mentors.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3.5">
                    <CheckCircle2 className="w-5 h-5 text-[#F5C400] shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white text-sm block">SAP Online Written Exam &amp; Board VIVA</strong>
                      <p className="text-slate-200 text-xs sm:text-sm mt-0.5 leading-relaxed font-normal">
                        Comprehensive written test on ERP systems + oral interview board for English and domain mastery.
                      </p>
                    </div>
                  </li>
                </ul>
              </div>
              <div className="pt-6 mt-8 border-t border-white/10 flex items-center justify-between text-xs text-slate-300 font-medium">
                <span>Phase 2 Exit</span>
                <span className="text-[#F5C400] font-bold">Oral Board &amp; ERP Certified</span>
              </div>
            </div>
          </div>

          {/* Bottom Highlights strip */}
          <div className="mt-12 p-6 rounded-2xl bg-white/5 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-[#F5C400] animate-pulse shrink-0" />
              <span className="text-sm font-semibold text-white">
                50-Student Cohorts • 1 Master Mentor + 2 Specialized Trainers • Daily 3-Hour Monitored Sessions
              </span>
            </div>
            <Link
              href="/checkout"
              className="inline-flex items-center gap-2 text-xs font-bold text-[#F5C400] hover:underline"
            >
              <span>Enroll for Next Batch</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>


      {/* 6. HOW ACADEMY LEARNING WORKS (Dark Green Background) */}
      <section ref={stepsRef} className="w-full bg-[#0e271d] py-20 sm:py-28 border-t border-[#163a2b]">
        <div className="max-w-[1240px] mx-auto px-6 sm:px-10 lg:px-16">
          <div ref={stepsHeaderRef} className="text-center max-w-2xl mx-auto mb-16">
            <span className="inline-flex items-center gap-2 text-[11px] sm:text-xs font-bold uppercase tracking-[0.16em] text-[#F5C400] mb-4">
              <span className="w-2.5 h-2.5 rounded-full bg-[#F5C400] inline-block" />
              Skill Training Roadmap
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-extrabold text-white leading-[1.12] tracking-[-0.035em]">
              How Academy Learning Works.
            </h2>
            <p className="text-slate-200 text-sm sm:text-base mt-3 leading-[1.65] font-normal">
              A structured, career-focused pedagogy designed to take you from foundational concepts to exam and corporate mastery.
            </p>
          </div>

          {/* 6 Steps Grid */}
          <div ref={stepsGridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.number}
                  className="bg-[#163a2b] border border-white/10 hover:border-[#F5C400]/50 rounded-2xl p-7 transition-all duration-300 hover:-translate-y-1.5 group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <span className="text-3xl font-extrabold text-[#F5C400] font-mono tracking-tighter">
                        {step.number}
                      </span>
                      <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white group-hover:text-[#F5C400] transition-colors">
                        <Icon className="w-5 h-5" />
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2 leading-snug tracking-tight">
                      {step.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal">
                      {step.desc}
                    </p>
                  </div>
                  <div className="pt-4 mt-6 border-t border-white/10 flex items-center justify-between text-[11px] font-semibold text-slate-300">
                    <span className="uppercase tracking-[0.12em]">Phase {step.number}</span>
                    <span className="text-[#F5C400] font-bold">
                      {step.highlight}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 7. LEADERSHIP MESSAGES (White Background - two cards: Chairman left, CEO right) */}
      <section className="w-full bg-white pt-16 sm:pt-20 pb-10 sm:pb-12 border-t border-[#e8f0ea]">
        <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-10">
          <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12 space-y-3">
            <span className="inline-flex items-center gap-2 text-[11px] sm:text-xs font-bold uppercase tracking-[0.16em] text-[#0e271d]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#F5C400] inline-block" />
              Leadership Messages
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-extrabold text-[#0e271d] leading-[1.12] tracking-[-0.035em]">
              A Word From Our Leadership
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-stretch">
            {LEADERSHIP_MESSAGES.map((leader) => (
              <article
                key={leader.role}
                className="relative flex flex-col h-full overflow-hidden rounded-[28px] bg-[#f8faf8] border border-[#e3ece5] p-6 sm:p-8 transition-shadow duration-300 hover:shadow-[0_24px_60px_-24px_rgba(14,39,29,0.25)]"
              >
                {/* Gold accent bar */}
                <span className="absolute top-0 left-10 right-10 h-1 rounded-b-full bg-gradient-to-r from-[#D9A900] via-[#F5C400] to-[#D9A900]" />

                {/* Large decorative quote mark */}
                <svg
                  aria-hidden="true"
                  viewBox="0 0 64 48"
                  className="absolute top-6 right-6 w-12 sm:w-16 text-[#F5C400]/25"
                  fill="currentColor"
                >
                  <path d="M0 48V28.8C0 12.4 8.6 2.8 25.8 0l2.4 6.4C19.4 8.6 15 13.6 14.6 21.6H26V48H0Zm38 0V28.8C38 12.4 46.6 2.8 63.8 0l2.4 6.4C57.4 8.6 53 13.6 52.6 21.6H64V48H38Z" />
                </svg>

                {/* Header: portrait + name */}
                <div className="flex items-center gap-5 sm:gap-6">
                  <div className="relative shrink-0">
                    <img
                      src={leader.photo}
                      alt={`${leader.name}, ${leader.role} of Ignited Dreams`}
                      className="w-32 h-40 sm:w-40 sm:h-48 rounded-2xl object-cover ring-4 ring-white shadow-lg"
                      style={{ objectPosition: leader.photoPosition }}
                    />
                  </div>
                  <div className="min-w-0">
                    <span className="inline-block rounded-full bg-[#0e271d] px-3 py-1 text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.16em] text-[#F5C400]">
                      {leader.role}
                    </span>
                    <h3 className="mt-3 text-xl sm:text-2xl font-extrabold text-[#0e271d] tracking-[-0.02em] leading-tight">
                      {leader.name}
                    </h3>
                    <p className="text-sm text-slate-500 font-medium">Ignited Dreams</p>
                  </div>
                </div>

                {/* Message */}
                {/* Body as one flowing paragraph; the closing wish stays on its own line */}
                <div className="mt-6 space-y-3 text-[15px] sm:text-base text-slate-700 leading-[1.65]">
                  <p>{leader.message.slice(0, -1).join(" ")}</p>
                  <p>{leader.message[leader.message.length - 1]}</p>
                </div>

                {/* Signature, pinned to the bottom so both cards line up */}
                <div className="mt-auto pt-5">
                  <div className="flex items-center gap-4 border-t border-[#e3ece5] pt-4">
                    <span className="h-10 w-1 rounded-full bg-[#F5C400]" />
                    <div className="leading-tight">
                      <p className="text-sm italic text-slate-500">With best wishes,</p>
                      <p className="mt-1 font-extrabold text-[#0e271d]">{leader.name}</p>
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#0e271d]/60">
                        {leader.role}, Ignited Dreams
                      </p>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* IN MEMORIAM (quiet tribute after the leadership messages) */}
      <section
        className="relative w-full overflow-hidden border-t border-[#ece6d6] py-10 sm:py-12"
        style={{
          background:
            "radial-gradient(ellipse 60% 70% at 50% 45%, #fffdf7 0%, #faf6ec 55%, #f4efe2 100%)",
        }}
      >
        {/* Side decoration: gold line-art sprigs and sparkles (hidden on small screens) */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 hidden md:block">
          <MemorialSprig className="absolute left-[6%] lg:left-[12%] top-1/2 -translate-y-1/2 -rotate-12 w-40 lg:w-48 text-[#C9A227]/45" />
          <MemorialSprig className="absolute right-[6%] lg:right-[12%] top-1/2 -translate-y-1/2 rotate-12 -scale-x-100 w-40 lg:w-48 text-[#C9A227]/45" />
          <Sparkle className="absolute left-[24%] top-[22%] w-3 text-[#D9A900]/50" />
          <Sparkle className="absolute left-[30%] bottom-[24%] w-2 text-[#D9A900]/40" />
          <Sparkle className="absolute left-[4%] top-[18%] w-2.5 text-[#D9A900]/35" />
          <Sparkle className="absolute right-[25%] top-[30%] w-2.5 text-[#D9A900]/45" />
          <Sparkle className="absolute right-[30%] bottom-[20%] w-3 text-[#D9A900]/40" />
          <Sparkle className="absolute right-[5%] bottom-[16%] w-2 text-[#D9A900]/35" />
        </div>

        <div className="relative max-w-[720px] mx-auto px-6 flex flex-col items-center text-center">
          {/* Arch-framed flower with an offset gold outline */}
          <div className="relative">
            <span
              aria-hidden="true"
              className="absolute -inset-3 sm:-inset-4 rounded-t-[108px] sm:rounded-t-[128px] rounded-b-[30px] border border-[#D9A900]/45"
            />
            <img
              src="/images/memorial/christa-rose.jpg"
              alt="A white Christmas rose in bloom"
              className="relative w-48 h-60 sm:w-56 sm:h-72 rounded-t-[96px] sm:rounded-t-[112px] rounded-b-[20px] object-cover shadow-[0_30px_60px_-28px_rgba(60,45,10,0.45)]"
              style={{ objectPosition: "46% 40%" }}
            />
          </div>

          <p
            className="mt-8 sm:mt-9 text-lg sm:text-xl italic text-[#7a6f58] tracking-wide"
            style={{ fontFamily: "var(--font-serif), Georgia, serif" }}
          >
            In memory of our beloved
          </p>
          <h2
            className="mt-2 text-[40px] sm:text-[56px] leading-none font-medium text-[#0e271d]"
            style={{ fontFamily: "var(--font-serif), Georgia, serif" }}
          >
            Christa Rose Dias
          </h2>

          <div className="mt-4 flex items-center gap-3 text-[#D9A900]" aria-hidden="true">
            <span className="h-px w-16 sm:w-24 bg-gradient-to-r from-transparent to-[#D9A900]/70" />
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
              <path d="M12 2c.6 3.9 2.1 5.4 6 6-3.9.6-5.4 2.1-6 6-.6-3.9-2.1-5.4-6-6 3.9-.6 5.4-2.1 6-6Z" />
            </svg>
            <span className="h-px w-16 sm:w-24 bg-gradient-to-l from-transparent to-[#D9A900]/70" />
          </div>
        </div>
      </section>

      {/* 8. FREQUENTLY ASKED QUESTIONS (Dark Green Background) */}
      <section ref={faqRef} className="w-full bg-[#0e271d] py-20 sm:py-28 border-t border-[#163a2b]">
        <div className="max-w-[1040px] mx-auto px-6 sm:px-10 lg:px-16">
          <div ref={faqHeaderRef} className="text-center max-w-2xl mx-auto mb-14">
            <span className="inline-flex items-center gap-2 text-[11px] sm:text-xs font-bold uppercase tracking-[0.16em] text-[#F5C400] mb-4">
              <span className="w-2.5 h-2.5 rounded-full bg-[#F5C400] inline-block" />
              Got Questions?
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-extrabold text-white leading-[1.12] tracking-[-0.035em]">
              Frequently Asked Questions.
            </h2>
            <p className="text-slate-200 text-sm sm:text-base mt-3 leading-[1.65] font-normal">
              Everything you need to know about our running cost structure, daily 3-hour live sessions, and the 7-day replay engine.
            </p>
          </div>

          <div ref={faqListRef}>
            <FaqAccordion items={faqs} />
          </div>
        </div>
      </section>

      {/* 9. ENROLLMENT CTA BANNER (Vibrant Lime Green Background) */}
      <section ref={ctaRef} className="w-full bg-[#F5C400] py-16 sm:py-20 text-[#0e271d] relative overflow-hidden">
        <div className="max-w-[1240px] mx-auto px-6 sm:px-10 lg:px-16 relative z-10">
          <div ref={ctaCardRef} className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12">
            
            <div className="space-y-4 max-w-2xl text-center lg:text-left">
              <span className="inline-flex items-center gap-2 text-[11px] sm:text-xs font-bold uppercase tracking-[0.16em] text-[#0e271d] bg-black/10 px-3.5 py-1.5 rounded-full">
                <span className="w-2 h-2 rounded-full bg-[#0e271d]" />
                ADMISSION OPEN FOR NEXT COHORT
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-[46px] font-extrabold leading-[1.1] text-[#0e271d] tracking-[-0.035em]">
                Ready to Master Logistics &amp; SAP ERP at Running Cost?
              </h2>
              <p className="text-[#0e271d]/80 text-sm sm:text-base leading-[1.65] font-normal">
                Join our 50-student cohorts with 1 Master Mentor + 2 Specialized Trainers, daily 3-hour live sessions, webcam supervision, and guaranteed 7-day revision engine.
              </p>
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2 text-xs font-bold text-[#0e271d]/90 tracking-tight">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#0e271d]" /> Daily 3h Monitored Sessions
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#0e271d]" /> Live SAP S/4HANA
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#0e271d]" /> Final Board Viva Exit
                </span>
              </div>
            </div>

            <div className="flex flex-col items-center sm:items-end gap-3 shrink-0">
              <ArrowPillButton
                href="/courses"
                className="text-sm sm:text-base py-4 px-8"
              >
                Enroll Now
              </ArrowPillButton>
              <span className="text-xs font-semibold text-[#0e271d]/70 tracking-tight">
                Limited Seats • 50 Students / Batch
              </span>
            </div>

          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
