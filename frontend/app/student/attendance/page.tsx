"use client";

import React, { useState, useEffect } from "react";
import api from "@/lib/api";
import LoadErrorBanner from "@/components/ui/LoadErrorBanner";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { CheckSquare, Calendar, Clock, CheckCircle2 } from "lucide-react";

interface AttendanceRecord {
  id: string;
  joinedAt: string;
  leftAt: string | null;
  durationSeconds: number;
  status: string;
  classSession: {
    title: string;
    course: { title: string; code: string };
    batch: { name: string };
  };
}

interface AttendanceData {
  stats: {
    totalClasses: number;
    attendedClasses: number;
    attendanceRate: number;
  };
  history: AttendanceRecord[];
}

export default function StudentAttendancePage() {
  const [data, setData] = useState<AttendanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get<AttendanceData>("/student/attendance");
        setData(res);
      } catch (err) {
        setLoadError(err instanceof Error ? err.message : "Request failed");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const hrs = Math.floor(mins / 60);
    const remMins = mins % 60;
    if (hrs > 0) return `${hrs}h ${remMins}m`;
    return `${mins}m`;
  };

  return (
    <div className="space-y-6">
      {loadError && <LoadErrorBanner message={loadError} />}
      <div className="border-b border-aviation-border pb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-aviation-black tracking-tight font-heading">
          Class Attendance & Participation
        </h1>
        <p className="text-xs sm:text-sm text-aviation-muted mt-1">
          Attendance is determined strictly from actual classroom participation duration.
        </p>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card padding="md" variant="accent">
          <div className="text-xs font-bold uppercase tracking-wider text-aviation-muted">
            Attendance Rate
          </div>
          <div className="text-3xl font-extrabold text-aviation-black font-heading mt-1">
            {data?.stats.attendanceRate || 0}%
          </div>
          <div className="text-xs text-aviation-muted mt-1">
            Across completed batch sessions
          </div>
        </Card>

        <Card padding="md" variant="default">
          <div className="text-xs font-bold uppercase tracking-wider text-aviation-muted">
            Classes Attended
          </div>
          <div className="text-3xl font-extrabold text-aviation-black font-heading mt-1">
            {data?.stats.attendedClasses || 0}
          </div>
          <div className="text-xs text-aviation-muted mt-1">
            Verified presence
          </div>
        </Card>

        <Card padding="md" variant="default">
          <div className="text-xs font-bold uppercase tracking-wider text-aviation-muted">
            Total Sessions
          </div>
          <div className="text-3xl font-extrabold text-aviation-black font-heading mt-1">
            {data?.stats.totalClasses || 0}
          </div>
          <div className="text-xs text-aviation-muted mt-1">
            Completed in enrolled curriculum
          </div>
        </Card>
      </div>

      {/* Attendance History Table */}
      <Card padding="none" variant="default" className="overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-aviation-border bg-aviation-offWhite/50">
          <h2 className="text-sm font-bold text-aviation-black uppercase tracking-wider">
            Session Attendance History
          </h2>
        </div>

        <div className="divide-y divide-aviation-border overflow-x-auto">
          {data?.history && data.history.length > 0 ? (
            data.history.map((record) => (
              <div key={record.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-1">
                  <div className="font-bold text-sm text-aviation-black">{record.classSession.title}</div>
                  <div className="text-aviation-muted">
                    {record.classSession.course.code} • {record.classSession.batch.name}
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className="font-mono text-aviation-muted">
                    {new Date(record.joinedAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                  </div>
                  <div className="font-mono font-bold text-aviation-charcoal">
                    {formatDuration(record.durationSeconds)}
                  </div>
                  <Badge variant="ready" size="sm">
                    {record.status}
                  </Badge>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-aviation-muted text-xs">
              No attendance records recorded yet.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
