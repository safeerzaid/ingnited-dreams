"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import api from "@/lib/api";
import LoadErrorBanner from "@/components/ui/LoadErrorBanner";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import {
  Video,
  Clock,
  Download,
  Calendar,
  BookOpen,
  ArrowRight,
  AlertTriangle,
  Play,
  CheckCircle,
  Sparkles,
  Upload,
  FileText,
  ShieldCheck,
  FileUp,
} from "lucide-react";

interface DashboardData {
  student: { id: string; name: string; email: string };
  liveNow: {
    id: string;
    title: string;
    course: { title: string; code: string };
    batch: { name: string };
    instructor: { name: string };
    startTime: string;
  } | null;
  upcomingClasses: Array<{
    id: string;
    title: string;
    course: { title: string; code: string };
    batch: { name: string };
    instructor: { name: string };
    startTime: string;
  }>;
  recentRecordings: Array<{
    id: string;
    title: string;
    courseTitle: string;
    batchName: string;
    instructorName: string;
    durationSeconds: number;
    availableAt: string;
    expiresAt: string;
    hoursRemaining: number | null;
    status: string;
    downloadEnabled: boolean;
  }>;
  enrollments: Array<{
    id: string;
    course: { title: string; code: string };
    batch: { name: string };
  }>;
  attendance: {
    totalClasses: number;
    attendedClasses: number;
    attendanceRate: number;
  };
}

