"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/lib/auth-context";
import api from "@/lib/api";
import { formatBytes } from "@/lib/format";
import { Download, Lock, Search, FileText, Eye, X, AlertCircle, Loader2 } from "lucide-react";

interface LibraryResource {
  id: string;
  title: string;
  subtitle: string | null;
  category: string;
  author: string | null;
  description: string | null;
  fileName: string;
  mimeType: string;
  fileSize: number;
  createdAt: string;
  course: { id: string; title: string; code: string } | null;
}

const FORMAT_LABEL: Record<string, string> = {
  "application/pdf": "PDF",
  "application/epub+zip": "ePub",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "DOCX",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": "PPTX",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "XLSX",
  "application/zip": "ZIP",
};

export default function LibraryPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [resources, setResources] = useState<LibraryResource[]>([]);
  const [canAccess, setCanAccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    setLoading(true);
    const load = async () => {
      try {
        if (user?.role === "STUDENT") {
          const res = await api.get<{ enrolled: boolean; resources: LibraryResource[] }>("/student/library");
          if (res.enrolled) {
            setResources(res.resources);
            setCanAccess(true);
            return;
          }
        }
        if (user?.role === "ADMIN") {
          setResources(await api.get<LibraryResource[]>("/admin/library"));
          setCanAccess(true);
          return;
        }
        setResources(await api.get<LibraryResource[]>("/public/library"));
        setCanAccess(false);
      } catch (err) {
        setLoadError(err instanceof Error ? err.message : "Could not load the library");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user, authLoading]);

  const categories = useMemo(() => ["All", ...Array.from(new Set(resources.map((r) => r.category)))], [resources]);

  const filtered = resources.filter((r) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesCategory = activeTab === "All" || r.category === activeTab;
    const matchesSearch =
      !q ||
      r.title.toLowerCase().includes(q) ||
      (r.subtitle || "").toLowerCase().includes(q) ||
      (r.description || "").toLowerCase().includes(q) ||
      (r.author || "").toLowerCase().includes(q);
    return matchesCategory && matchesSearch;
  });

  const openFile = async (r: LibraryResource, inline: boolean) => {
    setBusyId(r.id);
    try {
      const base = user?.role === "ADMIN" ? "/admin/library" : "/student/library";
      const { url } = await api.get<{ url: string }>(`${base}/${r.id}/file${inline ? "?inline=1" : ""}`);
      if (inline) {
        window.open(url, "_blank", "noopener,noreferrer");
      } else {
        window.location.href = url;
      }
    } catch (err) {
      setToastMessage(err instanceof Error ? err.message : "Could not open file");
      setTimeout(() => setToastMessage(null), 4000);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#FBFBFA] flex flex-col font-sans text-[#0A0A0A]">
      <Navbar />

      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0e271d] text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-white/10">
          <AlertCircle className="w-4 h-4 text-[#F5C400] shrink-0" />
          <span className="text-xs sm:text-sm font-medium">{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="text-gray-400 hover:text-white p-1 rounded-md">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <main className="flex-1 max-w-[1360px] w-full mx-auto px-5 sm:px-8 lg:px-10 pt-8 sm:pt-12 pb-24">
        <div className="mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFFBEB] border border-[#FDE68A] text-[#92400E] text-[11px] font-bold uppercase tracking-wider mb-3.5">
            <span className="w-2 h-2 rounded-full bg-[#F5C400]" />
            <span>Digital Study Materials</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-[44px] font-bold text-[#0e271d] font-heading tracking-tight leading-tight">
            Ignited Dreams Library
          </h1>
          <p className="text-sm sm:text-[15.5px] text-slate-600 max-w-2xl mt-2.5 leading-relaxed">
            Course handbooks, SAP practice manuals and viva preparation guides — available to enrolled students.
          </p>
        </div>

        {!canAccess && !loading && (
          <div className="mb-8 p-4 sm:p-5 rounded-2xl bg-[#0e271d] text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-lg">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#F5C400] text-[#0e271d] flex items-center justify-center shrink-0">
                <Lock className="w-5 h-5" />
              </div>
              <p className="text-xs text-slate-300">
                {user ? "Enroll in a course to open and download these materials." : "Log in with an enrolled student account to open and download these materials."}
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              {!user && (
                <Link href="/login?next=/library" className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-xs">
                  Log In
                </Link>
              )}
              <Link href="/courses" className="px-4 py-2 rounded-full bg-[#F5C400] text-[#0e271d] font-bold text-xs hover:bg-amber-300">
                View Courses
              </Link>
            </div>
          </div>
        )}

        <section className="mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
            <div className="relative w-full sm:w-80 md:w-96">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search titles, topics, authors..."
                className="w-full pl-10 pr-9 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#F5C400] focus:ring-2 focus:ring-[#F5C400]/25"
              />
            </div>
            <div className="inline-flex items-center gap-2 self-start sm:self-auto px-3.5 py-1.5 rounded-full bg-slate-100 border border-slate-200/80 text-xs text-slate-600 font-semibold">
              <span className="w-2 h-2 rounded-full bg-[#F5C400]" />
              <span>{filtered.length} resources</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 pt-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveTab(cat)}
                className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  activeTab === cat
                    ? "bg-[#F5C400] text-[#0e271d] font-bold"
                    : "bg-white hover:bg-slate-50 border border-slate-200/90 text-slate-600"
                }`}
              >
                {cat === "All" ? "All Materials" : cat}
              </button>
            ))}
          </div>
        </section>

        {loading && <div className="text-sm text-slate-500">Loading library…</div>}
        {loadError && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800">{loadError}</div>
        )}
        {!loading && !loadError && filtered.length === 0 && (
          <div className="p-10 rounded-2xl bg-white border border-slate-200 text-center text-sm text-slate-500">
            {resources.length === 0 ? "Study materials will be published here soon." : "No materials match your search."}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7 lg:gap-8 items-stretch">
          {filtered.map((r) => (
            <div
              key={r.id}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_32px_rgba(245,196,0,0.14)] transition-all duration-300 p-5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="px-2.5 py-1 rounded-full bg-[#F5C400] text-[#0e271d] text-[10px] font-extrabold uppercase tracking-wider">
                    {r.category}
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-slate-900 text-white text-[10px] font-bold font-mono">
                    {FORMAT_LABEL[r.mimeType] || "FILE"}
                  </span>
                </div>
                <h3 className="font-bold text-[#0e271d] text-base leading-snug line-clamp-2">{r.title}</h3>
                {r.subtitle && <p className="text-xs text-slate-500 mt-1 line-clamp-1">{r.subtitle}</p>}
                {r.description && <p className="text-xs text-slate-600 mt-3 line-clamp-3 leading-relaxed">{r.description}</p>}
                <div className="flex items-center gap-4 text-[11px] font-medium text-slate-500 mt-4 pt-3 border-t border-slate-100">
                  <span className="flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-[#F5C400]" />
                    {formatBytes(r.fileSize)}
                  </span>
                  <span className="truncate">{r.course ? r.course.code : "All courses"}</span>
                  {r.author && <span className="truncate ml-auto">{r.author}</span>}
                </div>
              </div>

              <div className="mt-5 pt-3 flex items-center gap-2.5">
                {canAccess ? (
                  <>
                    {r.mimeType === "application/pdf" && (
                      <button
                        type="button"
                        disabled={busyId === r.id}
                        onClick={() => openFile(r, true)}
                        className="flex-1 py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#0e271d] font-bold text-xs flex items-center justify-center gap-2"
                      >
                        <Eye className="w-3.5 h-3.5" /> Read Online
                      </button>
                    )}
                    <button
                      type="button"
                      disabled={busyId === r.id}
                      onClick={() => openFile(r, false)}
                      className="flex-1 py-2.5 px-4 rounded-xl bg-[#0e271d] hover:bg-[#F5C400] text-white hover:text-[#0e271d] font-bold text-xs flex items-center justify-center gap-2 transition-all"
                    >
                      {busyId === r.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                      Download
                    </button>
                  </>
                ) : (
                  <span className="flex-1 py-2.5 px-4 rounded-xl bg-slate-100 text-slate-500 font-bold text-xs flex items-center justify-center gap-2">
                    <Lock className="w-3.5 h-3.5" /> Enrolled students only
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
