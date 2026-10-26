"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import api from "@/lib/api";
import { KeyRound, Lock, AlertCircle, CheckCircle2 } from "lucide-react";

const inputClass =
  "w-full pl-10 pr-3.5 py-2.5 rounded-lg border border-aviation-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-aviation-yellow";

function ResetPasswordContent() {
  const token = useSearchParams().get("token") || "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setIsLoading(true);
    try {
      await api.post("/auth/reset-password", { token, newPassword: password });
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not reset password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card padding="lg" variant="default" className="shadow-card">
      {!token ? (
        <p className="text-sm text-slate-700 text-center">
          This reset link is incomplete.{" "}
          <Link href="/forgot-password" className="font-bold underline">
            Request a new one
          </Link>
          .
        </p>
      ) : done ? (
        <div className="text-center space-y-3">
          <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
          <p className="text-sm text-slate-700">Your password has been updated.</p>
          <Link href="/login" className="block">
            <Button variant="primary" className="w-full">
              Log in
            </Button>
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
            <Lock className="w-4 h-4 text-aviation-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              required
              minLength={8}
              pattern="(?=.*[A-Z])(?=.*[0-9]).{8,}"
              title="At least 8 characters with one uppercase letter and one number"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="New password"
              className={inputClass}
              autoComplete="new-password"
            />
          </div>
          <div className="relative">
            <Lock className="w-4 h-4 text-aviation-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Confirm new password"
              className={inputClass}
              autoComplete="new-password"
            />
          </div>
          <p className="text-[11px] text-slate-500">8+ characters, at least 1 uppercase letter and 1 number.</p>
          <Button type="submit" variant="primary" size="lg" className="w-full" isLoading={isLoading}>
            Set New Password
          </Button>
        </form>
      )}
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <div className="flex-1 flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8 bg-aviation-offWhite">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-xl bg-aviation-black text-aviation-yellow flex items-center justify-center mx-auto shadow-sm">
              <KeyRound className="w-6 h-6" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-aviation-black tracking-tight font-heading">
              Choose a New Password
            </h1>
          </div>
          <React.Suspense fallback={null}>
            <ResetPasswordContent />
          </React.Suspense>
        </div>
      </div>
      <Footer />
    </div>
  );
}
