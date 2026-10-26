"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  Users,
  ArrowRight,
  AlertCircle,
  Camera,
  Download,
  Lock,
  Printer,
} from "lucide-react";
import api, { ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { formatDate, formatInr, formatPaise } from "@/lib/format";
import type { PublicCourse } from "@/lib/types";

const RAZORPAY_SCRIPT = "https://checkout.razorpay.com/v1/checkout.js";
const DEFAULT_COURSE = "transportation-logistics-sap";

const EDUCATION_LEVELS = [
  "Graduate (B.Com / BBA / B.Tech / BA)",
  "Undergraduate (Final Year)",
  "Diploma / Higher Secondary (10+2)",
  "Working Professional seeking 3PL/Logistics Shift",
];

interface OrderResponse {
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
  testMode: boolean;
  receiptNumber: string;
  course: { id: string; title: string; code: string };
  batch: { id: string; name: string };
  prefill: { name: string; email: string; contact: string };
}

interface Receipt {
  id: string;
  receiptNumber: string;
  providerPaymentId: string | null;
  amount: number;
  method: string | null;
  paidAt: string | null;
  user: { name: string; email: string; phone: string | null; studentProfile: { registrationNumber: string } | null };
  course: { title: string; code: string; slug: string };
  batch: {
    name: string;
    code: string;
    startDate: string;
    endDate: string;
    scheduleLabel: string | null;
    instructor: { name: string };
  };
}

interface RazorpaySuccess {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface RazorpayInstance {
  open: () => void;
  on: (event: "payment.failed", cb: (resp: { error: { description?: string } }) => void) => void;
}

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => RazorpayInstance;
  }
}

function loadRazorpay(): Promise<boolean> {
  if (typeof window === "undefined") return Promise.resolve(false);
  if (window.Razorpay) return Promise.resolve(true);
  return new Promise((resolve) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${RAZORPAY_SCRIPT}"]`);
    const script = existing || document.createElement("script");
    script.src = RAZORPAY_SCRIPT;
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    if (!existing) document.body.appendChild(script);
  });
}

const inputClass =
  "w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-aviation-yellow focus:outline-none bg-white";

