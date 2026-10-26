"use client";

import React, { useCallback, useEffect, useState } from "react";
import api, { getWithMeta } from "@/lib/api";
import LoadErrorBanner from "@/components/ui/LoadErrorBanner";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { formatDateTime } from "@/lib/format";
import { Mail, Phone, CheckCircle2, RotateCcw } from "lucide-react";

interface Inquiry {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  status: "NEW" | "RESOLVED";
  createdAt: string;
}

export default function AdminInquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [openCount, setOpenCount] = useState(0);
  const [filter, setFilter] = useState<"NEW" | "RESOLVED" | "">("NEW");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await getWithMeta<{ inquiries: Inquiry[]; openCount: number }>(
        `/admin/inquiries?limit=100${filter ? `&status=${filter}` : ""}`
      );
      setInquiries(res.data.inquiries);
      setOpenCount(res.data.openCount);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    load();
  }, [load]);

  const setStatus = async (id: string, status: "NEW" | "RESOLVED") => {
    try {
      await api.patch(`/admin/inquiries/${id}`, { status });
      load();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Update failed");
    }
  };

  return (
    <div className="space-y-6">
      {loadError && <LoadErrorBanner message={loadError} onRetry={load} />}
      <div className="border-b border-aviation-border pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-aviation-black tracking-tight font-heading">Website Enquiries</h1>
          <p className="text-xs sm:text-sm text-aviation-muted mt-1">Messages from the contact form. {openCount} open.</p>
        </div>
        <div className="flex gap-2">
          {(["NEW", "RESOLVED", ""] as const).map((f) => (
            <Button key={f || "all"} size="sm" variant={filter === f ? "dark" : "outline"} onClick={() => setFilter(f)}>
              {f === "NEW" ? "Open" : f === "RESOLVED" ? "Resolved" : "All"}
            </Button>
          ))}
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-aviation-muted">Loading…</p>
      ) : inquiries.length === 0 ? (
        <p className="text-sm text-aviation-muted">No enquiries.</p>
      ) : (
        <div className="space-y-3">
          {inquiries.map((q) => (
            <Card key={q.id} padding="md" variant="default" className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Badge variant={q.status === "NEW" ? "live" : "ready"} size="sm">
                    {q.status === "NEW" ? "Open" : "Resolved"}
                  </Badge>
                  <span className="text-sm font-bold">{q.name}</span>
                  {q.subject && <span className="text-xs text-aviation-muted">· {q.subject}</span>}
                </div>
                <span className="text-[11px] text-aviation-muted">{formatDateTime(q.createdAt)}</span>
              </div>
              <p className="text-xs text-aviation-charcoal whitespace-pre-wrap">{q.message}</p>
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-aviation-border text-xs">
                <div className="flex flex-wrap gap-4">
                  <a href={`mailto:${q.email}`} className="flex items-center gap-1 font-semibold hover:underline">
                    <Mail className="w-3.5 h-3.5" /> {q.email}
                  </a>
                  {q.phone && (
                    <a href={`tel:${q.phone}`} className="flex items-center gap-1 font-semibold hover:underline">
                      <Phone className="w-3.5 h-3.5" /> {q.phone}
                    </a>
                  )}
                </div>
                {q.status === "NEW" ? (
                  <Button size="sm" variant="primary" leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />} onClick={() => setStatus(q.id, "RESOLVED")}>
                    Mark Resolved
                  </Button>
                ) : (
                  <Button size="sm" variant="outline" leftIcon={<RotateCcw className="w-3.5 h-3.5" />} onClick={() => setStatus(q.id, "NEW")}>
                    Reopen
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
