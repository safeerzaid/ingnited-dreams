"use client";

import React, { useState, useEffect } from "react";
import api from "@/lib/api";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { formatDate } from "@/lib/format";
import { Plus, Pencil, UserPlus, AlertCircle } from "lucide-react";

interface BatchItem {
  id: string;
  name: string;
  code: string;
  startDate: string;
  endDate: string;
  status: string;
  capacity: number;
  scheduleLabel: string | null;
  course: { id: string; title: string; code: string };
  instructor: { id: string; name: string; email: string };
  _count?: { enrollments: number; classSessions: number };
}

interface Option {
  id: string;
  title?: string;
  name?: string;
  code?: string;
  email?: string;
}

const STATUSES = ["UPCOMING", "ACTIVE", "COMPLETED", "CANCELLED"];
const STATUS_BADGE: Record<string, "ready" | "scheduled" | "expired" | "live"> = {
  ACTIVE: "live",
  UPCOMING: "scheduled",
  COMPLETED: "ready",
  CANCELLED: "expired",
};

const inputClass = "w-full px-3 py-2 rounded-lg border border-aviation-border text-xs bg-white";
const labelClass = "block text-xs font-bold text-aviation-charcoal uppercase tracking-wider mb-1";

const toDateInput = (iso: string) => iso.slice(0, 10);
// Date inputs give local dates; store as IST midnight
const fromDateInput = (d: string) => new Date(`${d}T00:00:00+05:30`).toISOString();

const EMPTY_FORM = {
  name: "",
  code: "",
  courseId: "",
  instructorId: "",
  startDate: "",
  endDate: "",
  status: "UPCOMING",
  capacity: 50,
  scheduleLabel: "",
};

