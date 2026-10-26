"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ArrowRight, CheckCircle2, Lock, LogIn, ShieldCheck } from "lucide-react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { useAuth } from "@/lib/auth-context";

export default function PublicLiveClassesRedirectPage() {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      router.replace("/student/dashboard");
    }
  }, [user, router]);

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F7F4]">
      <Navbar />
      <main className="flex-1 flex items-center justify-center py-16 px-4 sm:px-6">
        <div className="max-w-lg w-full">
          <Card padding="lg" variant="default" className="border-2 border-slate-200 shadow-xl bg-white text-center">
            <div className="w-16 h-16 rounded-full bg-[#0e271d] text-[#F5C400] flex items-center justify-center mx-auto mb-4 shadow-md">
              <Lock className="w-8 h-8" />
            </div>

            <Badge variant="yellow" size="sm" className="mb-3">
              Enrolled Cadet Portal Only
            </Badge>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0e271d] font-heading tracking-tight">
              Monitored Live Classroom
            </h1>

            <p className="text-sm text-slate-600 mt-3 leading-relaxed">
              Interactive WebRTC live classrooms and daily faculty sessions are conducted directly inside the portal for enrolled students with webcam verification.
            </p>

            <div className="my-6 p-4 rounded-xl bg-slate-50 border border-slate-200 text-left text-xs space-y-2.5 text-slate-700">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>3 Hours Daily Live Class (2h Lecture + 1h Doubt Resolution)</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Dual-monitored camera session with instant LiveKit connection</span>
              </div>
            </div>

            <div className="space-y-2.5 pt-2 border-t border-slate-100">
              <Link href="/login" className="block w-full">
                <Button variant="outline" size="md" className="w-full font-bold justify-center" leftIcon={<LogIn className="w-4 h-4" />}>
                  Log In to Student Portal
                </Button>
              </Link>
              <Link href="/courses" className="block w-full">
                <Button variant="primary" size="md" className="w-full font-bold justify-center" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Enroll &amp; Pay Course Fee Online
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
