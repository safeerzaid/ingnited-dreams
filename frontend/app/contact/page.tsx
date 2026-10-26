"use client";

import React, { useState, useEffect, useRef } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import CustomSelect from "@/components/ui/Select";
import api from "@/lib/api";
import type { PublicCourse } from "@/lib/types";
import { Mail, Phone, MapPin, Send, CheckCircle2, GraduationCap } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function ContactPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const infoRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    courseOfInterest: "General enquiry",
    message: "",
  });
  const [courseOptions, setCourseOptions] = useState([{ value: "General enquiry", label: "General enquiry" }]);
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<PublicCourse[]>("/public/courses")
      .then((courses) =>
        setCourseOptions([
          { value: "General enquiry", label: "General enquiry" },
          ...courses.map((c) => ({ value: c.title, label: c.title })),
        ])
      )
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSendError(null);
    setIsSending(true);
    try {
      await api.post("/public/contact", {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        subject: formData.courseOfInterest,
        message: formData.message,
      });
      setSubmitted(true);
      setFormData({ name: "", email: "", phone: "", courseOfInterest: "General enquiry", message: "" });
    } catch (err) {
      setSendError(err instanceof Error ? err.message : "Could not send your message. Please call us instead.");
    } finally {
      setIsSending(false);
    }
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      if (headerRef.current) {
        gsap.fromTo(
          headerRef.current.children,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.8, stagger: 0.15, ease: "power2.out" }
        );
      }
      if (infoRef.current) {
        gsap.fromTo(
          infoRef.current.children,
          { opacity: 0, x: -30 },
          {
            opacity: 1,
            x: 0,
            duration: 0.8,
            stagger: 0.12,
            ease: "power2.out",
            scrollTrigger: {
              trigger: infoRef.current,
              start: "top 85%",
            },
          }
        );
      }
      if (formRef.current) {
        gsap.fromTo(
          formRef.current,
          { opacity: 0, y: 40, scale: 0.98 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.85,
            ease: "power2.out",
            scrollTrigger: {
              trigger: formRef.current,
              start: "top 85%",
            },
          }
        );
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <section className="py-16 bg-aviation-offWhite border-b border-aviation-border">
        <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8">
          <div ref={headerRef} className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-aviation-yellow/15 border border-aviation-yellow/40 text-xs font-bold uppercase tracking-wider text-[#9E7300] mb-3">
              <GraduationCap className="w-3.5 h-3.5 text-aviation-yellow" />
              <span>Admissions & Counseling</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-semibold text-aviation-black tracking-tight font-heading leading-[1.25] sm:leading-[1.2]">
              Contact Skill Academy
            </h1>
            <p className="text-base text-aviation-muted mt-3">
              Have questions about course schedules, live classroom requirements, fees or batch enrollment? Connect with our academic counselors.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white flex-1">
        <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Contact Information */}
            <div ref={infoRef} className="lg:col-span-5 space-y-6">
              <h2 className="text-2xl font-semibold text-aviation-black font-heading">
                Admissions & Student Support
              </h2>
              <p className="text-sm text-aviation-muted leading-relaxed">
                Our career counselors and student coordinators are available Monday through Saturday to assist with admissions, curriculum advice, and portal access.
              </p>

              <div className="space-y-4 pt-4">
                <Card padding="md" variant="default" className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-aviation-offWhite text-aviation-black flex items-center justify-center shrink-0 border border-aviation-border">
                    <Mail className="w-5 h-5 text-aviation-yellowDeep" />
                  </div>
                  <div>
                    <div className="text-xs text-aviation-muted uppercase font-bold tracking-wider">
                      Admissions Email
                    </div>
                    <div className="text-sm font-bold text-aviation-black">
                      admissions@igniteddreams.com
                    </div>
                  </div>
                </Card>

                <Card padding="md" variant="default" className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-aviation-offWhite text-aviation-black flex items-center justify-center shrink-0 border border-aviation-border">
                    <Phone className="w-5 h-5 text-aviation-yellowDeep" />
                  </div>
                  <div>
                    <div className="text-xs text-aviation-muted uppercase font-bold tracking-wider">
                      Helpline & WhatsApp
                    </div>
                    <div className="text-sm font-bold text-aviation-black">
                      +91 98765 43210
                    </div>
                  </div>
                </Card>

                <Card padding="md" variant="default" className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-aviation-offWhite text-aviation-black flex items-center justify-center shrink-0 border border-aviation-border">
                    <MapPin className="w-5 h-5 text-aviation-yellowDeep" />
                  </div>
                  <div>
                    <div className="text-xs text-aviation-muted uppercase font-bold tracking-wider">
                      Academy Campus
                    </div>
                    <div className="text-sm font-bold text-aviation-black">
                      Professional Learning Hub, Bengaluru / New Delhi, India
                    </div>
                  </div>
                </Card>
              </div>
            </div>

            {/* Inquiry Form */}
            <div ref={formRef} className="lg:col-span-7">
              <Card padding="lg" variant="default" className="border-2 border-aviation-border">
                {submitted ? (
                  <div className="text-center py-12 space-y-4">
                    <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <h3 className="text-2xl font-semibold text-aviation-black font-heading">
                      Inquiry Received
                    </h3>
                    <p className="text-sm text-aviation-muted max-w-md mx-auto">
                      Thank you for contacting IgnitedDreams Skill Academy. An academic counselor will review your message and reach out shortly.
                    </p>
                    <Button variant="outline" size="sm" onClick={() => setSubmitted(false)}>
                      Send Another Inquiry
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <h3 className="text-xl font-semibold text-aviation-black font-heading mb-4">
                      Submit Course Inquiry
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-aviation-charcoal uppercase tracking-wider mb-1.5">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="Your Full Name"
                          className="w-full px-3.5 py-2.5 rounded-lg border border-aviation-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-aviation-yellow focus:border-transparent transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-aviation-charcoal uppercase tracking-wider mb-1.5">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="student@example.com"
                          className="w-full px-3.5 py-2.5 rounded-lg border border-aviation-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-aviation-yellow focus:border-transparent transition-all"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-aviation-charcoal uppercase tracking-wider mb-1.5">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="+91 90000 00000"
                          className="w-full px-3.5 py-2.5 rounded-lg border border-aviation-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-aviation-yellow focus:border-transparent transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-aviation-charcoal uppercase tracking-wider mb-1.5">
                          Course of Interest
                        </label>
                        <CustomSelect
                          options={courseOptions}
                          value={formData.courseOfInterest}
                          onChange={(val) => setFormData({ ...formData, courseOfInterest: val })}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-aviation-charcoal uppercase tracking-wider mb-1.5">
                        Message / Query *
                      </label>
                      <textarea
                        required
                        rows={4}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder="Your question, preferred batch timing, or anything else we should know..."
                        className="w-full px-3.5 py-2.5 rounded-lg border border-aviation-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-aviation-yellow focus:border-transparent transition-all"
                      />
                    </div>

                    {sendError && (
                      <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">{sendError}</p>
                    )}

                    <Button type="submit" variant="primary" size="lg" className="w-full" isLoading={isSending} rightIcon={<Send className="w-4 h-4" />}>
                      Submit Course Inquiry
                    </Button>
                  </form>
                )}
              </Card>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