export default function AdminBatchesPage() {
  const [batches, setBatches] = useState<BatchItem[]>([]);
  const [courses, setCourses] = useState<Option[]>([]);
  const [instructors, setInstructors] = useState<Option[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [enrollBatch, setEnrollBatch] = useState<BatchItem | null>(null);
  const [studentQuery, setStudentQuery] = useState("");
  const [studentResults, setStudentResults] = useState<Option[]>([]);
  const [enrollMsg, setEnrollMsg] = useState<string | null>(null);

  const loadBatches = async () => {
    try {
      setLoading(true);
      setLoadError(null);
      setBatches(await api.get<BatchItem[]>("/admin/batches?limit=100"));
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Failed to load batches");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBatches();
    api.get<Option[]>("/admin/courses?limit=100").then(setCourses).catch(() => {});
    api.get<Option[]>("/admin/instructors?limit=100").then(setInstructors).catch(() => {});
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...EMPTY_FORM, courseId: courses[0]?.id || "", instructorId: instructors[0]?.id || "" });
    setFormError(null);
    setModalOpen(true);
  };

  const openEdit = (b: BatchItem) => {
    setEditingId(b.id);
    setForm({
      name: b.name,
      code: b.code,
      courseId: b.course.id,
      instructorId: b.instructor.id,
      startDate: toDateInput(b.startDate),
      endDate: toDateInput(b.endDate),
      status: b.status,
      capacity: b.capacity,
      scheduleLabel: b.scheduleLabel || "",
    });
    setFormError(null);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFormError(null);
    const payload = {
      ...form,
      capacity: Number(form.capacity),
      startDate: fromDateInput(form.startDate),
      endDate: fromDateInput(form.endDate),
    };
    try {
      if (editingId) {
        await api.patch(`/admin/batches/${editingId}`, payload);
      } else {
        await api.post("/admin/batches", payload);
      }
      setModalOpen(false);
      loadBatches();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to save batch");
    } finally {
      setSaving(false);
    }
  };

  const searchStudents = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnrollMsg(null);
    try {
      setStudentResults(await api.get<Option[]>(`/admin/students?search=${encodeURIComponent(studentQuery)}&limit=10`));
    } catch (err) {
      setEnrollMsg(err instanceof Error ? err.message : "Search failed");
    }
  };

  const enrollStudent = async (studentId: string) => {
    if (!enrollBatch) return;
    try {
      await api.post("/admin/batches/enroll", { studentId, batchId: enrollBatch.id, courseId: enrollBatch.course.id });
      setEnrollMsg("Student enrolled successfully.");
      loadBatches();
    } catch (err) {
      setEnrollMsg(err instanceof Error ? err.message : "Enrollment failed");
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-aviation-border pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-aviation-black tracking-tight font-heading">Academic Batches</h1>
          <p className="text-xs sm:text-sm text-aviation-muted mt-1">
            UPCOMING and ACTIVE batches with free seats are open for online admission.
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={openCreate} leftIcon={<Plus className="w-4 h-4" />}>
          Create Batch
        </Button>
      </div>

      {loadError && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" /> {loadError}
        </div>
      )}

      {loading ? (
        <div className="text-sm text-aviation-muted">Loading batches…</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {batches.length === 0 && !loadError && <p className="text-sm text-aviation-muted">No batches yet.</p>}
          {batches.map((batch) => {
            const enrolled = batch._count?.enrollments || 0;
            return (
              <Card key={batch.id} padding="lg" variant="default" className="space-y-4">
                <div className="flex items-center justify-between">
                  <Badge variant="yellow" size="sm">
                    {batch.code}
                  </Badge>
                  <Badge variant={STATUS_BADGE[batch.status] || "default"} size="sm">
                    {batch.status}
                  </Badge>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-aviation-black font-heading">{batch.name}</h3>
                  <div className="text-xs text-aviation-muted mt-0.5">{batch.course.title}</div>
                </div>

                <div className="p-3.5 rounded-lg bg-aviation-offWhite border border-aviation-border space-y-1.5 text-xs text-aviation-charcoal">
                  <div>
                    Lead Faculty: <span className="font-semibold">{batch.instructor.name}</span>
                  </div>
                  {batch.scheduleLabel && <div>Timing: {batch.scheduleLabel}</div>}
                  <div className="font-mono text-aviation-muted">
                    {formatDate(batch.startDate)} — {formatDate(batch.endDate)}
                  </div>
                </div>

                <div className="pt-3 border-t border-aviation-border flex flex-wrap items-center justify-between gap-2 text-xs text-aviation-muted">
                  <span>
                    Seats: <strong className="text-aviation-black font-mono">{enrolled}/{batch.capacity}</strong> · Classes:{" "}
                    <strong className="text-aviation-black font-mono">{batch._count?.classSessions || 0}</strong>
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      leftIcon={<UserPlus className="w-3.5 h-3.5" />}
                      onClick={() => {
                        setEnrollBatch(batch);
                        setStudentQuery("");
                        setStudentResults([]);
                        setEnrollMsg(null);
                      }}
                    >
                      Enroll
                    </Button>
                    <Button variant="outline" size="sm" leftIcon={<Pencil className="w-3.5 h-3.5" />} onClick={() => openEdit(batch)}>
                      Edit
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? "Edit Batch" : "Create Batch"} maxWidth="lg">
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Batch Name *</label>
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Cohort Alpha (Morning)" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Batch Code *</label>
              <input
                required
                disabled={!!editingId}
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                placeholder="TLM-2027-ALPHA"
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Course *</label>
            <select required disabled={!!editingId} value={form.courseId} onChange={(e) => setForm({ ...form, courseId: e.target.value })} className={inputClass}>
              <option value="">Select course</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code} — {c.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>Lead Instructor *</label>
            <select required value={form.instructorId} onChange={(e) => setForm({ ...form, instructorId: e.target.value })} className={inputClass}>
              <option value="">Select instructor</option>
              {instructors.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.name} ({i.email})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Start Date *</label>
              <input type="date" required value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>End Date *</label>
              <input type="date" required value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} className={inputClass} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className={labelClass}>Seats *</label>
              <input type="number" min={1} required value={form.capacity} onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Status *</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className={inputClass}>
                {STATUSES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Timing Label</label>
              <input value={form.scheduleLabel} onChange={(e) => setForm({ ...form, scheduleLabel: e.target.value })} placeholder="09:00 - 12:00 IST (Mon-Fri)" className={inputClass} />
            </div>
          </div>

          {formError && <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">{formError}</p>}

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-aviation-border">
            <Button variant="ghost" size="sm" type="button" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={saving}>
              {editingId ? "Save Changes" : "Create Batch"}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={!!enrollBatch}
        onClose={() => setEnrollBatch(null)}
        title={`Enroll Student — ${enrollBatch?.name || ""}`}
        description="For admissions paid offline (cash / bank transfer). Online payments enroll students automatically."
      >
        <form onSubmit={searchStudents} className="flex gap-2 mb-4">
          <input
            required
            value={studentQuery}
            onChange={(e) => setStudentQuery(e.target.value)}
            placeholder="Search student by name or email"
            className={inputClass}
          />
          <Button type="submit" size="sm" variant="dark">
            Search
          </Button>
        </form>
        <div className="space-y-2">
          {studentResults.map((s) => (
            <div key={s.id} className="flex items-center justify-between p-2.5 rounded-lg border border-aviation-border text-xs">
              <span>
                <strong>{s.name}</strong> · {s.email}
              </span>
              <Button size="sm" variant="primary" onClick={() => enrollStudent(s.id)}>
                Enroll
              </Button>
            </div>
          ))}
          {studentResults.length === 0 && (
            <p className="text-[11px] text-aviation-muted">The student must first create an account via Register.</p>
          )}
        </div>
        {enrollMsg && <p className="text-xs mt-3 font-semibold text-aviation-charcoal">{enrollMsg}</p>}
      </Modal>
    </div>
  );
}
