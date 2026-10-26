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

export default function PublicRecordingsRedirectPage() {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      router.replace("/student/recordings");
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
              Class Recordings Vault
            </h1>

            <p className="text-sm text-slate-600 mt-3 leading-relaxed">
              Live sessions and 7-Day HD class recordings are accessible exclusively inside the authenticated Cadet Portal for enrolled students.
            </p>

            <div className="my-6 p-4 rounded-xl bg-slate-50 border border-slate-200 text-left text-xs space-y-2.5 text-slate-700">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Enrolled batch cadets get automatic 7-day replay &amp; MP4 downloads</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Secure access protected by individual candidate registration number</span>
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
