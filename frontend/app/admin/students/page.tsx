"use client";

import React, { useState, useEffect } from "react";
import api from "@/lib/api";
import LoadErrorBanner from "@/components/ui/LoadErrorBanner";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { Users, Search, Plus, ShieldCheck, Mail, Phone, Calendar } from "lucide-react";

interface StudentItem {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  status: string;
  createdAt: string;
  studentProfile: { registrationNumber: string } | null;
  enrollments: Array<{
    batch: { name: string };
    course: { title: string; code: string };
  }>;
}

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<StudentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const loadStudents = async () => {
    try {
      setLoading(true);
      const res = await api.get<{ data: StudentItem[] }>(`/admin/students?search=${encodeURIComponent(search)}`);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const list = Array.isArray(res) ? res : (res as any).data || [];
      setStudents(list);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const toggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    try {
      await api.patch(`/admin/students/${id}/status`, { status: newStatus });
      loadStudents();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Status update failed");
    }
  };

  return (
    <div className="space-y-6">
      {loadError && <LoadErrorBanner message={loadError} />}
      <div className="border-b border-aviation-border pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-aviation-black tracking-tight font-heading">
            Student & Trainee Directory
          </h1>
          <p className="text-xs sm:text-sm text-aviation-muted mt-1">
            Supervise student enrollment records, assigned course batches, and live classroom access permissions.
          </p>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-aviation-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by student name, email, or registration number..."
          className="w-full pl-10 pr-3.5 py-2 rounded-lg border border-aviation-border bg-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-aviation-yellow"
        />
      </div>

      <Card padding="none" variant="default" className="overflow-hidden border border-aviation-border">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-aviation-offWhite border-b border-aviation-border font-bold uppercase tracking-wider text-aviation-muted text-[10px]">
              <tr>
                <th className="px-5 py-3.5">Student Name & Email</th>
                <th className="px-4 py-3.5">Reg Number</th>
                <th className="px-4 py-3.5">Phone</th>
                <th className="px-4 py-3.5">Assigned Batch</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-aviation-border">
              {students.map((std) => (
                <tr key={std.id} className="hover:bg-aviation-offWhite/40 transition-colors">
                  <td className="px-5 py-4">
                    <div className="font-bold text-aviation-black">{std.name}</div>
                    <div className="text-[11px] text-aviation-muted font-mono">{std.email}</div>
                  </td>

                  <td className="px-4 py-4 font-mono font-bold text-aviation-charcoal">
                    {std.studentProfile?.registrationNumber || "PENDING"}
                  </td>

                  <td className="px-4 py-4 text-aviation-muted font-mono">
                    {std.phone || "—"}
                  </td>

                  <td className="px-4 py-4">
                    {std.enrollments && std.enrollments.length > 0 ? (
                      std.enrollments.map((e, idx) => (
                        <div key={idx} className="font-medium text-aviation-charcoal">
                          {e.batch.name}
                        </div>
                      ))
                    ) : (
                      <span className="text-aviation-muted italic">Unassigned</span>
                    )}
                  </td>

                  <td className="px-4 py-4">
                    <Badge variant={std.status === "ACTIVE" ? "ready" : "expired"} size="sm">
                      {std.status}
                    </Badge>
                  </td>

                  <td className="px-5 py-4 text-right">
                    <Button
                      variant={std.status === "ACTIVE" ? "secondary" : "primary"}
                      size="sm"
                      onClick={() => toggleStatus(std.id, std.status)}
                      className="text-[11px] px-2.5 py-1"
                    >
                      {std.status === "ACTIVE" ? "Suspend" : "Activate"}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
