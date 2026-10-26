"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import LoadErrorBanner from "@/components/ui/LoadErrorBanner";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { formatDate, formatDateTime, formatPaise } from "@/lib/format";
import { ArrowLeft, Printer } from "lucide-react";

interface ReceiptData {
  receiptNumber: string;
  providerPaymentId: string | null;
  providerOrderId: string;
  amount: number;
  method: string | null;
  status: string;
  paidAt: string | null;
  user: { name: string; email: string; phone: string | null; studentProfile: { registrationNumber: string } | null };
  course: { title: string; code: string };
  batch: { name: string; code: string; startDate: string; endDate: string; scheduleLabel: string | null; instructor: { name: string } };
}

export default function ReceiptPage() {
  const { id } = useParams<{ id: string }>();
  const [receipt, setReceipt] = useState<ReceiptData | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<ReceiptData>(`/payments/${id}/receipt`)
      .then(setReceipt)
      .catch((err) => setLoadError(err instanceof Error ? err.message : "Request failed"));
  }, [id]);

  if (loadError) return <LoadErrorBanner message={loadError} />;
  if (!receipt) return <p className="text-sm text-aviation-muted">Loading receipt…</p>;

  const rows: [string, string][] = [
    ["Student", `${receipt.user.name} (${receipt.user.email})`],
    ["Registration No.", receipt.user.studentProfile?.registrationNumber || "-"],
    ["Program", `${receipt.course.title} (${receipt.course.code})`],
    ["Batch", `${receipt.batch.name}${receipt.batch.scheduleLabel ? ` — ${receipt.batch.scheduleLabel}` : ""}`],
    ["Batch Period", `${formatDate(receipt.batch.startDate)} – ${formatDate(receipt.batch.endDate)}`],
    ["Amount Paid", `${formatPaise(receipt.amount)} (tax included)`],
    ["Payment Method", receipt.method ? receipt.method.toUpperCase() : "-"],
    ["Razorpay Payment ID", receipt.providerPaymentId || "-"],
    ["Order ID", receipt.providerOrderId],
    ["Paid On", receipt.paidAt ? formatDateTime(receipt.paidAt) : "-"],
  ];

  return (
    <div className="max-w-2xl space-y-4">
      <div className="flex items-center justify-between print:hidden">
        <Link href="/student/payments" className="text-xs font-semibold text-aviation-muted hover:text-aviation-black flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" /> All payments
        </Link>
        <Button variant="primary" size="sm" leftIcon={<Printer className="w-4 h-4" />} onClick={() => window.print()}>
          Print / Save PDF
        </Button>
      </div>

      <Card padding="lg" variant="default" className="border-2 border-aviation-border">
        <div className="flex items-start justify-between border-b border-aviation-border pb-4 mb-4">
          <div>
            <div className="text-lg font-black text-aviation-black font-heading">Ignited Dreams Integrated</div>
            <div className="text-xs text-aviation-muted">Fee Receipt</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-aviation-muted">Receipt No.</div>
            <div className="text-sm font-mono font-bold">{receipt.receiptNumber}</div>
          </div>
        </div>
        <dl className="space-y-2 text-xs">
          {rows.map(([label, value]) => (
            <div key={label} className="flex justify-between gap-4 py-1.5 border-b border-dashed border-aviation-border last:border-0">
              <dt className="text-aviation-muted font-semibold">{label}</dt>
              <dd className="text-aviation-black font-bold text-right">{value}</dd>
            </div>
          ))}
        </dl>
        <p className="text-[10px] text-aviation-muted mt-6">This is a computer-generated receipt for a payment processed via Razorpay.</p>
      </Card>
    </div>
  );
}
