"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { useAuth } from "@/lib/auth-context";
import { GraduationCap, ArrowRight, Lock, Mail, User, Phone, AlertCircle } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await register(formData);
      router.push("/student/dashboard");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Registration failed";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <div className="flex-1 flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8 bg-aviation-offWhite relative">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-xl bg-aviation-black text-aviation-yellow flex items-center justify-center mx-auto shadow-sm">
              <GraduationCap className="w-6 h-6 text-aviation-yellow" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-aviation-black tracking-tight font-heading">
              Student Registration
            </h1>
            <p className="text-xs text-aviation-muted">
              Create your student account to enroll in Logistics, SAP ERP &amp; Aviation programs and access live classes and 7-day recordings.
            </p>
          </div>

          <Card padding="lg" variant="default" className="shadow-card">
            {error && (
              <div className="mb-5 p-3.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-aviation-charcoal uppercase tracking-wider mb-1.5">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-aviation-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Rahul Sharma"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-lg border border-aviation-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-aviation-yellow focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-aviation-charcoal uppercase tracking-wider mb-1.5">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-aviation-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="student@example.com"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-lg border border-aviation-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-aviation-yellow focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-aviation-charcoal uppercase tracking-wider mb-1.5">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-aviation-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98765 00000"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-lg border border-aviation-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-aviation-yellow focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-aviation-charcoal uppercase tracking-wider mb-1.5">
                  Create Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-aviation-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Minimum 8 characters (1 uppercase, 1 number)"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-lg border border-aviation-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-aviation-yellow focus:border-transparent transition-all"
                  />
                </div>
                <p className="text-[11px] text-aviation-muted mt-1">
                  Must include at least 1 uppercase letter and 1 numeric digit.
                </p>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full"
                  isLoading={isLoading}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Complete Registration
                </Button>
              </div>
            </form>

            <div className="mt-6 pt-4 border-t border-aviation-border text-center text-xs text-aviation-muted">
              Already registered?{" "}
              <Link href="/login" className="font-bold text-aviation-black hover:underline">
                Sign In
              </Link>
            </div>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}
