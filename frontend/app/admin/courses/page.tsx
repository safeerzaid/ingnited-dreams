"use client";

import React, { useState, useEffect } from "react";
import api from "@/lib/api";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { formatInr } from "@/lib/format";
import type { SyllabusModule } from "@/lib/types";
import { Plus, Pencil, AlertCircle } from "lucide-react";

interface CourseItem {
  id: string;
  title: string;
  slug: string;
  code: string;
  description: string;
  thumbnail: string | null;
  status: string;
  durationHours: number;
  durationLabel: string | null;
  price: number;
  marketPrice: number | null;
  category: string | null;
  level: string | null;
  syllabus: string | null;
  facultyName: string | null;
  facultyTitle: string | null;
  facultyBio: string | null;
  _count?: { batches: number; classSessions: number; enrollments: number };
}

const EMPTY_FORM = {
  title: "",
  slug: "",
  code: "",
  description: "",
  thumbnail: "",
  durationHours: 160,
  durationLabel: "6 Months Intensive (3 Hours/Day, 5 Days/Week)",
  price: 25000,
  marketPrice: "" as number | "",
  category: "",
  level: "",
  facultyName: "",
  facultyTitle: "",
  facultyBio: "",
  syllabusText: "",
  status: "DRAFT",
};

type CourseForm = typeof EMPTY_FORM;

/** One module per line: Module name | 40 Hours | Topics covered */
function syllabusToText(raw: string | null) {
  if (!raw) return "";
  try {
    return (JSON.parse(raw) as SyllabusModule[])
      .map((m) => [m.name, m.hours || "", m.topics || ""].join(" | "))
      .join("\n");
  } catch {
    return "";
  }
}

function textToSyllabus(text: string): SyllabusModule[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [name, hours, ...topics] = line.split("|").map((p) => p.trim());
      return { name, hours: hours || undefined, topics: topics.join(" | ") || undefined };
    });
}

const inputClass = "w-full px-3 py-2 rounded-lg border border-aviation-border text-xs";
const labelClass = "block text-xs font-bold text-aviation-charcoal uppercase tracking-wider mb-1";

