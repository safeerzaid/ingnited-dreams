"use client";

import React, { useState } from "react";
import api from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

const inputClass = "w-full px-3 py-2 rounded-lg border border-aviation-border text-sm bg-white";
const labelClass = "block text-xs font-bold text-aviation-charcoal uppercase tracking-wider mb-1";

export default function ChangePasswordForm() {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    if (newPassword !== confirm) {
      setMessage({ ok: false, text: "New passwords do not match." });
      return;
    }
    setSaving(true);
    try {
      await api.post("/auth/change-password", { currentPassword, newPassword });
      setMessage({ ok: true, text: "Password changed successfully." });
      setCurrentPassword("");
      setNewPassword("");
      setConfirm("");
    } catch (err) {
      setMessage({ ok: false, text: err instanceof Error ? err.message : "Could not change password" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-xl">
      <div className="border-b border-aviation-border pb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-aviation-black tracking-tight font-heading">My Account</h1>
        <p className="text-xs sm:text-sm text-aviation-muted mt-1">
          {user?.name} · {user?.email}
        </p>
      </div>

      <Card padding="lg" variant="default">
        <form onSubmit={handleSubmit} className="space-y-4">
          <h2 className="text-base font-bold text-aviation-black">Change Password</h2>
          <div>
            <label className={labelClass}>Current Password</label>
            <input type="password" required value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className={inputClass} autoComplete="current-password" />
          </div>
          <div>
            <label className={labelClass}>New Password</label>
            <input
              type="password"
              required
              minLength={8}
              pattern="(?=.*[A-Z])(?=.*[0-9]).{8,}"
              title="At least 8 characters with one uppercase letter and one number"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className={inputClass}
              autoComplete="new-password"
            />
          </div>
          <div>
            <label className={labelClass}>Confirm New Password</label>
            <input type="password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} className={inputClass} autoComplete="new-password" />
          </div>
          {message && (
            <p className={`text-xs rounded-lg p-3 border ${message.ok ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-red-50 border-red-200 text-red-700"}`}>
              {message.text}
            </p>
          )}
          <Button type="submit" variant="primary" isLoading={saving}>
            Update Password
          </Button>
        </form>
      </Card>
    </div>
  );
}
