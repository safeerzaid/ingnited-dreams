"use client";

import React, { useCallback, useEffect, useState } from "react";
import { getWithMeta } from "@/lib/api";
import LoadErrorBanner from "@/components/ui/LoadErrorBanner";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { formatDateTime, formatPaise } from "@/lib/format";
import { IndianRupee, Search } from "lucide-react";

interface PaymentRow {
  id: string;
  receiptNumber: string;
  providerOrderId: string;
  providerPaymentId: string | null;
  amount: number;
  status: "CREATED" | "PAID" | "FAILED" | "REFUNDED";
  method: string | null;
  paidAt: string | null;
  createdAt: string;
  failureReason: string | null;
  user: { id: string; name: string; email: string; phone: string | null };
  course: { title: string; code: string };
  batch: { name: string };
}

const STATUS_BADGE = { PAID: "ready", CREATED: "scheduled", FAILED: "expired", REFUNDED: "expiring" } as const;

export default function AdminPaymentsPage() {
  const [rows, setRows] = useState<PaymentRow[]>([]);
  const [summary, setSummary] = useState({ paidCount: 0, revenuePaise: 0 });
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "25" });
      if (status) params.set("status", status);
      if (search.trim()) params.set("search", search.trim());
      const res = await getWithMeta<{ payments: PaymentRow[]; summary: typeof summary }>(`/admin/payments?${params}`);
      setRows(res.data.payments);
      setSummary(res.data.summary);
      setTotalPages(res.meta?.totalPages || 1);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, status]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-6">
      {loadError && <LoadErrorBanner message={loadError} onRetry={load} />}
      <div className="border-b border-aviation-border pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-aviation-black tracking-tight font-heading">Payments</h1>
          <p className="text-xs sm:text-sm text-aviation-muted mt-1">
            Every Razorpay checkout. PAID payments auto-enroll the student. Refunds are issued from the Razorpay dashboard.
          </p>
        </div>
        <Card padding="md" variant="default" className="flex items-center gap-3">
          <IndianRupee className="w-6 h-6 text-aviation-yellowDeep" />
          <div>
            <div className="text-xl font-black">{formatPaise(summary.revenuePaise)}</div>
            <div className="text-[11px] text-aviation-muted">{summary.paidCount} paid admissions</div>
          </div>
        </Card>
      </div>

      <form
        className="flex flex-col sm:flex-row gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          setPage(1);
          load();
        }}
      >
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-aviation-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search receipt no., payment ID, student name or email"
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-aviation-border text-xs bg-white"
          />
        </div>
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 rounded-lg border border-aviation-border text-xs bg-white"
        >
          <option value="">All statuses</option>
          <option value="PAID">Paid</option>
          <option value="CREATED">Pending</option>
          <option value="FAILED">Failed</option>
          <option value="REFUNDED">Refunded</option>
        </select>
        <Button type="submit" variant="dark" size="sm">
          Search
        </Button>
      </form>

      <Card padding="none" variant="default" className="overflow-x-auto border border-aviation-border">
        <table className="w-full text-xs">
          <thead className="bg-aviation-offWhite border-b border-aviation-border text-[10px] uppercase tracking-wider text-aviation-muted">
            <tr>
              <th className="text-left px-4 py-3">Date</th>
              <th className="text-left px-4 py-3">Student</th>
              <th className="text-left px-4 py-3">Course / Batch</th>
              <th className="text-left px-4 py-3">Receipt / Payment ID</th>
              <th className="text-right px-4 py-3">Amount</th>
              <th className="text-left px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-aviation-border">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-aviation-muted">
                  Loading…
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-aviation-muted">
                  No payments found.
                </td>
              </tr>
            ) : (
              rows.map((p) => (
                <tr key={p.id} className="align-top">
                  <td className="px-4 py-3 whitespace-nowrap">{formatDateTime(p.paidAt || p.createdAt)}</td>
                  <td className="px-4 py-3">
                    <div className="font-bold">{p.user.name}</div>
                    <div className="text-aviation-muted">{p.user.email}</div>
                    {p.user.phone && <div className="text-aviation-muted">{p.user.phone}</div>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-semibold">{p.course.code}</div>
                    <div className="text-aviation-muted">{p.batch.name}</div>
                  </td>
                  <td className="px-4 py-3 font-mono">
                    <div>{p.receiptNumber}</div>
                    <div className="text-aviation-muted">{p.providerPaymentId || p.providerOrderId}</div>
                  </td>
                  <td className="px-4 py-3 text-right font-bold whitespace-nowrap">{formatPaise(p.amount)}</td>
                  <td className="px-4 py-3">
                    <Badge variant={STATUS_BADGE[p.status]} size="sm">
                      {p.status}
                    </Badge>
                    {p.method && <div className="text-[10px] text-aviation-muted mt-1 uppercase">{p.method}</div>}
                    {p.failureReason && p.status !== "PAID" && <div className="text-[10px] text-red-700 mt-1">{p.failureReason}</div>}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-end gap-2 text-xs">
          <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Previous
          </Button>
          <span>
            Page {page} of {totalPages}
          </span>
          <Button size="sm" variant="outline" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
