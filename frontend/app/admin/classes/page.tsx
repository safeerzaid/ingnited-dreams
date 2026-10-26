"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import api from "@/lib/api";
import LoadErrorBanner from "@/components/ui/LoadErrorBanner";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { Plus, Video, XCircle, Pencil } from "lucide-react";

interface AdminClassItem {
  id: string;
  title: string;
  description?: string | null;
  startTime: string;
  endTime: string;
  status: string;
  recordingEnabled: boolean;
  course: { id: string; title: string; code: string };
  batch: { id: string; name: string };
  instructor: { id: string; name: string };
}

interface BatchOption {
  id: string;
  name: string;
  status: string;
  course: { id: string; title: string; code: string };
  instructor: { id: string; name: string };
}

interface InstructorOption {
  id: string;
  name: string;
}

const inputClass = "w-full px-3 py-2 rounded-lg border border-aviation-border text-xs bg-white";
const labelClass = "block text-xs font-bold text-aviation-charcoal uppercase tracking-wider mb-1";

/** Combines a date (YYYY-MM-DD) and time (HH:mm) entered in IST into an ISO timestamp */
const istToIso = (date: string, time: string) => new Date(`${date}T${time}:00+05:30`).toISOString();
const isoToIstParts = (iso: string) => {
  const d = new Date(new Date(iso).getTime() + 5.5 * 3600 * 1000);
  return { date: d.toISOString().slice(0, 10), time: d.toISOString().slice(11, 16) };
};

const EMPTY_FORM = {
  batchId: "",
  instructorId: "",
  title: "",
  description: "",
  date: "",
  start: "09:00",
  end: "12:00",
  recordingEnabled: true,
};

