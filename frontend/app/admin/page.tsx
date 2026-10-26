"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import api from "@/lib/api";
import LoadErrorBanner from "@/components/ui/LoadErrorBanner";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import {
  Users,
  GraduationCap,
  BookOpen,
  Calendar,
  Video,
  Clock,
  HardDrive,
  Activity,
  ArrowRight,
  AlertTriangle,
  Layers,
  Settings,
  IndianRupee,
  Mail,
} from "lucide-react";
import { formatPaise } from "@/lib/format";

interface AdminDashboardData {
  metrics: {
    totalStudents: number;
    activeInstructors: number;
    activeCourses: number;
    upcomingClasses: number;
    liveClasses: number;
    readyRecordings: number;
    expiringRecordings: number;
    totalStorageBytes: number;
    storageMb: string;
    paidAdmissions: number;
    revenuePaise: number;
    openInquiries: number;
  };
  recentAudits: Array<{
    id: string;
    action: string;
    entity: string;
    metadata: string | null;
    createdAt: string;
    actor?: { name: string; role: string };
  }>;
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get<AdminDashboardData>("/admin/dashboard");
        setData(res);
      } catch (err) {
        setLoadError(err instanceof Error ? err.message : "Request failed");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="space-y-8">
      {loadError && <LoadErrorBanner message={loadError} />}
      {/* Page Header */}
      <div className="border-b border-aviation-border pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-aviation-black tracking-tight font-heading">
            Academy Management Platform
          </h1>
          <p className="text-xs sm:text-sm text-aviation-muted mt-1">
            Real-time platform telemetry, student rosters, classroom status, and 7-day recording lifecycle control.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/admin/recordings">
            <Button variant="dark" size="sm" leftIcon={<Clock className="w-4 h-4 text-aviation-yellow" />}>
              Manage Recordings
            </Button>
          </Link>
          <Link href="/admin/classes">
            <Button variant="primary" size="sm" leftIcon={<Calendar className="w-4 h-4" />}>
              Schedule Class
            </Button>
          </Link>
        </div>
      </div>

      {/* Top Telemetry KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card padding="md" variant="default" className="space-y-2">
          <div className="flex items-center justify-between text-aviation-muted">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Students</span>
            <GraduationCap className="w-4 h-4 text-aviation-yellowDeep" />
          </div>
          <div className="text-3xl font-extrabold text-aviation-black font-heading">
            {data?.metrics.totalStudents || 0}
          </div>
          <div className="text-[11px] text-aviation-muted">Enrolled & Active</div>
        </Card>

        <Card padding="md" variant="default" className="space-y-2">
          <div className="flex items-center justify-between text-aviation-muted">
            <span className="text-[11px] font-bold uppercase tracking-wider">Faculty</span>
            <Users className="w-4 h-4 text-aviation-yellowDeep" />
          </div>
          <div className="text-3xl font-extrabold text-aviation-black font-heading">
            {data?.metrics.activeInstructors || 0}
          </div>
          <div className="text-[11px] text-aviation-muted">Faculty & Trainers</div>
        </Card>

        <Card padding="md" variant="accent" className="space-y-2">
          <div className="flex items-center justify-between text-aviation-charcoal">
            <span className="text-[11px] font-bold uppercase tracking-wider">Live Now</span>
            <Video className="w-4 h-4 text-red-600 animate-live-pulse" />
          </div>
          <div className="text-3xl font-extrabold text-aviation-black font-heading">
            {data?.metrics.liveClasses || 0}
          </div>
          <div className="text-[11px] font-semibold text-red-600">Active Classroom Sessions</div>
        </Card>

        <Card padding="md" variant="default" className="space-y-2">
          <div className="flex items-center justify-between text-aviation-muted">
            <span className="text-[11px] font-bold uppercase tracking-wider">Upcoming Classes</span>
            <Calendar className="w-4 h-4 text-aviation-yellowDeep" />
          </div>
          <div className="text-3xl font-extrabold text-aviation-black font-heading">
            {data?.metrics.upcomingClasses || 0}
          </div>
          <div className="text-[11px] text-aviation-muted">Upcoming Live Sessions</div>
        </Card>
      </div>

      {/* Admissions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link href="/admin/payments">
          <Card padding="md" variant="default" className="space-y-2 hover:border-aviation-yellow transition-colors">
            <div className="flex items-center justify-between text-aviation-muted">
              <span className="text-[11px] font-bold uppercase tracking-wider">Fee Collected (Online)</span>
              <IndianRupee className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-3xl font-extrabold text-aviation-black font-heading">{formatPaise(data?.metrics.revenuePaise || 0)}</div>
            <div className="text-[11px] text-aviation-muted">{data?.metrics.paidAdmissions || 0} paid admissions via Razorpay</div>
          </Card>
        </Link>
        <Link href="/admin/inquiries">
          <Card padding="md" variant="default" className="space-y-2 hover:border-aviation-yellow transition-colors">
            <div className="flex items-center justify-between text-aviation-muted">
              <span className="text-[11px] font-bold uppercase tracking-wider">Open Enquiries</span>
              <Mail className="w-4 h-4 text-aviation-yellowDeep" />
            </div>
            <div className="text-3xl font-extrabold text-aviation-black font-heading">{data?.metrics.openInquiries || 0}</div>
            <div className="text-[11px] text-aviation-muted">Contact form messages awaiting reply</div>
          </Card>
        </Link>
      </div>

      {/* Recording Lifecycle Telemetry Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card padding="md" variant="default" className="space-y-2">
          <div className="flex items-center justify-between text-aviation-muted">
            <span className="text-[11px] font-bold uppercase tracking-wider">Active 7-Day Recordings</span>
            <Clock className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-extrabold text-aviation-black font-heading">
            {data?.metrics.readyRecordings || 0}
          </div>
          <div className="text-[11px] text-aviation-muted">Ready for student watch & download</div>
        </Card>

        <Card padding="md" variant="default" className="space-y-2 border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between text-amber-900">
            <span className="text-[11px] font-bold uppercase tracking-wider">Expiring Soon (&lt;48h)</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-3xl font-extrabold text-amber-950 font-heading">
            {data?.metrics.expiringRecordings || 0}
          </div>
          <div className="text-[11px] text-amber-700">Student access closes, then moves to the 2-year archive</div>
        </Card>

        <Card padding="md" variant="default" className="space-y-2">
          <div className="flex items-center justify-between text-aviation-muted">
            <span className="text-[11px] font-bold uppercase tracking-wider">R2 Video Storage</span>
            <HardDrive className="w-4 h-4 text-aviation-charcoal" />
          </div>
          <div className="text-3xl font-extrabold text-aviation-black font-heading">
            {data?.metrics.storageMb || "0.00"} <span className="text-base font-normal">MB</span>
          </div>
          <div className="text-[11px] text-aviation-muted">Active + archived recordings in Cloudflare R2</div>
        </Card>
      </div>

      {/* Recent Security & Admin Activity Logs */}
      <Card padding="none" variant="default" className="overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-aviation-border bg-aviation-offWhite flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-aviation-yellowDeep" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-aviation-black font-heading">
              Recent System Activity & Audit Trail
            </h2>
          </div>
          <Link href="/admin/audit-logs" className="text-xs font-bold text-aviation-black hover:underline">
            View All Logs →
          </Link>
        </div>

        <div className="divide-y divide-aviation-border">
          {data?.recentAudits && data.recentAudits.length > 0 ? (
            data.recentAudits.map((aud) => (
              <div key={aud.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div>
                  <div className="font-bold text-aviation-black flex items-center gap-2">
                    <Badge variant="yellow" size="sm">
                      {aud.action}
                    </Badge>
                    <span className="text-aviation-muted font-mono">{aud.entity}</span>
                  </div>
                  {aud.metadata && (
                    <div className="text-aviation-charcoal mt-1 text-[11px] font-mono">
                      {aud.metadata}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 shrink-0 text-aviation-muted">
                  <span>Actor: {aud.actor?.name || "System"}</span>
                  <span className="font-mono">{new Date(aud.createdAt).toLocaleTimeString()}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-xs text-aviation-muted">
              No recent audit logs.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
