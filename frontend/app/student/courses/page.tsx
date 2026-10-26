"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import api from "@/lib/api";
import LoadErrorBanner from "@/components/ui/LoadErrorBanner";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { BookOpen, Calendar, User, ArrowRight } from "lucide-react";

interface EnrollmentItem {
  id: string;
  course: {
    id: string;
    title: string;
    code: string;
    description: string;
    durationHours: number;
  };
  batch: {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    status: string;
    instructor?: { name: string; email: string };
    _count?: { classSessions: number };
  };
}

export default function StudentCoursesPage() {
  const [enrollments, setEnrollments] = useState<EnrollmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get<EnrollmentItem[]>("/student/courses");
        setEnrollments(res || []);
      } catch (err) {
        setLoadError(err instanceof Error ? err.message : "Request failed");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="space-y-6">
      {loadError && <LoadErrorBanner message={loadError} />}
      <div className="border-b border-aviation-border pb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-aviation-black tracking-tight font-heading">
          My Enrolled Courses
        </h1>
        <p className="text-xs sm:text-sm text-aviation-muted mt-1">
          Review your enrolled professional accounting programs, batch details, and faculty mentor assignments.
        </p>
      </div>

      {loading ? (
        <div className="h-48 bg-gray-200 rounded-xl animate-pulse"></div>
      ) : enrollments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {enrollments.map((item) => (
            <Card key={item.id} padding="lg" variant="default" className="flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Badge variant="yellow" size="sm">
                    {item.course.code}
                  </Badge>
                  <Badge variant="ready" size="sm">
                    {item.batch.status}
                  </Badge>
                </div>

                <h3 className="text-xl font-bold text-aviation-black mb-2 font-heading">
                  {item.course.title}
                </h3>

                <p className="text-xs sm:text-sm text-aviation-muted leading-relaxed mb-4">
                  {item.course.description}
                </p>

                <div className="p-3.5 rounded-lg bg-aviation-offWhite border border-aviation-border space-y-1.5 text-xs text-aviation-charcoal">
                  <div className="font-bold">{item.batch.name}</div>
                  <div>Instructor: <span className="font-semibold">{item.batch.instructor?.name || "Capt. Vikram Malhotra"}</span></div>
                  <div>Planned Sessions: <span className="font-mono font-bold">{item.batch._count?.classSessions || 24} Classes</span></div>
                </div>
              </div>

              <div className="pt-6 border-t border-aviation-border mt-6 flex items-center justify-between">
                <Link href="/student/recordings" className="w-full">
                  <Button variant="dark" size="sm" className="w-full text-xs" rightIcon={<ArrowRight className="w-4 h-4" />}>
                    View Class Recordings
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card padding="lg" className="text-center py-12">
          <BookOpen className="w-10 h-10 text-aviation-muted mx-auto mb-2" />
          <p className="text-sm font-bold text-aviation-black">No Enrolled Courses</p>
          <p className="text-xs text-aviation-muted mt-1">
            Contact academy administration or enroll in an upcoming batch from the course catalog.
          </p>
        </Card>
      )}
    </div>
  );
}