export default function AdminClassesPage() {
  const [classes, setClasses] = useState<AdminClassItem[]>([]);
  const [batches, setBatches] = useState<BatchOption[]>([]);
  const [instructors, setInstructors] = useState<InstructorOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showPast, setShowPast] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<AdminClassItem | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const loadClasses = async () => {
    try {
      setLoading(true);
      setLoadError(null);
      setClasses(await api.get<AdminClassItem[]>("/admin/classes?limit=500"));
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClasses();
    api.get<BatchOption[]>("/admin/batches?limit=100").then(setBatches).catch(() => {});
    api.get<InstructorOption[]>("/admin/instructors?limit=100").then(setInstructors).catch(() => {});
  }, []);

  const visible = useMemo(() => {
    const now = Date.now();
    const upcoming = classes
      .filter((c) => c.status === "LIVE" || (c.status === "SCHEDULED" && new Date(c.endTime).getTime() > now))
      .sort((a, b) => +new Date(a.startTime) - +new Date(b.startTime));
    const past = classes
      .filter((c) => !upcoming.includes(c))
      .sort((a, b) => +new Date(b.startTime) - +new Date(a.startTime));
    return showPast ? past : upcoming;
  }, [classes, showPast]);

  const openBatches = batches.filter((b) => b.status === "UPCOMING" || b.status === "ACTIVE");

  const openCreate = () => {
    const first = openBatches[0];
    setEditing(null);
    setForm({ ...EMPTY_FORM, batchId: first?.id || "", instructorId: first?.instructor.id || "" });
    setFormError(null);
    setModalOpen(true);
  };

  const openEdit = (cls: AdminClassItem) => {
    const s = isoToIstParts(cls.startTime);
    const e = isoToIstParts(cls.endTime);
    setEditing(cls);
    setForm({
      batchId: cls.batch.id,
      instructorId: cls.instructor.id,
      title: cls.title,
      description: cls.description || "",
      date: s.date,
      start: s.time,
      end: e.time,
      recordingEnabled: cls.recordingEnabled,
    });
    setFormError(null);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFormError(null);
    const startTime = istToIso(form.date, form.start);
    const endTime = istToIso(form.date, form.end);
    try {
      if (editing) {
        await api.patch(`/admin/classes/${editing.id}`, {
          title: form.title,
          description: form.description || undefined,
          startTime,
          endTime,
          recordingEnabled: form.recordingEnabled,
        });
      } else {
        const batch = batches.find((b) => b.id === form.batchId);
        await api.post("/admin/classes", {
          title: form.title,
          description: form.description || undefined,
          courseId: batch?.course.id,
          batchId: form.batchId,
          instructorId: form.instructorId,
          startTime,
          endTime,
          recordingEnabled: form.recordingEnabled,
        });
      }
      setModalOpen(false);
      loadClasses();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to save class");
    } finally {
      setSaving(false);
    }
  };

  const cancelClass = async (cls: AdminClassItem) => {
    if (!window.confirm(`Cancel "${cls.title}"? Students in ${cls.batch.name} will be notified.`)) return;
    try {
      await api.patch(`/admin/classes/${cls.id}`, { status: "CANCELLED" });
      loadClasses();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Could not cancel class");
    }
  };

  return (
    <div className="space-y-6">
      {loadError && <LoadErrorBanner message={loadError} onRetry={loadClasses} />}
      <div className="border-b border-aviation-border pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-aviation-black tracking-tight font-heading">
            Class Scheduling &amp; Operations
          </h1>
          <p className="text-xs sm:text-sm text-aviation-muted mt-1">
            Schedule live classes for each batch. Times are in IST. Students can join 15 minutes before start.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowPast((v) => !v)}>
            {showPast ? "Show Upcoming" : "Show Past"}
          </Button>
          <Button variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={openCreate}>
            Schedule Class
          </Button>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-aviation-muted">Loading classes…</p>
      ) : visible.length === 0 ? (
        <p className="text-sm text-aviation-muted">{showPast ? "No past classes." : "No upcoming classes scheduled."}</p>
      ) : (
        <div className="space-y-4">
          {visible.map((cls) => {
            const dateObj = new Date(cls.startTime);
            const editable = cls.status === "SCHEDULED";
            return (
              <Card key={cls.id} padding="md" variant="default" className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={cls.status === "LIVE" ? "live" : cls.status === "CANCELLED" ? "expired" : cls.status === "COMPLETED" ? "default" : "scheduled"}
                      size="sm"
                      dot={cls.status === "LIVE"}
                    >
                      {cls.status}
                    </Badge>
                    <span className="text-xs font-mono font-bold text-aviation-muted">
                      {cls.course.code} • {cls.batch.name}
                    </span>
                  </div>
                  <h3 className="font-bold text-base text-aviation-black font-heading">{cls.title}</h3>
                  <div className="text-xs text-aviation-muted font-mono flex flex-wrap items-center gap-x-4 gap-y-1">
                    <span>
                      Instructor: <strong className="text-aviation-black">{cls.instructor.name}</strong>
                    </span>
                    <span>
                      {dateObj.toLocaleDateString("en-IN", { weekday: "short", month: "short", day: "numeric", timeZone: "Asia/Kolkata" })} •{" "}
                      {dateObj.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" })} –{" "}
                      {new Date(cls.endTime).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" })}
                    </span>
                    <span>Recording: {cls.recordingEnabled ? "On" : "Off"}</span>
                  </div>
                </div>

                <div className="shrink-0 flex gap-2">
                  {(cls.status === "LIVE" || cls.status === "SCHEDULED") && (
                    <Link href={`/classroom/${cls.id}`}>
                      <Button variant={cls.status === "LIVE" ? "primary" : "outline"} size="sm" leftIcon={<Video className="w-3.5 h-3.5" />}>
                        {cls.status === "LIVE" ? "Join / Monitor" : "Open Room"}
                      </Button>
                    </Link>
                  )}
                  {editable && (
                    <>
                      <Button variant="outline" size="sm" leftIcon={<Pencil className="w-3.5 h-3.5" />} onClick={() => openEdit(cls)}>
                        Edit
                      </Button>
                      <Button variant="danger" size="sm" leftIcon={<XCircle className="w-3.5 h-3.5" />} onClick={() => cancelClass(cls)}>
                        Cancel
                      </Button>
                    </>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Class" : "Schedule Live Class"} maxWidth="lg">
        <form onSubmit={handleSave} className="space-y-4">
          {!editing && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Batch *</label>
                <select
                  required
                  value={form.batchId}
                  onChange={(e) => {
                    const b = batches.find((x) => x.id === e.target.value);
                    setForm({ ...form, batchId: e.target.value, instructorId: b?.instructor.id || form.instructorId });
                  }}
                  className={inputClass}
                >
                  <option value="">Select batch</option>
                  {openBatches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.course.code} — {b.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Instructor *</label>
                <select required value={form.instructorId} onChange={(e) => setForm({ ...form, instructorId: e.target.value })} className={inputClass}>
                  <option value="">Select instructor</option>
                  {instructors.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <div>
            <label className={labelClass}>Class Title *</label>
            <input required minLength={3} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Module 2: SAP VL01N Outbound Delivery" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Description</label>
            <textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={inputClass} />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={labelClass}>Date *</label>
              <input type="date" required value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Start (IST) *</label>
              <input type="time" required value={form.start} onChange={(e) => setForm({ ...form, start: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>End (IST) *</label>
              <input type="time" required value={form.end} onChange={(e) => setForm({ ...form, end: e.target.value })} className={inputClass} />
            </div>
          </div>

          <label className="flex items-center gap-2 text-xs font-semibold text-aviation-charcoal">
            <input type="checkbox" checked={form.recordingEnabled} onChange={(e) => setForm({ ...form, recordingEnabled: e.target.checked })} />
            Record this class (available to students for 7 days)
          </label>

          {formError && <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">{formError}</p>}

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-aviation-border">
            <Button variant="ghost" size="sm" type="button" onClick={() => setModalOpen(false)}>
              Close
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={saving}>
              {editing ? "Save Changes" : "Schedule Class"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