const STATUS_BADGE: Record<string, "ready" | "scheduled" | "expired"> = {
  PUBLISHED: "ready",
  DRAFT: "scheduled",
  ARCHIVED: "expired",
};

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<CourseForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const loadCourses = async () => {
    try {
      setLoading(true);
      setLoadError(null);
      setCourses(await api.get<CourseItem[]>("/admin/courses?limit=100"));
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setFormData(EMPTY_FORM);
    setFormError(null);
    setModalOpen(true);
  };

  const openEdit = (c: CourseItem) => {
    setEditingId(c.id);
    setFormError(null);
    setFormData({
      title: c.title,
      slug: c.slug,
      code: c.code,
      description: c.description,
      thumbnail: c.thumbnail || "",
      durationHours: c.durationHours,
      durationLabel: c.durationLabel || "",
      price: c.price,
      marketPrice: c.marketPrice ?? "",
      category: c.category || "",
      level: c.level || "",
      facultyName: c.facultyName || "",
      facultyTitle: c.facultyTitle || "",
      facultyBio: c.facultyBio || "",
      syllabusText: syllabusToText(c.syllabus),
      status: c.status,
    });
    setModalOpen(true);
  };

  const set = <K extends keyof CourseForm>(key: K, value: CourseForm[K]) => setFormData((f) => ({ ...f, [key]: value }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFormError(null);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { syllabusText, marketPrice, ...rest } = formData;
    const payload = {
      ...rest,
      durationHours: Number(formData.durationHours),
      price: Number(formData.price),
      marketPrice: marketPrice === "" ? null : Number(marketPrice),
      syllabus: textToSyllabus(syllabusText),
    };
    try {
      if (editingId) {
        await api.patch(`/admin/courses/${editingId}`, payload);
      } else {
        await api.post("/admin/courses", payload);
      }
      setModalOpen(false);
      loadCourses();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : "Failed to save course");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-aviation-border pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-aviation-black tracking-tight font-heading">
            Course Curriculum Directory
          </h1>
          <p className="text-xs sm:text-sm text-aviation-muted mt-1">
            Manage courses, fees, syllabus and publication status. Only PUBLISHED courses appear on the website and checkout.
          </p>
        </div>

        <Button variant="primary" size="sm" onClick={openCreate} leftIcon={<Plus className="w-4 h-4" />}>
          Create Course
        </Button>
      </div>

      {loadError && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" /> {loadError}
        </div>
      )}

      {loading ? (
        <div className="text-sm text-aviation-muted">Loading courses…</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {courses.length === 0 && !loadError && <p className="text-sm text-aviation-muted">No courses yet.</p>}
          {courses.map((course) => (
            <Card key={course.id} padding="lg" variant="default" className="flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant="yellow" size="sm">
                    {course.code}
                  </Badge>
                  <Badge variant={STATUS_BADGE[course.status] || "default"} size="sm">
                    {course.status}
                  </Badge>
                </div>

                <h3 className="text-lg font-bold text-aviation-black font-heading leading-snug">{course.title}</h3>

                <p className="text-xs text-aviation-muted leading-relaxed line-clamp-3">{course.description}</p>

                <div className="pt-2 text-xs text-aviation-charcoal flex items-center justify-between font-mono">
                  <span>
                    Fee: <strong>{formatInr(course.price)}</strong>
                  </span>
                  <span>{course.durationHours} hrs</span>
                </div>
              </div>

              <div className="pt-4 border-t border-aviation-border mt-4 flex items-center justify-between text-xs text-aviation-muted">
                <span>
                  Batches <strong className="text-aviation-black">{course._count?.batches || 0}</strong> · Students{" "}
                  <strong className="text-aviation-black">{course._count?.enrollments || 0}</strong>
                </span>
                <Button variant="outline" size="sm" onClick={() => openEdit(course)} leftIcon={<Pencil className="w-3.5 h-3.5" />}>
                  Edit
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? "Edit Course" : "Create New Course"}
        description="Fee is the full amount (INR, tax inclusive) students pay at checkout."
        maxWidth="xl"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className={labelClass}>Course Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => {
                const title = e.target.value;
                setFormData((f) => ({
                  ...f,
                  title,
                  // Slug follows the title only while creating; it is part of public URLs once live
                  slug: editingId ? f.slug : title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
                }));
              }}
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className={labelClass}>Course Code *</label>
              <input type="text" required value={formData.code} onChange={(e) => set("code", e.target.value.toUpperCase())} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>URL Slug *</label>
              <input
                type="text"
                required
                pattern="[a-z0-9-]+"
                value={formData.slug}
                onChange={(e) => set("slug", e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Status *</label>
              <select value={formData.status} onChange={(e) => set("status", e.target.value)} className={inputClass}>
                <option value="DRAFT">Draft (hidden)</option>
                <option value="PUBLISHED">Published</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className={labelClass}>Fee (₹) *</label>
              <input type="number" required min={0} value={formData.price} onChange={(e) => set("price", Number(e.target.value))} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Market Comparison (₹)</label>
              <input
                type="number"
                min={0}
                value={formData.marketPrice}
                onChange={(e) => set("marketPrice", e.target.value === "" ? "" : Number(e.target.value))}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Total Hours *</label>
              <input type="number" required min={1} value={formData.durationHours} onChange={(e) => set("durationHours", Number(e.target.value))} className={inputClass} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className={labelClass}>Category</label>
              <input type="text" value={formData.category} onChange={(e) => set("category", e.target.value)} placeholder="Aviation Management" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Level Tag</label>
              <input type="text" value={formData.level} onChange={(e) => set("level", e.target.value)} placeholder="Flagship (6 Months)" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Duration Label</label>
              <input type="text" value={formData.durationLabel} onChange={(e) => set("durationLabel", e.target.value)} className={inputClass} />
            </div>
          </div>

          <div>
            <label className={labelClass}>Description *</label>
            <textarea required minLength={10} rows={3} value={formData.description} onChange={(e) => set("description", e.target.value)} className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>Thumbnail Image URL</label>
            <input type="url" value={formData.thumbnail} onChange={(e) => set("thumbnail", e.target.value)} placeholder="https://…" className={inputClass} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className={labelClass}>Faculty Name</label>
              <input type="text" value={formData.facultyName} onChange={(e) => set("facultyName", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Faculty Title</label>
              <input type="text" value={formData.facultyTitle} onChange={(e) => set("facultyTitle", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Faculty Experience</label>
              <input type="text" value={formData.facultyBio} onChange={(e) => set("facultyBio", e.target.value)} className={inputClass} />
            </div>
          </div>

          <div>
            <label className={labelClass}>Syllabus Modules</label>
            <textarea
              rows={6}
              value={formData.syllabusText}
              onChange={(e) => set("syllabusText", e.target.value)}
              placeholder={"One module per line:\nModule name | 40 Hours | Topics covered"}
              className={`${inputClass} font-mono`}
            />
            <p className="text-[10px] text-aviation-muted mt-1">Format per line: Module name | Hours | Topics</p>
          </div>

          {formError && <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">{formError}</p>}

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-aviation-border">
            <Button variant="ghost" size="sm" type="button" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={saving}>
              {editingId ? "Save Changes" : "Create Course"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