function CheckoutContent() {
  const searchParams = useSearchParams();
  const courseSlug = searchParams.get("course") || DEFAULT_COURSE;
  const { user, isLoading: authLoading, register, refreshUser } = useAuth();

  const [course, setCourse] = useState<PublicCourse | null>(null);
  const [courseError, setCourseError] = useState<string | null>(null);
  const [gatewayEnabled, setGatewayEnabled] = useState<boolean | null>(null);
  const [testMode, setTestMode] = useState(false);

  const [batchId, setBatchId] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [educationLevel, setEducationLevel] = useState(EDUCATION_LEVELS[0]);
  const [agreed, setAgreed] = useState(false);

  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [alreadyEnrolled, setAlreadyEnrolled] = useState(false);
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const succeededRef = useRef(false);

  useEffect(() => {
    api
      .get<PublicCourse>(`/public/courses/${encodeURIComponent(courseSlug)}`)
      .then((c) => {
        setCourse(c);
        const firstOpen = c.batches.find((b) => b.seatsLeft > 0);
        if (firstOpen) setBatchId(firstOpen.id);
      })
      .catch((err) => setCourseError(err instanceof ApiError && err.statusCode === 404 ? "This course was not found." : err.message));

    api
      .get<{ enabled: boolean; testMode: boolean }>("/payments/config")
      .then((cfg) => {
        setGatewayEnabled(cfg.enabled);
        setTestMode(cfg.testMode);
      })
      .catch(() => setGatewayEnabled(false));

    loadRazorpay();
  }, [courseSlug]);

  const selectedBatch = useMemo(() => course?.batches.find((b) => b.id === batchId) || null, [course, batchId]);
  const isStudent = user?.role === "STUDENT";

  const verifyPayment = useCallback(
    async (resp: RazorpaySuccess) => {
      setIsProcessing(true);
      setError(null);
      try {
        const result = await api.post<Receipt>("/payments/verify", resp);
        succeededRef.current = true;
        setReceipt(result);
        refreshUser();
        window.scrollTo({ top: 0, behavior: "smooth" });
      } catch (err) {
        setError(
          `${err instanceof Error ? err.message : "Verification failed"} — if money was debited, your admission will be confirmed automatically within a few minutes. Payment ID: ${resp.razorpay_payment_id}`
        );
      } finally {
        setIsProcessing(false);
      }
    },
    [refreshUser]
  );

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setAlreadyEnrolled(false);

    if (!course || !selectedBatch) {
      setError("Please select a batch.");
      return;
    }
    if (!agreed) {
      setError("Please accept the classroom monitoring & attendance policy.");
      return;
    }

    setIsProcessing(true);
    try {
      // 1. Create the student account first if the visitor is not signed in
      if (!user) {
        await register({ name: name.trim(), email: email.trim(), password, phone: phone.trim() || undefined });
      }

      // 2. Create order on our server (validates seats & enrollment)
      const order = await api.post<OrderResponse>("/payments/order", {
        courseSlug: course.slug,
        batchId: selectedBatch.id,
        educationLevel,
      });

      const ready = await loadRazorpay();
      if (!ready || !window.Razorpay) {
        throw new Error("Could not load the Razorpay payment window. Check your internet connection and try again.");
      }

      succeededRef.current = false;
      const rzp = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        order_id: order.orderId,
        name: "Ignited Dreams Integrated",
        description: `${order.course.code} — ${order.batch.name}`,
        image: "/images/logo.png",
        prefill: order.prefill,
        notes: { receipt: order.receiptNumber },
        theme: { color: "#F5C400" },
        handler: (resp: RazorpaySuccess) => verifyPayment(resp),
        modal: {
          ondismiss: () => {
            setIsProcessing(false);
            if (!succeededRef.current) {
              api.post("/payments/failure", { orderId: order.orderId, reason: "Checkout closed by user" }).catch(() => {});
            }
          },
        },
      });
      rzp.on("payment.failed", (resp) => {
        setError(`Payment failed: ${resp.error?.description || "please try again or use another method"}.`);
      });
      rzp.open();
    } catch (err) {
      setIsProcessing(false);
      if (err instanceof ApiError && err.statusCode === 409 && /already enrolled/i.test(err.message)) {
        setAlreadyEnrolled(true);
        return;
      }
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  };

  // ---------- Success: admission card ----------
  if (receipt) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Card padding="lg" variant="default" className="border-2 border-emerald-500 shadow-xl bg-white print:shadow-none">
          <div className="text-center pb-6 border-b border-slate-200">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3 shadow-sm">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <Badge variant="yellow" size="sm" className="mb-2">
              Official Admission Receipt
            </Badge>
            <h2 className="text-2xl font-black text-slate-900 font-heading">Receipt No: {receipt.receiptNumber}</h2>
            <p className="text-xs text-slate-500 mt-1">
              {receipt.user.name} • {receipt.user.email}
              {receipt.user.phone ? ` • ${receipt.user.phone}` : ""}
            </p>
          </div>

          <div className="py-6 space-y-3 text-sm">
            {[
              ["Program", `${receipt.course.title} (${receipt.course.code})`],
              ["Batch", `${receipt.batch.name}${receipt.batch.scheduleLabel ? ` — ${receipt.batch.scheduleLabel}` : ""}`],
              ["Batch Starts", formatDate(receipt.batch.startDate)],
              ["Lead Faculty", receipt.batch.instructor.name],
              ["Registration No.", receipt.user.studentProfile?.registrationNumber || "-"],
              ["Amount Paid", `${formatPaise(receipt.amount)} (Tax Included)`],
              ["Payment ID", receipt.providerPaymentId || "-"],
              ["Paid On", receipt.paidAt ? formatDate(receipt.paidAt, { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "-"],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between gap-4 p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-xs font-semibold text-slate-500 shrink-0">{label}:</span>
                <span className="font-bold text-slate-900 text-xs text-right">{value}</span>
              </div>
            ))}

            <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900">
              <strong>Class Attendance Protocol:</strong> Your webcam will be enabled when you join live classes for batch proctoring and attendance.
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row gap-3 print:hidden">
            <Link href="/student/dashboard" className="flex-1">
              <Button variant="primary" size="lg" className="w-full font-bold shadow-md justify-center" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Enter Student Portal
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="justify-center" leftIcon={<Printer className="w-4 h-4" />} onClick={() => window.print()}>
              Print Receipt
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (courseError) {
    return (
      <div className="max-w-xl mx-auto p-6 rounded-2xl bg-red-50 border border-red-200 text-sm text-red-800 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold">{courseError}</p>
          <Link href="/courses" className="underline font-semibold mt-1 inline-block">
            Browse all courses
          </Link>
        </div>
      </div>
    );
  }

  if (!course || authLoading) {
    return <div className="max-w-xl mx-auto h-96 rounded-2xl bg-white border border-slate-200 animate-pulse" />;
  }

  const openBatches = course.batches;
  const canPay = gatewayEnabled && openBatches.some((b) => b.seatsLeft > 0) && (!user || isStudent);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Left: Student Details & Payment (7 Cols) */}
      <div className="lg:col-span-7 space-y-6">
        {testMode && (
          <div className="p-3 rounded-xl bg-sky-50 border border-sky-200 text-xs text-sky-900">
            <strong>Razorpay test mode:</strong> no real money is charged. Use UPI ID <code>success@razorpay</code> or test card 4111 1111 1111 1111 (any future expiry, any CVV).
          </div>
        )}

        {gatewayEnabled === false && (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 text-xs text-amber-900 flex gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              Online payment is temporarily unavailable. Please <Link href="/contact" className="underline font-bold">contact admissions</Link> to reserve your seat.
            </span>
          </div>
        )}

        {user && !isStudent && (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 text-xs text-amber-900">
            You are signed in as <strong>{user.role.toLowerCase()}</strong>. Admissions can only be paid from a student account.
          </div>
        )}

        {alreadyEnrolled && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-sm text-emerald-900 flex items-center justify-between gap-3">
            <span>You are already enrolled in this course.</span>
            <Link href="/student/dashboard" className="font-bold underline whitespace-nowrap">
              Go to portal →
            </Link>
          </div>
        )}

        <Card padding="lg" variant="default" className="shadow-sm border border-slate-200">
          <form onSubmit={handlePayment} className="space-y-5">
            <div>
              <h2 className="text-lg font-bold text-slate-900 font-heading mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-aviation-yellow text-slate-900 text-xs font-bold flex items-center justify-center">1</span>
                Select Your Batch
              </h2>
              <div className="space-y-2">
                {openBatches.length === 0 && (
                  <p className="text-sm text-slate-500">No batch is open for admission right now.</p>
                )}
                {openBatches.map((b) => {
                  const full = b.seatsLeft <= 0;
                  return (
                    <label
                      key={b.id}
                      className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all ${
                        full
                          ? "opacity-50 cursor-not-allowed border-slate-200"
                          : batchId === b.id
                          ? "border-amber-500 bg-amber-50/60 cursor-pointer"
                          : "border-slate-200 hover:bg-slate-50 cursor-pointer"
                      }`}
                    >
                      <input
                        type="radio"
                        name="batch"
                        value={b.id}
                        disabled={full}
                        checked={batchId === b.id}
                        onChange={() => setBatchId(b.id)}
                        className="mt-1 accent-amber-500"
                      />
                      <div className="flex-1">
                        <div className="text-sm font-bold text-slate-900">{b.name}</div>
                        <div className="text-xs text-slate-500">
                          {b.scheduleLabel ? `${b.scheduleLabel} • ` : ""}Starts {formatDate(b.startDate)}
                        </div>
                      </div>
                      <span className={`text-[11px] font-bold ${full ? "text-red-600" : "text-emerald-700"}`}>
                        {full ? "Full" : `${b.seatsLeft} seats left`}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200">
              <h2 className="text-lg font-bold text-slate-900 font-heading mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-aviation-yellow text-slate-900 text-xs font-bold flex items-center justify-center">2</span>
                Student Information
              </h2>

              {user ? (
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-700 mb-4">
                  Paying as <strong>{user.name}</strong> ({user.email})
                </div>
              ) : (
                <div className="space-y-4 mb-4">
                  <p className="text-xs text-slate-500">
                    Already have an account?{" "}
                    <Link href={`/login?next=${encodeURIComponent(`/checkout?course=${course.slug}`)}`} className="font-bold text-amber-700 underline">
                      Log in
                    </Link>{" "}
                    first. Otherwise we&apos;ll create your student account now.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Full Name *</label>
                      <input type="text" required minLength={2} value={name} onChange={(e) => setName(e.target.value)} className={inputClass} autoComplete="name" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Phone Number *</label>
                      <input type="tel" required minLength={10} value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} autoComplete="tel" placeholder="+91" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Email Address *</label>
                      <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} autoComplete="email" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Create Password *</label>
                      <input
                        type="password"
                        required
                        minLength={8}
                        pattern="(?=.*[A-Z])(?=.*[0-9]).{8,}"
                        title="At least 8 characters with one uppercase letter and one number"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={inputClass}
                        autoComplete="new-password"
                      />
                      <p className="text-[10px] text-slate-500 mt-1">8+ characters, 1 uppercase letter, 1 number</p>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Education Status *</label>
                <select value={educationLevel} onChange={(e) => setEducationLevel(e.target.value)} className={inputClass}>
                  {EDUCATION_LEVELS.map((lvl) => (
                    <option key={lvl}>{lvl}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Mandatory Academic Rules Confirmation */}
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-2">
              <div className="font-bold flex items-center gap-1.5 text-amber-950">
                <Camera className="w-4 h-4 text-amber-700" />
                Classroom Monitoring & Attendance Policy:
              </div>
              <ul className="list-disc pl-4 space-y-1 text-slate-700 text-[11.5px]">
                <li>
                  Classes are conducted <strong>live on this website</strong> (3 hours daily: 2h lecture + 1h doubt clearance, 5 days a week).
                </li>
                <li>
                  <strong>Monitoring:</strong> Trainers and students keep webcams on during class hours for academic discipline.
                </li>
                <li>
                  <strong>7-Day Recording Access:</strong> Class recordings stay on your dashboard for 7 days, then move to the academy&apos;s secure 2-year archive.
                </li>
                <li>
                  <strong>Weekend Project:</strong> Every weekend, students submit a written report or speech presentation on the topics learned.
                </li>
              </ul>
              <label className="flex items-center gap-2 pt-1 font-semibold text-amber-950 cursor-pointer">
                <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="accent-amber-600" />
                I have read and agree to these rules.
              </label>
            </div>

            {error && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isProcessing}
              disabled={!canPay || !selectedBatch || isProcessing}
              className="w-full font-bold shadow-md text-base py-3.5"
              rightIcon={<Lock className="w-4 h-4" />}
            >
              {selectedBatch ? `Pay ${formatInr(course.price)} Securely` : "Select a batch"}
            </Button>
            <p className="text-[11px] text-center text-slate-500">
              Payments are processed by Razorpay — UPI, cards, net banking and wallets accepted. We never see your card details.
            </p>
          </form>
        </Card>
      </div>

      {/* Right: Fee Breakdown & Course Summary (5 Cols) */}
      <div className="lg:col-span-5 space-y-6">
        <Card padding="lg" variant="default" className="border-2 border-aviation-border shadow-sm">
          <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-aviation-yellowDeep bg-aviation-yellow/15 px-2.5 py-1 rounded">
            {course.code}
          </span>
          <h3 className="text-xl font-bold text-slate-900 font-heading mt-2">{course.title}</h3>
          <p className="text-xs text-slate-600 mt-1 line-clamp-3">{course.description}</p>

          <div className="my-6 p-4 rounded-xl bg-slate-900 text-white space-y-3">
            {course.marketPrice ? (
              <>
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span>Other Private Academies:</span>
                  <span className="line-through text-slate-400 font-mono">{formatInr(course.marketPrice)} + GST</span>
                </div>
                <div className="flex items-center justify-between text-xs text-emerald-400 font-semibold">
                  <span>You save:</span>
                  <span>{formatInr(course.marketPrice - course.price)}</span>
                </div>
              </>
            ) : null}
            <div className="pt-3 border-t border-slate-700 flex items-baseline justify-between">
              <div>
                <div className="text-xs text-slate-400 font-medium">Net Fee (All Inclusive):</div>
                <div className="text-2xl font-black text-aviation-yellow">{formatInr(course.price)}</div>
              </div>
              <Badge variant="yellow" size="sm">
                Tax Included
              </Badge>
            </div>
          </div>

          <div className="space-y-3 text-xs text-slate-700">
            {selectedBatch && (
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-aviation-yellowDeep shrink-0" />
                <span>
                  <strong>Batch:</strong> {selectedBatch.name} ({selectedBatch.capacity} students max)
                </span>
              </div>
            )}
            {course.facultyName && (
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-aviation-yellowDeep shrink-0" />
                <span>
                  <strong>Faculty:</strong> {course.facultyName}
                  {course.facultyTitle ? ` — ${course.facultyTitle}` : ""}
                </span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-aviation-yellowDeep shrink-0" />
              <span>
                <strong>Duration:</strong> {course.durationLabel || `${course.durationHours} Hours`}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Download className="w-4 h-4 text-aviation-yellowDeep shrink-0" />
              <span>
                <strong>Recordings:</strong> 7-day student replay &amp; download
              </span>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-200 text-[11px] text-slate-500 text-center">
            Questions before paying? Call <strong>7012002405</strong> or{" "}
            <Link href="/contact" className="underline">
              send us a message
            </Link>
            .
          </div>
        </Card>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8 max-w-[1280px] mx-auto w-full">
        <div className="mb-8 text-center max-w-3xl mx-auto print:hidden">
          <Badge variant="yellow" size="sm" className="mb-3">
            Official Admission
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-heading">
            Enroll &amp; Pay Course Fee Online
          </h1>
          <p className="text-sm text-slate-600 mt-2 leading-relaxed">
            Choose your batch, pay securely via Razorpay, and get instant access to live classes and recordings in your student portal.
          </p>
        </div>
        <React.Suspense fallback={<div className="max-w-xl mx-auto h-96 rounded-2xl bg-white border border-slate-200 animate-pulse" />}>
          <CheckoutContent />
        </React.Suspense>
      </main>
      <Footer />
    </div>
  );
}
