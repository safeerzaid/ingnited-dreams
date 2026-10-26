"use client";

import React, { useState, useEffect } from "react";
import api from "@/lib/api";
import LoadErrorBanner from "@/components/ui/LoadErrorBanner";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import {
  Clock,
  Search,
  Trash2,
  CalendarPlus,
  Download,
  Play,
  AlertTriangle,
  HardDrive,
  CheckCircle,
  PlayCircle,
} from "lucide-react";
import Link from "next/link";

interface AdminRecording {
  id: string;
  fileName: string;
  durationSeconds: number;
  fileSize: number | null;
  status: string;
  lastError?: string | null;
  archiveExpiresAt?: string | null;
  availableAt: string | null;
  expiresAt: string | null;
  deletedAt: string | null;
  hoursRemaining: number;
  isExpired: boolean;
  classSession: {
    title: string;
    course: { title: string; code: string };
    batch: { name: string };
    instructor: { name: string };
  };
  _count?: { downloadLogs: number };
}

const RECORDING_BADGE: Record<string, "ready" | "expired" | "processing" | "recording" | "scheduled" | "expiring"> = {
  READY: "ready",
  RECORDING: "recording",
  PROCESSING: "processing",
  SCHEDULED: "scheduled",
  EXPIRED: "expiring",
  ARCHIVED: "scheduled",
  FAILED: "expired",
  DELETING: "expired",
  DELETED: "expired",
};

// Admins can still review archived recordings from the long-term vault
const PLAYABLE = ["READY", "EXPIRING_SOON", "EXPIRED", "ARCHIVED"];

