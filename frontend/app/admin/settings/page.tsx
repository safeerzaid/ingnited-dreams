"use client";

import React, { useState, useEffect } from "react";
import api from "@/lib/api";
import LoadErrorBanner from "@/components/ui/LoadErrorBanner";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { Settings, Save, Clock, ShieldCheck, CheckCircle2 } from "lucide-react";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({
    academyName: "IgnitedDreams Skill Academy",
    academyTimezone: "Asia/Kolkata",
    recordingRetentionDays: 7,
    classJoinWindowMinutes: 15,
    defaultRecordingEnabled: true,
    downloadEnabled: true,
  });

  const [loading, setLoading] = useState(true);

  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get<Record<string, string>>("/admin/settings");
        if (res) {
          setSettings({
            academyName: res.academyName || "IgnitedDreams Skill Academy",
            academyTimezone: res.academyTimezone || "Asia/Kolkata",
            recordingRetentionDays: parseInt(res.recordingRetentionDays || "7", 10),
            classJoinWindowMinutes: parseInt(res.classJoinWindowMinutes || "15", 10),
            defaultRecordingEnabled: res.defaultRecordingEnabled !== "false",
            downloadEnabled: res.downloadEnabled !== "false",
          });
        }
      } catch (err) {
        setLoadError(err instanceof Error ? err.message : "Request failed");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);

    try {
      await api.patch("/admin/settings", settings);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to update platform settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {loadError && <LoadErrorBanner message={loadError} />}
      <div className="border-b border-aviation-border pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-aviation-black tracking-tight font-heading">
            Platform Configuration & Policies
          </h1>
          <p className="text-xs sm:text-sm text-aviation-muted mt-1">
            Centralized policy controls governing 7-day recording retention, operational timezones, and student join windows.
          </p>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Platform policies updated and recorded in system audit logs.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Core Retention Policy Card */}
        <Card padding="lg" variant="default" className="border-2 border-aviation-border space-y-4">
          <div className="flex items-center gap-2 border-b border-aviation-border pb-3">
            <Clock className="w-5 h-5 text-aviation-yellowDeep" />
            <h2 className="text-base font-bold text-aviation-black font-heading">
              Recording Lifecycle & Retention Policy
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-aviation-charcoal uppercase tracking-wider mb-1">
                Recording Retention Days *
              </label>
              <input
                type="number"
                required
                min={1}
                max={30}
                value={settings.recordingRetentionDays}
                onChange={(e) =>
                  setSettings({ ...settings, recordingRetentionDays: parseInt(e.target.value, 10) })
                }
                className="w-full px-3.5 py-2.5 rounded-lg border border-aviation-border bg-white text-sm font-mono font-bold focus:outline-none focus:ring-2 focus:ring-aviation-yellow"
              />
              <p className="text-[11px] text-aviation-muted mt-1">
                Default: <strong>7 days</strong>. All recordings auto-calculate `expiresAt = availableAt + N days`.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-aviation-charcoal uppercase tracking-wider mb-1">
                Class Join Window (Minutes) *
              </label>
              <input
                type="number"
                required
                min={0}
                max={120}
                value={settings.classJoinWindowMinutes}
                onChange={(e) =>
                  setSettings({ ...settings, classJoinWindowMinutes: parseInt(e.target.value, 10) })
                }
                className="w-full px-3.5 py-2.5 rounded-lg border border-aviation-border bg-white text-sm font-mono font-bold focus:outline-none focus:ring-2 focus:ring-aviation-yellow"
              />
              <p className="text-[11px] text-aviation-muted mt-1">
                Minutes before scheduled start time students are allowed to enter the live room.
              </p>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center gap-6">
            <label className="flex items-center gap-2 text-xs font-bold text-aviation-charcoal cursor-pointer">
              <input
                type="checkbox"
                checked={settings.downloadEnabled}
                onChange={(e) => setSettings({ ...settings, downloadEnabled: e.target.checked })}
                className="w-4 h-4 rounded text-aviation-yellow focus:ring-aviation-yellow"
              />
              <span>Enable Student MP4 Video Downloads</span>
            </label>

            <label className="flex items-center gap-2 text-xs font-bold text-aviation-charcoal cursor-pointer">
              <input
                type="checkbox"
                checked={settings.defaultRecordingEnabled}
                onChange={(e) => setSettings({ ...settings, defaultRecordingEnabled: e.target.checked })}
                className="w-4 h-4 rounded text-aviation-yellow focus:ring-aviation-yellow"
              />
              <span>Auto-Enable Recording on New Classes</span>
            </label>
          </div>
        </Card>

        {/* Academy Branding & Timezone */}
        <Card padding="lg" variant="default" className="space-y-4">
          <div className="flex items-center gap-2 border-b border-aviation-border pb-3">
            <Settings className="w-5 h-5 text-aviation-charcoal" />
            <h2 className="text-base font-bold text-aviation-black font-heading">
              Academy Branding & Operational Timezone
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-aviation-charcoal uppercase tracking-wider mb-1">
                Academy Display Name
              </label>
              <input
                type="text"
                required
                value={settings.academyName}
                onChange={(e) => setSettings({ ...settings, academyName: e.target.value })}
                className="w-full px-3.5 py-2 rounded-lg border border-aviation-border bg-white text-xs sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-aviation-charcoal uppercase tracking-wider mb-1">
                Standard Timezone
              </label>
              <input
                type="text"
                required
                value={settings.academyTimezone}
                onChange={(e) => setSettings({ ...settings, academyTimezone: e.target.value })}
                className="w-full px-3.5 py-2 rounded-lg border border-aviation-border bg-white text-xs sm:text-sm font-mono"
              />
            </div>
          </div>
        </Card>

        <div className="flex justify-end">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={saving}
            leftIcon={<Save className="w-4 h-4" />}
          >
            Save Platform Settings
          </Button>
        </div>
      </form>
    </div>
  );
}
