"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import LoadErrorBanner from "@/components/ui/LoadErrorBanner";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { formatDateTime, formatPaise } from "@/lib/format";
import { Receipt, Printer } from "lucide-react";

interface PaymentRow {
  id: string;
  receiptNumber: string;
  providerPaymentId: string | null;
  amount: number;
  status: "CREATED" | "PAID" | "FAILED" | "REFUNDED";
  method: string | null;
  paidAt: string | null;
  createdAt: string;
  failureReason: string | null;
  course: { title: string; code: string };
  batch: { name: string };
}

const STATUS_BADGE = {
  PAID: "ready",
  CREATED: "scheduled",
  FAILED: "expired",
  REFUNDED: "expiring",
} as const;

const STATUS_LABEL = { PAID: "Paid", CREATED: "Pending", FAILED: "Failed", REFUNDED: "Refunded" };

export default function StudentPaymentsPage() {
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<PaymentRow[]>("/payments/mine")
      .then(setPayments)
      .catch((err) => setLoadError(err instanceof Error ? err.message : "Request failed"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      {loadError && <LoadErrorBanner message={loadError} />}
      <div className="border-b border-aviation-border pb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-aviation-black tracking-tight font-heading">Payments &amp; Receipts</h1>
        <p className="text-xs sm:text-sm text-aviation-muted mt-1">Your course fee payments. Paid receipts can be printed for your records.</p>
      </div>

      {loading ? (
        <p className="text-sm text-aviation-muted">Loading payments…</p>
      ) : payments.length === 0 && !loadError ? (
        <Card padding="lg" variant="default" className="text-center space-y-3">
          <Receipt className="w-8 h-8 text-aviation-muted mx-auto" />
          <p className="text-sm text-aviation-muted">No payments yet.</p>
          <Link href="/courses">
            <Button variant="primary" size="sm">
              Browse Courses
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-3">
          {payments.map((p) => (
            <Card key={p.id} padding="md" variant="default" className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant={STATUS_BADGE[p.status]} size="sm">
                    {STATUS_LABEL[p.status]}
                  </Badge>
                  <span className="text-xs font-mono text-aviation-muted">{p.receiptNumber}</span>
                </div>
                <div className="text-sm font-bold text-aviation-black">{p.course.title}</div>
                <div className="text-xs text-aviation-muted">
                  {p.batch.name} • {formatDateTime(p.paidAt || p.createdAt)}
                  {p.providerPaymentId ? ` • Payment ID ${p.providerPaymentId}` : ""}
                  {p.status === "FAILED" && p.failureReason ? ` • ${p.failureReason}` : ""}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-lg font-black text-aviation-black">{formatPaise(p.amount)}</span>
                {p.status === "PAID" && (
                  <Link href={`/student/payments/${p.id}`}>
                    <Button variant="outline" size="sm" leftIcon={<Printer className="w-3.5 h-3.5" />}>
                      Receipt
                    </Button>
                  </Link>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
