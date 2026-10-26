"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { LiveKitRoom, PreJoin, VideoConference, type LocalUserChoices } from "@livekit/components-react";
import "@livekit/components-styles";
import { useAuth } from "@/lib/auth-context";
import api, { ApiError } from "@/lib/api";
import { formatDateTime } from "@/lib/format";
import { AlertTriangle, ArrowRight, Loader2, Lock, PhoneOff, Radio, CheckCircle2 } from "lucide-react";

interface JoinTokenResponse {
  token: string;
  roomName: string;
  livekitUrl: string;
  isHost: boolean;
  classSession: {
    id: string;
    title: string;
    status: "SCHEDULED" | "LIVE" | "COMPLETED" | "CANCELLED";
    startTime: string;
    endTime: string;
    recordingEnabled: boolean;
    instructorName: string;
    courseTitle: string;
    courseCode: string;
    batchName: string;
  };
}

type Phase = "loading" | "error" | "lobby" | "room" | "left" | "ended";

function dashboardFor(role?: string) {
  if (role === "ADMIN") return "/admin/classes";
  if (role === "INSTRUCTOR") return "/instructor/dashboard";
  return "/student/dashboard";
}

function Header({ data, children }: { data?: JoinTokenResponse; children?: React.ReactNode }) {
  return (
    <div className="px-4 sm:px-6 py-3 flex items-center justify-between gap-4 border-b border-[#3c4043] bg-[#202124] shrink-0">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-9 h-9 rounded-full bg-[#F5C400] text-[#0e271d] font-black text-sm flex items-center justify-center shrink-0">
          ID
        </div>
        <div className="min-w-0">
          <div className="font-semibold text-sm sm:text-base text-slate-100 truncate">
            {data ? data.classSession.title : "Ignited Dreams Live Classroom"}
          </div>
          {data && (
            <p className="text-[11px] text-slate-400 truncate">
              {data.classSession.courseCode} • {data.classSession.batchName} • {data.classSession.instructorName}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">{children}</div>
    </div>
  );
}

function CenterCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-[#303134] rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#3c4043] text-center space-y-5">
        {children}
      </div>
    </div>
  );
}

export default function ClassroomPage() {
  const params = useParams();
  const router = useRouter();
  const classId = params?.classId as string;
  const { user, isLoading: authLoading } = useAuth();

  const [phase, setPhase] = useState<Phase>("loading");
  const [data, setData] = useState<JoinTokenResponse | null>(null);
  const [error, setError] = useState<{ message: string; status?: number } | null>(null);
  const [choices, setChoices] = useState<LocalUserChoices | null>(null);
  const [actionPending, setActionPending] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const fetchToken = useCallback(async () => {
    setPhase("loading");
    setError(null);
    try {
      const res = await api.post<JoinTokenResponse>("/livekit/token", { classId });
      setData(res);
      setPhase("lobby");
    } catch (err) {
      setError({
        message: err instanceof Error ? err.message : "Could not open the classroom",
        status: err instanceof ApiError ? err.statusCode : undefined,
      });
      setPhase("error");
    }
  }, [classId]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace(`/login?next=${encodeURIComponent(`/classroom/${classId}`)}`);
      return;
    }
    fetchToken();
  }, [authLoading, user, classId, router, fetchToken]);

  const handleJoin = async (values: LocalUserChoices) => {
    if (!data) return;
    setActionError(null);

    // Instructor/admin entering a scheduled class starts it (marks LIVE, starts recording, notifies students)
    if (data.isHost && data.classSession.status === "SCHEDULED") {
      setActionPending(true);
      try {
        await api.post(`/instructor/classes/${data.classSession.id}/start`);
        setData({ ...data, classSession: { ...data.classSession, status: "LIVE" } });
      } catch (err) {
        setActionError(err instanceof Error ? err.message : "Could not start the class");
        setActionPending(false);
        return;
      }
      setActionPending(false);
    }

    setChoices(values);
    setPhase("room");
  };

  const handleEndClass = async () => {
    if (!data) return;
    if (!window.confirm("End this class for everyone? The recording will be processed and published to students.")) return;
    setActionPending(true);
    try {
      await api.post(`/instructor/classes/${data.classSession.id}/end`);
      setPhase("ended");
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Could not end the class");
    } finally {
      setActionPending(false);
    }
  };

  // ---------- Loading ----------
  if (phase === "loading" || authLoading || !user) {
    return (
      <div className="min-h-screen bg-[#202124] text-white flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center text-slate-300 gap-2 text-sm">
          <Loader2 className="w-5 h-5 animate-spin" /> Preparing your classroom…
        </div>
      </div>
    );
  }

  // ---------- Not allowed / not configured / too early ----------
  if (phase === "error" && error) {
    const notEnrolled = error.status === 403;
    return (
      <div className="min-h-screen bg-[#202124] text-white flex flex-col">
        <Header />
        <CenterCard>
          <div className="w-16 h-16 rounded-full bg-[#F5C400]/15 text-[#F5C400] flex items-center justify-center mx-auto border border-[#F5C400]/40">
            {notEnrolled ? <Lock className="w-8 h-8" /> : <AlertTriangle className="w-8 h-8" />}
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white font-heading">
              {notEnrolled ? "Enrolled Students Only" : "Classroom Unavailable"}
            </h1>
            <p className="text-sm text-slate-300 mt-2 leading-relaxed">{error.message}</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {notEnrolled ? (
              <Link
                href="/courses"
                className="py-3 px-6 rounded-full bg-[#F5C400] hover:bg-amber-300 text-[#0e271d] font-bold text-sm flex items-center justify-center gap-2"
              >
                View Courses &amp; Enroll <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <button
                onClick={fetchToken}
                className="py-3 px-6 rounded-full bg-[#F5C400] hover:bg-amber-300 text-[#0e271d] font-bold text-sm"
              >
                Try Again
              </button>
            )}
            <Link href={dashboardFor(user.role)} className="py-3 px-6 rounded-full bg-[#3c4043] hover:bg-slate-600 text-white font-semibold text-sm">
              Back to Dashboard
            </Link>
          </div>
        </CenterCard>
      </div>
    );
  }

  if (!data) return null;

  // ---------- After leaving / class ended ----------
  if (phase === "left" || phase === "ended") {
    return (
      <div className="min-h-screen bg-[#202124] text-white flex flex-col">
        <Header data={data} />
        <CenterCard>
          <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold font-heading">
              {phase === "ended" ? "Class Ended" : "You Left the Class"}
            </h1>
            <p className="text-sm text-slate-300 mt-2">
              {data.classSession.recordingEnabled
                ? "The recording will appear in Recordings once processing finishes (usually a few minutes after class)."
                : "Thank you for attending."}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {phase === "left" && (
              <button onClick={fetchToken} className="py-3 px-6 rounded-full bg-[#F5C400] hover:bg-amber-300 text-[#0e271d] font-bold text-sm">
                Rejoin Class
              </button>
            )}
            <Link href={dashboardFor(user.role)} className="py-3 px-6 rounded-full bg-[#3c4043] hover:bg-slate-600 text-white font-semibold text-sm">
              Back to Dashboard
            </Link>
          </div>
        </CenterCard>
      </div>
    );
  }

  const isLive = data.classSession.status === "LIVE";

  // ---------- Lobby: camera/mic check ----------
  if (phase === "lobby") {
    return (
      <div className="min-h-screen bg-[#202124] text-white flex flex-col" data-lk-theme="default">
        <Header data={data}>
          <span
            className={`text-[11px] px-3 py-1 rounded-full font-bold border ${
              isLive ? "bg-red-950/60 border-red-700 text-red-300" : "bg-slate-800 border-slate-600 text-slate-300"
            }`}
          >
            {isLive ? "● LIVE NOW" : `Scheduled ${formatDateTime(data.classSession.startTime)}`}
          </span>
        </Header>

        <div className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-8 py-8 flex flex-col lg:flex-row items-center justify-center gap-8">
          <div className="w-full lg:w-[560px]">
            <PreJoin
              defaults={{ username: user.name, videoEnabled: true, audioEnabled: data.isHost }}
              onSubmit={handleJoin}
              onValidate={() => !actionPending}
              joinLabel={data.isHost && !isLive ? "Start Class & Join" : "Join Class"}
              persistUserChoices
            />
          </div>

          <div className="w-full lg:w-[340px] space-y-4 text-left">
            <h2 className="text-2xl font-bold font-heading">{data.isHost ? "Ready to teach?" : "Ready to join?"}</h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              {data.isHost
                ? isLive
                  ? "This class is already live. Join to continue teaching."
                  : "Joining will mark the class LIVE, notify every student in the batch and start the recording."
                : isLive
                ? `${data.classSession.instructorName} is teaching now.`
                : "The class hasn't started yet — you can wait inside until the instructor joins."}
            </p>
            <ul className="text-xs text-slate-400 space-y-1.5 list-disc pl-4">
              <li>Keep your webcam on with your face clearly visible (attendance is monitored).</li>
              <li>Stay muted unless asked to speak; use chat for questions.</li>
              {data.classSession.recordingEnabled && <li>This session is recorded and available to the batch for 7 days.</li>}
            </ul>
            {actionPending && (
              <p className="text-xs text-amber-300 flex items-center gap-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Starting class…
              </p>
            )}
            {actionError && <p className="text-xs text-red-300">{actionError}</p>}
          </div>
        </div>
      </div>
    );
  }

  // ---------- In the room ----------
  return (
    <div className="h-screen bg-[#111] text-white flex flex-col" data-lk-theme="default">
      <Header data={data}>
        <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] px-3 py-1 rounded-full bg-red-950/60 border border-red-700 text-red-300 font-bold">
          <Radio className="w-3.5 h-3.5" /> IN CLASS
          {data.classSession.recordingEnabled ? " • REC" : ""}
        </span>
        {data.isHost && (
          <button
            onClick={handleEndClass}
            disabled={actionPending}
            className="inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-full bg-red-600 hover:bg-red-700 disabled:opacity-60"
          >
            <PhoneOff className="w-4 h-4" /> End Class for All
          </button>
        )}
      </Header>

      <div className="flex-1 min-h-0">
        <LiveKitRoom
          serverUrl={data.livekitUrl}
          token={data.token}
          connect
          video={choices?.videoEnabled ? { deviceId: choices.videoDeviceId } : false}
          audio={choices?.audioEnabled ? { deviceId: choices.audioDeviceId } : false}
          options={{ adaptiveStream: true, dynacast: true }}
          onDisconnected={() => setPhase((p) => (p === "ended" ? p : "left"))}
          onError={(err) => console.error("LiveKit error", err)}
          style={{ height: "100%" }}
        >
          <VideoConference />
        </LiveKitRoom>
      </div>
    </div>
  );
}
