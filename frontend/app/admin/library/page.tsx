"use client";

import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import LoadErrorBanner from "@/components/ui/LoadErrorBanner";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { formatBytes, formatDate } from "@/lib/format";
import { Upload, Trash2, Eye, EyeOff, Download } from "lucide-react";

interface Resource {
  id: string;
  title: string;
  subtitle: string | null;
  category: string;
  author: string | null;
  description: string | null;
  fileName: string;
  mimeType: string;
  fileSize: number;
  published: boolean;
  createdAt: string;
  course: { id: string; title: string; code: string } | null;
}

interface CourseOption {
  id: string;
  title: string;
  code: string;
}

const inputClass = "w-full px-3 py-2 rounded-lg border border-aviation-border text-xs bg-white";
const labelClass = "block text-xs font-bold text-aviation-charcoal uppercase tracking-wider mb-1";
const EMPTY = { title: "", subtitle: "", category: "", author: "", description: "", courseId: "" };

export default function AdminLibraryPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      setResources(await api.get<Resource[]>("/admin/library"));
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    api.get<CourseOption[]>("/admin/courses?limit=100").then(setCourses).catch(() => {});
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setFormError("Choose a file to upload.");
      return;
    }
    setUploading(true);
    setFormError(null);
    const data = new FormData();
    Object.entries(form).forEach(([k, v]) => {
      if (v) data.append(k, v);
    });
    data.append("file", file);
    try {
      await api.post("/admin/library", data);
      setModalOpen(false);
      setForm(EMPTY);
      setFile(null);
      load();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const togglePublished = async (r: Resource) => {
    try {
      await api.patch(`/admin/library/${r.id}`, { published: !r.published });
      load();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Update failed");
    }
  };

  const remove = async (r: Resource) => {
    if (!window.confirm(`Delete "${r.title}" permanently? Students will lose access immediately.`)) return;
    try {
      await api.delete(`/admin/library/${r.id}`);
      load();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Delete failed");
    }
  };

  const download = async (r: Resource) => {
    try {
      const { url } = await api.get<{ url: string }>(`/admin/library/${r.id}/file`);
      window.location.href = url;
    } catch (err) {
      alert(err instanceof Error ? err.message : "Could not get file");
    }
  };

  return (
    <div className="space-y-6">
      {loadError && <LoadErrorBanner message={loadError} onRetry={load} />}
      <div className="border-b border-aviation-border pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-aviation-black tracking-tight font-heading">Study Library</h1>
          <p className="text-xs sm:text-sm text-aviation-muted mt-1">
            Upload handbooks and notes (PDF, EPUB, DOCX, PPTX, XLSX, ZIP — up to 50 MB). Files are stored privately in Cloudflare R2.
          </p>
        </div>
        <Button variant="primary" size="sm" leftIcon={<Upload className="w-4 h-4" />} onClick={() => setModalOpen(true)}>
          Upload Material
        </Button>
      </div>

      {loading ? (
        <p className="text-sm text-aviation-muted">Loading…</p>
      ) : resources.length === 0 ? (
        <p className="text-sm text-aviation-muted">No materials uploaded yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {resources.map((r) => (
            <Card key={r.id} padding="md" variant="default" className="space-y-3">
              <div className="flex items-center justify-between">
                <Badge variant="yellow" size="sm">
                  {r.category}
                </Badge>
                <Badge variant={r.published ? "ready" : "expired"} size="sm">
                  {r.published ? "Published" : "Hidden"}
                </Badge>
              </div>
              <div>
                <h3 className="text-sm font-bold text-aviation-black">{r.title}</h3>
                {r.subtitle && <p className="text-xs text-aviation-muted">{r.subtitle}</p>}
              </div>
              <div className="text-[11px] text-aviation-muted space-y-0.5">
                <div>
                  {r.fileName} · {formatBytes(r.fileSize)}
                </div>
                <div>
                  {r.course ? `${r.course.code} students only` : "All enrolled students"} · {formatDate(r.createdAt)}
                </div>
              </div>
              <div className="flex gap-2 pt-2 border-t border-aviation-border">
                <Button size="sm" variant="outline" leftIcon={<Download className="w-3.5 h-3.5" />} onClick={() => download(r)}>
                  File
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  leftIcon={r.published ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  onClick={() => togglePublished(r)}
                >
                  {r.published ? "Hide" : "Publish"}
                </Button>
                <Button size="sm" variant="danger" leftIcon={<Trash2 className="w-3.5 h-3.5" />} onClick={() => remove(r)}>
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Upload Study Material" maxWidth="lg">
        <form onSubmit={handleUpload} className="space-y-4">
          <div>
            <label className={labelClass}>Title *</label>
            <input required minLength={3} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Subtitle</label>
            <input value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} className={inputClass} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Category *</label>
              <input
                required
                list="library-categories"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                placeholder="SAP ERP"
                className={inputClass}
              />
              <datalist id="library-categories">
                {["SAP ERP", "Logistics", "Aviation", "English & Viva", "Business"].map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>
            <div>
              <label className={labelClass}>Author</label>
              <input value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} className={inputClass} />
            </div>
          </div>
          <div>
            <label className={labelClass}>Visible To</label>
            <select value={form.courseId} onChange={(e) => setForm({ ...form, courseId: e.target.value })} className={inputClass}>
              <option value="">All enrolled students</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code} — {c.title} students only
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Description</label>
            <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>File *</label>
            <input
              type="file"
              required
              accept=".pdf,.epub,.docx,.pptx,.xlsx,.zip"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="text-xs"
            />
          </div>
          {formError && <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">{formError}</p>}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-aviation-border">
            <Button variant="ghost" size="sm" type="button" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={uploading}>
              Upload
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
