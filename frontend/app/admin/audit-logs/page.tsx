"use client";

import React, { useState, useEffect } from "react";
import api from "@/lib/api";
import LoadErrorBanner from "@/components/ui/LoadErrorBanner";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { Activity, ShieldCheck, Clock } from "lucide-react";

interface AuditLogItem {
  id: string;
  action: string;
  entity: string;
  entityId: string | null;
  metadata: string | null;
  ipAddress: string | null;
  createdAt: string;
  actor: { name: string; email: string; role: string } | null;
}

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get<{ data: AuditLogItem[] }>("/admin/audit-logs");
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const list = Array.isArray(res) ? res : (res as any).data || [];
        setLogs(list);
      } catch (err) {
        setLoadError(err instanceof Error ? err.message : "Request failed");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="space-y-6">
      {loadError && <LoadErrorBanner message={loadError} />}
      <div className="border-b border-aviation-border pb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-aviation-black tracking-tight font-heading">
            System Security & Audit Trail
          </h1>
          <p className="text-xs sm:text-sm text-aviation-muted mt-1">
            Immutable log of all administrative actions, policy modifications, and 7-day recording cleanup operations.
          </p>
        </div>
      </div>

      <Card padding="none" variant="default" className="overflow-hidden border border-aviation-border">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-aviation-offWhite border-b border-aviation-border font-bold uppercase tracking-wider text-aviation-muted text-[10px]">
              <tr>
                <th className="px-5 py-3.5">Timestamp</th>
                <th className="px-4 py-3.5">Action</th>
                <th className="px-4 py-3.5">Entity</th>
                <th className="px-4 py-3.5">Actor</th>
                <th className="px-5 py-3.5">Metadata</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-aviation-border">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-aviation-offWhite/40 transition-colors">
                  <td className="px-5 py-3.5 font-mono text-aviation-muted whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleString("en-IN")}
                  </td>

                  <td className="px-4 py-3.5">
                    <Badge variant="yellow" size="sm">
                      {log.action}
                    </Badge>
                  </td>

                  <td className="px-4 py-3.5 font-mono text-aviation-charcoal">
                    {log.entity}
                  </td>

                  <td className="px-4 py-3.5 font-medium text-aviation-black">
                    <div>{log.actor?.name || "System Cron"}</div>
                    <div className="text-[10px] text-aviation-muted font-mono">{log.actor?.email}</div>
                  </td>

                  <td className="px-5 py-3.5 font-mono text-[11px] text-aviation-charcoal max-w-xs truncate">
                    {log.metadata || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
