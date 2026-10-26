"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import LoadErrorBanner from "@/components/ui/LoadErrorBanner";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { Calendar, Clock, Video, ArrowRight, Play } from "lucide-react";

interface ClassItem {
  id: string;
  title: string;
  course: { title: string; code: string };
  batch: { name: string };
  startTime: string;
  endTime: string;
  status: string;
  _count: { attendances: number };
}

export default function InstructorClassesPage() {
  const router = useRouter();
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [startingId, setStartingId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get<ClassItem[]>("/instructor/classes");
        setClasses(res || []);
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
      setStartingId(classId);
      await api.post(`/instructor/classes/${classId}/start`);
      router.push(`/classroom/${classId}`);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to start class");
    } finally {
      setStartingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {loadError && <LoadErrorBanner message={loadError} />}
      <div className="border-b border-aviation-border pb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-aviation-black tracking-tight font-heading">
            Assigned Masterclasses
          </h1>
          <p className="text-xs sm:text-sm text-aviation-muted mt-1">
            View all assigned curriculum sessions, schedule practical labs, and launch live interactive classrooms.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-xl"></div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {classes.map((cls) => {
            const dateObj = new Date(cls.startTime);
            return (
              <Card key={cls.id} padding="md" variant="default" className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <Badge variant={cls.status === "LIVE" ? "live" : cls.status === "COMPLETED" ? "default" : "scheduled"} size="sm" dot={cls.status === "LIVE"}>
                      {cls.status}
                    </Badge>
                    <span className="text-xs font-mono font-bold text-aviation-muted">
                      {cls.course.code} • {cls.batch.name}
                    </span>
                  </div>
                  <h3 className="font-bold text-base text-aviation-black font-heading">
                    {cls.title}
                  </h3>
                  <div className="text-xs text-aviation-muted font-mono flex items-center gap-3">
                    <span>
                      {dateObj.toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })} •{" "}
                      {dateObj.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                    {cls._count.attendances > 0 && (
                      <span>Students Attended: {cls._count.attendances}</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {cls.status === "LIVE" ? (
                    <Link href={`/classroom/${cls.id}`}>
                      <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                        Enter Live Class
                      </Button>
                    </Link>
                  ) : cls.status === "SCHEDULED" ? (
                    <Button
                      variant="dark"
                      size="sm"
                      onClick={() => handleStartClass(cls.id)}
                      isLoading={startingId === cls.id}
                      leftIcon={<Play className="w-3.5 h-3.5 text-aviation-yellow" />}
                    >
                      Start Class
                    </Button>
                  ) : (
                    <span className="text-xs font-semibold text-aviation-muted">
                      Class Concluded
                    </span>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