export default function AdminRecordingsPage() {
  const [recordings, setRecordings] = useState<AdminRecording[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Modal States
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [extendModalOpen, setExtendModalOpen] = useState(false);
  const [selectedRecording, setSelectedRecording] = useState<AdminRecording | null>(null);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState("");
  const [deleteReason, setDeleteReason] = useState("");
  const [extendDays, setExtendDays] = useState(7);
  const [extendReason, setExtendReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const loadRecordings = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (search) queryParams.set("search", search);
      if (statusFilter) queryParams.set("status", statusFilter);

      const res = await api.get<{ data: AdminRecording[] }>(`/admin/recordings?${queryParams.toString()}`);
      // res could be array directly or wrapped
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const list = Array.isArray(res) ? res : (res as any).data || [];
      setRecordings(list);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecordings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, statusFilter]);

  const openDeleteModal = (rec: AdminRecording) => {
    setSelectedRecording(rec);
    setDeleteConfirmationText("");
    setDeleteReason("");
    setDeleteModalOpen(true);
  };

  const openExtendModal = (rec: AdminRecording) => {
    setSelectedRecording(rec);
    setExtendDays(7);
    setExtendReason("Administrative extension request");
    setExtendModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedRecording) return;
    if (deleteConfirmationText !== "CONFIRM_DELETE") {
      alert("Please type CONFIRM_DELETE exactly to confirm permanent deletion.");
      return;
    }

    try {
      setIsProcessing(true);
      await api.delete(`/admin/recordings/${selectedRecording.id}`, {
        confirmation: "CONFIRM_DELETE",
        reason: deleteReason || "Manual administrative cleanup",
      });
      setDeleteModalOpen(false);
      loadRecordings();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Deletion failed");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmExtend = async () => {
    if (!selectedRecording) return;

    try {
      setIsProcessing(true);
      await api.patch(`/admin/recordings/${selectedRecording.id}/expiry`, {
        additionalDays: Number(extendDays),
        reason: extendReason,
      });
      setExtendModalOpen(false);
      loadRecordings();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Extension failed");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = async (rec: AdminRecording) => {
    try {
      const { downloadUrl } = await api.get<{ downloadUrl: string }>(`/recordings/${rec.id}/download`);
      window.location.href = downloadUrl;
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Download failed");
    }
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return "N/A";
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    return `${mins}m`;
  };

  return (
    <div className="space-y-6">
      {loadError && <LoadErrorBanner message={loadError} />}
      {/* Page Header */}
      <div className="border-b border-aviation-border pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-aviation-black tracking-tight font-heading">
              Recordings & Lifecycle Management
            </h1>
            <Badge variant="yellow" size="sm">
              Cloudflare R2
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-aviation-muted mt-1">
            Supervise automatic 7-day expiration schedules, trigger immediate manual storage deletions, or grant retention extensions.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-aviation-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search recordings by class title or code..."
            className="w-full pl-10 pr-3.5 py-2 rounded-lg border border-aviation-border bg-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-aviation-yellow"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3.5 py-2 rounded-lg border border-aviation-border bg-white text-xs sm:text-sm font-semibold text-aviation-charcoal"
        >
          <option value="">All Statuses</option>
          <option value="READY">READY (Active 7-Day)</option>
          <option value="EXPIRING_SOON">EXPIRING_SOON (&lt;48h)</option>
          <option value="PROCESSING">PROCESSING</option>
          <option value="ARCHIVED">ARCHIVED (2-Year Vault)</option>
          <option value="FAILED">FAILED</option>
          <option value="DELETED">DELETED (Cleaned Up)</option>
        </select>
      </div>

      {/* Main Recordings Table */}
      <Card padding="none" variant="default" className="overflow-hidden border border-aviation-border">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-aviation-offWhite border-b border-aviation-border font-bold uppercase tracking-wider text-aviation-muted text-[10px]">
              <tr>
                <th className="px-5 py-3.5">Class / Curriculum</th>
                <th className="px-4 py-3.5">Instructor</th>
                <th className="px-4 py-3.5">Duration / Size</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5">7-Day Expiry Timeline</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-aviation-border">
              {recordings.map((rec) => {
                const expiresDate = rec.expiresAt ? new Date(rec.expiresAt) : null;
                return (
                  <tr key={rec.id} className="hover:bg-aviation-offWhite/40 transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-bold text-aviation-black">{rec.classSession.title}</div>
                      <div className="text-[11px] text-aviation-muted font-mono mt-0.5">
                        {rec.classSession.course.code} • {rec.classSession.batch.name}
                      </div>
                    </td>

                    <td className="px-4 py-4 font-medium text-aviation-charcoal">
                      {rec.classSession.instructor.name}
                    </td>

                    <td className="px-4 py-4 font-mono">
                      <div>{formatDuration(rec.durationSeconds)}</div>
                      <div className="text-aviation-muted text-[11px]">{formatFileSize(rec.fileSize)}</div>
                    </td>

                    <td className="px-4 py-4">
                      {rec.status === "EXPIRING_SOON" ? (
                        <Badge variant="expiring" size="sm" dot>
                          EXPIRING ({rec.hoursRemaining}h)
                        </Badge>
                      ) : (
                        <Badge variant={RECORDING_BADGE[rec.status] || "default"} size="sm">
                          {rec.status}
                        </Badge>
                      )}
                      {rec.status === "FAILED" && rec.lastError && (
                        <div className="text-[10px] text-red-700 mt-1 max-w-[180px]">{rec.lastError}</div>
                      )}
                    </td>

                    <td className="px-4 py-4">
                      {expiresDate ? (
                        <div>
                          <div className="font-mono font-semibold text-aviation-charcoal">
                            {expiresDate.toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                          </div>
                          <div className="text-[11px] text-aviation-muted">
                            {rec.status === "DELETED"
                              ? "Purged from R2"
                              : rec.status === "ARCHIVED"
                              ? `Student access closed${rec.archiveExpiresAt ? ` · vault until ${new Date(rec.archiveExpiresAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}` : ""}`
                              : `${rec.hoursRemaining} hours remaining`}
                          </div>
                        </div>
                      ) : (
                        <span className="text-aviation-muted">N/A</span>
                      )}
                    </td>

                    <td className="px-5 py-4 text-right space-x-2 whitespace-nowrap">
                      {PLAYABLE.includes(rec.status) && (
                        <>
                          <Link href={`/student/recordings/${rec.id}`} className="inline-flex">
                            <Button variant="secondary" size="sm" className="px-2.5 py-1 text-[11px]" title="Watch">
                              <PlayCircle className="w-3.5 h-3.5" />
                            </Button>
                          </Link>
                          <Button variant="secondary" size="sm" onClick={() => handleDownload(rec)} className="px-2.5 py-1 text-[11px]" title="Download MP4">
                            <Download className="w-3.5 h-3.5" />
                          </Button>
                        </>
                      )}
                      {rec.status !== "DELETED" ? (
                        <>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => openExtendModal(rec)}
                            className="px-2.5 py-1 text-[11px]"
                            title="Extend Expiry Date"
                          >
                            <CalendarPlus className="w-3.5 h-3.5 mr-1 text-aviation-yellowDeep" />
                            Extend
                          </Button>

                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => openDeleteModal(rec)}
                            className="px-2.5 py-1 text-[11px]"
                            title="Permanent Manual Deletion"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </>
                      ) : (
                        <span className="text-aviation-muted italic">Deleted</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* MANUAL DELETE CONFIRMATION MODAL */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="⚠️ Confirm Permanent Recording Deletion"
        description="Destructive action: Deletes MP4 object from Cloudflare R2 and disables student playback."
      >
        <div className="space-y-4">
          <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-800 space-y-1">
            <p className="font-bold">Target Recording:</p>
            <p>{selectedRecording?.classSession.title}</p>
            <p className="font-mono text-[11px]">Key: {selectedRecording?.fileName}</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-aviation-charcoal uppercase tracking-wider mb-1">
              Deletion Reason (for Audit Log) *
            </label>
            <input
              type="text"
              value={deleteReason}
              onChange={(e) => setDeleteReason(e.target.value)}
              placeholder="e.g. Academy compliance, accidental recording, or test class"
              className="w-full px-3 py-2 rounded-lg border border-aviation-border text-xs focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-red-700 uppercase tracking-wider mb-1">
              Type &quot;CONFIRM_DELETE&quot; to authorize *
            </label>
            <input
              type="text"
              value={deleteConfirmationText}
              onChange={(e) => setDeleteConfirmationText(e.target.value)}
              placeholder="CONFIRM_DELETE"
              className="w-full px-3 py-2 rounded-lg border border-red-300 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-aviation-border">
            <Button variant="ghost" size="sm" onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleConfirmDelete}
              isLoading={isProcessing}
              disabled={deleteConfirmationText !== "CONFIRM_DELETE"}
            >
              Permanently Delete Recording
            </Button>
          </div>
        </div>
      </Modal>

      {/* EXTEND EXPIRY MODAL */}
      <Modal
        isOpen={extendModalOpen}
        onClose={() => setExtendModalOpen(false)}
        title="Extend 7-Day Recording Retention"
        description="Adjust the server-enforced expiration timestamp for student review."
      >
        <div className="space-y-4">
          <div className="p-3.5 rounded-lg bg-aviation-offWhite border border-aviation-border text-xs text-aviation-charcoal">
            <span className="font-bold">Class:</span> {selectedRecording?.classSession.title}
          </div>

          <div>
            <label className="block text-xs font-bold text-aviation-charcoal uppercase tracking-wider mb-1">
              Additional Days to Grant
            </label>
            <select
              value={extendDays}
              onChange={(e) => setExtendDays(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-lg border border-aviation-border text-xs font-semibold"
            >
              <option value={3}>+3 Days Extension</option>
              <option value={7}>+7 Days Extension (Standard Week)</option>
              <option value={14}>+14 Days Extension (Two Weeks)</option>
              <option value={30}>+30 Days Extension (Exam Month)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-aviation-charcoal uppercase tracking-wider mb-1">
              Extension Reason (Audit Log)
            </label>
            <input
              type="text"
              value={extendReason}
              onChange={(e) => setExtendReason(e.target.value)}
              placeholder="e.g. Student exam revision extension requested by instructor"
              className="w-full px-3 py-2 rounded-lg border border-aviation-border text-xs"
            />
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-aviation-border">
            <Button variant="ghost" size="sm" onClick={() => setExtendModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleConfirmExtend}
              isLoading={isProcessing}
            >
              Apply Extension
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
