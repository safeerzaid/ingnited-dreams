"use client";

import React, { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import api from "@/lib/api";
import { KeyRound, Mail, AlertCircle, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await api.post("/auth/forgot-password", { email });
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send reset link");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <div className="flex-1 flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8 bg-aviation-offWhite">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-xl bg-aviation-black text-aviation-yellow flex items-center justify-center mx-auto shadow-sm">
              <KeyRound className="w-6 h-6" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-aviation-black tracking-tight font-heading">Reset Password</h1>
            <p className="text-xs text-slate-500">Enter your account email and we&apos;ll send you a link to choose a new password.</p>
          </div>

          <Card padding="lg" variant="default" className="shadow-card">
            {sent ? (
              <div className="text-center space-y-3">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <p className="text-sm text-slate-700">
                  If an account exists for <strong>{email}</strong>, a reset link is on its way. The link is valid for 1 hour.
                </p>
                <Link href="/login" className="text-xs font-bold text-aviation-black hover:underline">
                  Back to login
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}
                <div className="relative">
                  <Mail className="w-4 h-4 text-aviation-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-lg border border-aviation-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-aviation-yellow"
                  />
                </div>
                <Button type="submit" variant="primary" size="lg" className="w-full" isLoading={isLoading}>
                  Send Reset Link
                </Button>
                <p className="text-center text-xs text-aviation-muted">
                  Remembered it?{" "}
                  <Link href="/login" className="font-bold text-aviation-black hover:underline">
                    Log in
                  </Link>
                </p>
              </form>
            )}
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
}
