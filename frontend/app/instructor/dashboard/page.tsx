"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import LoadErrorBanner from "@/components/ui/LoadErrorBanner";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import {
  Video,
  Clock,
  Calendar,
  Users,
  ArrowRight,
  Play,
  CheckCircle,
  Square,
} from "lucide-react";

interface InstructorDashboardData {
  liveClass: {
    id: string;
    title: string;
    course: { title: string; code: string };
    batch: { name: string };
    _count: { attendances: number };
  } | null;
  todayClasses: Array<{
    id: string;
    title: string;
    course: { title: string; code: string };
    batch: { name: string };
    startTime: string;
    status: string;
  }>;
  upcomingClasses: Array<{
    id: string;
    title: string;
    course: { title: string; code: string };
    batch: { name: string };
    startTime: string;
  }>;
  assignedBatches: Array<{
    id: string;
    name: string;
    course: { title: string };
    _count: { enrollments: number };
  }>;
  totalStudents: number;
}

export default function InstructorDashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<InstructorDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get<InstructorDashboardData>("/instructor/dashboard");
        setData(res);
      } catch (err) {
        setLoadError(err instanceof Error ? err.message : "Request failed");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleStartClass = async (classId: string) => {
    try {
      setActionLoading(classId);
      await api.post(`/instructor/classes/${classId}/start`);
      router.push(`/classroom/${classId}`);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to start class session");
    } finally {
      setActionLoading(null);
    }
  };

  const handleEndClass = async (classId: string) => {
    if (!confirm("Are you sure you want to end this live class? The room will close and recording processing will begin.")) {
      return;
    }
    try {
      setActionLoading(classId);
      await api.post(`/instructor/classes/${classId}/end`);
      window.location.reload();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to end class session");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-gray-200 rounded w-1/3"></div>
        <div className="h-44 bg-gray-200 rounded-xl"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {loadError && <LoadErrorBanner message={loadError} />}
      <div className="border-b border-aviation-border pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-aviation-black tracking-tight font-heading">
            Faculty Instruction Studio
          </h1>
          <p className="text-xs sm:text-sm text-aviation-muted mt-1">
            Conduct scheduled live skill masterclasses, mentor enrolled students, and manage session recordings.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Card padding="sm" variant="default" className="text-center px-4 py-2">
            <div className="text-[10px] uppercase font-bold text-aviation-muted">Total Students</div>
            <div className="text-lg font-extrabold text-aviation-black font-heading">
              {data?.totalStudents || 0}
            </div>
          </Card>
        </div>
      </div>

      {/* Active Live Class Card */}
      {data?.liveClass ? (
        <Card padding="lg" className="bg-aviation-black text-white border-2 border-red-500 shadow-elevated">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant="live" size="sm" dot>
                  YOU ARE CURRENTLY LIVE
                </Badge>
                <span className="text-xs text-gray-300 font-mono">
                  {data.liveClass.course.code} • {data.liveClass.batch.name}
                </span>
              </div>
              <h2 className="text-2xl font-bold text-white font-heading">
                {data.liveClass.title}
              </h2>
              <div className="text-xs text-gray-300 flex items-center gap-4">
                <span>Active Students: <strong className="text-aviation-yellow">{data.liveClass._count.attendances}</strong></span>
                <span>Recording: <strong className="text-red-400">LiveKit Egress 720p Active</strong></span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link href={`/classroom/${data.liveClass.id}`}>
                <Button variant="primary" size="md" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Enter Classroom
                </Button>
              </Link>
              <Button
                variant="danger"
                size="md"
                onClick={() => handleEndClass(data!.liveClass!.id)}
                isLoading={actionLoading === data.liveClass.id}
                leftIcon={<Square className="w-4 h-4" />}
              >
                End Class
              </Button>
            </div>
          </div>
        </Card>
      ) : null}

      {/* Today's Classes */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-aviation-black font-heading">
          Today&apos;s Class Schedule
        </h2>

        {data?.todayClasses && data.todayClasses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.todayClasses.map((cls) => {
              const dateObj = new Date(cls.startTime);
              return (
                <Card key={cls.id} padding="md" variant="default" className="flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-aviation-muted">
                        {cls.course.code}
                      </span>
                      <span className="text-xs font-semibold text-aviation-yellowDeep bg-aviation-yellow/10 px-2 py-0.5 rounded font-mono">
                        {dateObj.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>

                    <h3 className="font-bold text-base text-aviation-black font-heading">
                      {cls.title}
                    </h3>
                    <div className="text-xs text-aviation-muted font-medium">
                      Batch: {cls.batch.name}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-aviation-border mt-4 flex items-center justify-between">
                    <Badge variant={cls.status === "LIVE" ? "live" : "scheduled"} size="sm">
                      {cls.status}
                    </Badge>

                    <Button
                      variant="dark"
                      size="sm"
                      onClick={() => handleStartClass(cls.id)}
                      isLoading={actionLoading === cls.id}
                      leftIcon={<Play className="w-3.5 h-3.5 text-aviation-yellow" />}
                    >
                      Start Live Class
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card padding="md" className="text-center py-8">
            <p className="text-xs text-aviation-muted">No more classes scheduled for today.</p>
          </Card>
        )}
      </div>

      {/* Assigned Batches */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-aviation-black font-heading">
          Assigned Batches & Students
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {data?.assignedBatches.map((b) => (
            <Card key={b.id} padding="md" variant="default">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-aviation-black">{b.name}</h4>
                  <div className="text-xs text-aviation-muted mt-0.5">{b.course.title}</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-extrabold text-aviation-black font-heading">
                    {b._count.enrollments}
                  </div>
                  <div className="text-[10px] uppercase font-bold text-aviation-muted">
                    Students
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