export default function StudentDashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const res = await api.get<DashboardData>("/student/dashboard");
        setData(res);
      } catch (err) {
        setLoadError(err instanceof Error ? err.message : "Request failed");
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [user]);

  const handleDownload = async (recordingId: string) => {
    try {
      setDownloadingId(recordingId);
      const res = await api.get<{ downloadUrl: string; fileName: string }>(
        `/recordings/${recordingId}/download`
      );
      if (res.downloadUrl) {
        window.open(res.downloadUrl, "_blank");
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Download failed. Recording may have expired.");
    } finally {
      setDownloadingId(null);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const hrs = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    if (hrs > 0) return `${hrs}h ${remainingMins}m`;
    return `${mins} mins`;
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-gray-200 rounded w-1/3"></div>
        <div className="h-44 bg-gray-200 rounded-xl"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-64 bg-gray-200 rounded-xl"></div>
          <div className="h-64 bg-gray-200 rounded-xl"></div>
        </div>
      </div>
    );
  }

  const studentName = data?.student.name || user?.name || "Student";

  return (
    <div className="space-y-8">
      {loadError && <LoadErrorBanner message={loadError} />}
      {/* 1. WELCOME HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-aviation-border pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-aviation-black tracking-tight font-heading">
            {getGreeting()}, {studentName}
          </h1>
          <p className="text-xs sm:text-sm text-aviation-muted mt-1">
            Welcome to your skill training portal. Track upcoming masterclasses, attend live sessions, and review 7-day recordings.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Card padding="sm" variant="default" className="text-center px-4 py-2 border-aviation-border">
            <div className="text-[10px] uppercase font-bold tracking-wider text-aviation-muted">
              Attendance
            </div>
            <div className="text-lg font-extrabold text-aviation-black font-heading">
              {data?.attendance.attendanceRate}%
            </div>
          </Card>
        </div>
      </div>

      {/* PROTOTYPE CLIENT REVIEW NOTICE */}
      <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <span className="text-amber-950 font-medium">
            <strong className="font-bold text-amber-950">Enrolled Student Access Verified:</strong> You are inside the private portal. Live classes, batch schedule, and 7-day class recordings are now active.
          </span>
        </div>
        <Link href="/courses" className="text-amber-900 font-bold hover:underline shrink-0 flex items-center gap-1">
          Explore Other Courses <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* 2. LIVE NOW BANNER */}
      {data?.liveNow && (
        <Card
          padding="lg"
          className="bg-gradient-to-r from-aviation-black via-aviation-charcoal to-aviation-black text-white border-2 border-aviation-yellow relative overflow-hidden shadow-elevated"
        >
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-xl">
              <div className="flex items-center gap-2">
                <Badge variant="live" size="sm" dot>
                  CLASS IS LIVE NOW
                </Badge>
                <span className="text-xs font-mono text-gray-300">
                  {data.liveNow.course.code} • {data.liveNow.batch.name}
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-extrabold text-white font-heading leading-tight">
                {data.liveNow.title}
              </h2>

              <p className="text-xs sm:text-sm text-gray-300">
                Instructor: <span className="font-bold text-aviation-yellow">{data.liveNow.instructor.name}</span>
              </p>
            </div>

            <div className="shrink-0">
              <Link href={`/classroom/${data.liveNow.id}`}>
                <Button
                  variant="primary"
                  size="lg"
                  rightIcon={<ArrowRight className="w-5 h-5" />}
                  className="font-extrabold shadow-glowYellow w-full sm:w-auto"
                >
                  Join Live Class Now
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      )}

      {/* 3. RECENT RECORDINGS & UPCOMING CLASSES GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Recent Recordings (7-Day Lifecycle Showcase) */}
        <div className="lg:col-span-8 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-aviation-black font-heading">
                Recent Class Recordings
              </h2>
              <Badge variant="yellow" size="sm">
                7-Day Expiry
              </Badge>
            </div>
            <Link href="/student/recordings" className="text-xs font-bold text-aviation-black hover:underline flex items-center gap-1">
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {data?.recentRecordings && data.recentRecordings.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {data.recentRecordings.map((rec) => {
                const isUrgent = rec.hoursRemaining !== null && rec.hoursRemaining <= 24;
                const isWarning = rec.hoursRemaining !== null && rec.hoursRemaining <= 48 && !isUrgent;

                return (
                  <Card key={rec.id} padding="none" variant="default" className="flex flex-col justify-between overflow-hidden border border-aviation-border hover:border-aviation-charcoal/20 transition-all">
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-2 mb-3">
                        {isUrgent ? (
                          <Badge variant="expiring" size="sm" dot>
                            Expires in {rec.hoursRemaining}h!
                          </Badge>
                        ) : isWarning ? (
                          <Badge variant="expiring" size="sm">
                            Expires soon ({rec.hoursRemaining}h)
                          </Badge>
                        ) : (
                          <Badge variant="ready" size="sm">
                            Ready ({Math.round((rec.hoursRemaining || 168) / 24)}d left)
                          </Badge>
                        )}
                        <span className="text-[11px] font-mono font-bold text-aviation-muted">
                          {formatDuration(rec.durationSeconds)}
                        </span>
                      </div>

                      <h3 className="font-bold text-sm text-aviation-black line-clamp-2 mb-2 font-heading leading-snug">
                        {rec.title}
                      </h3>

                      <div className="text-xs text-aviation-muted space-y-1">
                        <div>Instructor: {rec.instructorName}</div>
                        <div>Batch: {rec.batchName}</div>
                      </div>
                    </div>

                    <div className="px-5 py-3.5 bg-aviation-offWhite border-t border-aviation-border flex items-center justify-between gap-2">
                      <Link href={`/student/recordings/${rec.id}`} className="flex-1">
                        <Button variant="dark" size="sm" className="w-full text-xs" leftIcon={<Play className="w-3.5 h-3.5 text-aviation-yellow" />}>
                          Watch
                        </Button>
                      </Link>

                      {rec.downloadEnabled && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleDownload(rec.id)}
                          isLoading={downloadingId === rec.id}
                          className="px-3"
                          title="Download MP4 recording before 7-day expiration"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card padding="lg" className="text-center py-10 bg-aviation-offWhite">
              <Clock className="w-8 h-8 text-aviation-muted mx-auto mb-2" />
              <div className="text-sm font-bold text-aviation-black">No Active Recordings</div>
              <p className="text-xs text-aviation-muted mt-1">
                Completed live classes will automatically process and appear here with 7-day replay and download access.
              </p>
            </Card>
          )}
        </div>

        {/* Right Column: Upcoming Classes & Quick Actions */}
        <div className="lg:col-span-4 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-aviation-black font-heading">
              Upcoming Classes
            </h2>
          </div>

          <div className="space-y-3">
            {data?.upcomingClasses && data.upcomingClasses.length > 0 ? (
              data.upcomingClasses.map((cls) => {
                const dateObj = new Date(cls.startTime);
                return (
                  <Card key={cls.id} padding="md" variant="default" className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono text-aviation-muted font-bold">
                        {cls.course.code}
                      </span>
                      <span className="font-semibold text-aviation-yellowDeep bg-aviation-yellow/10 px-2 py-0.5 rounded">
                        {dateObj.toLocaleDateString("en-IN", { month: "short", day: "numeric" })} • {dateObj.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>

                    <h4 className="font-bold text-sm text-aviation-black font-heading">
                      {cls.title}
                    </h4>

                    <div className="text-xs text-aviation-muted flex items-center justify-between pt-1">
                      <span>{cls.instructor.name}</span>
                      <span className="text-[11px] font-medium text-aviation-charcoal">
                        {cls.batch.name}
                      </span>
                    </div>
                  </Card>
                );
              })
            ) : (
              <Card padding="md" className="text-center py-8">
                <p className="text-xs text-aviation-muted">No scheduled upcoming classes.</p>
              </Card>
            )}
          </div>

          {/* Quick Enrolled Courses Widget */}
          <div className="pt-2">
            <h3 className="text-xs uppercase font-bold tracking-wider text-aviation-muted mb-3 font-heading">
              My Active Enrolled Courses
            </h3>
            <div className="space-y-2">
              {data?.enrollments.map((en) => (
                <div
                  key={en.id}
                  className="p-3 rounded-lg bg-white border border-aviation-border flex items-center justify-between text-xs"
                >
                  <div className="overflow-hidden">
                    <div className="font-bold text-aviation-black truncate">{en.course.title}</div>
                    <div className="text-[11px] text-aviation-muted font-mono">{en.batch.name}</div>
                  </div>
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 ml-2" />
                </div>
              ))}
            </div>
          </div>

          {/* Daily 1-Page Note & Weekend Project Upload Widget */}
          <div className="p-5 rounded-2xl bg-[#0e271d] text-white space-y-4 shadow-lg border border-[#163a2b]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#F5C400] flex items-center gap-1.5">
                <FileUp className="w-3.5 h-3.5" />
                Cadet Submissions
              </span>
              <span className="px-2 py-0.5 rounded-full bg-white/10 text-[10px] font-semibold text-slate-300">
                2-Year Archive
              </span>
            </div>

            <div>
              <h4 className="text-sm font-bold text-white">Daily 1-Page Scanned Note</h4>
              <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                Mandatory after each 3-hour class. Upload your hand-written 1-page summary scan directly to the company server.
              </p>
              <button
                type="button"
                onClick={() => alert("Scanned note upload portal opened. File securely routed to ID management archive.")}
                className="mt-3 w-full py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all border border-white/20 cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5 text-[#F5C400]" />
                <span>Upload Scanned Class Note</span>
              </button>
            </div>

            <div className="pt-3 border-t border-white/10">
              <h4 className="text-sm font-bold text-white">Weekend Project / Speech Submission</h4>
              <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                Submit weekly written case paper or speech presentation for faculty viva evaluation.
              </p>
              <button
                type="button"
                onClick={() => alert("Weekend Project submission portal opened.")}
                className="mt-3 w-full py-2.5 px-3 rounded-xl bg-[#F5C400] hover:bg-amber-300 text-[#0e271d] font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Submit Weekend Project</span>
              </button>
            </div>

            <div className="pt-3 border-t border-white/10">
              <Link
                href="/library"
                className="w-full py-2 px-3 rounded-xl bg-[#06140e] hover:bg-black text-slate-300 hover:text-white text-xs font-semibold flex items-center justify-between transition-colors"
              >
                <span className="flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-[#F5C400]" />
                  Kindle Digital Library
                </span>
                <span className="text-[10px] text-[#F5C400] font-bold">Open Hub →</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
