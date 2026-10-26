"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  RotateCcw,
  Download,
  Clock,
  ArrowLeft,
  AlertTriangle,
  Compass,
  FileText,
  User,
  ShieldAlert,
} from "lucide-react";

interface PlaybackData {
  playbackUrl: string;
  expiresInSeconds: number;
  recording: {
    id: string;
    title: string;
    courseTitle: string;
    batchName: string;
    instructorName: string;
    durationSeconds: number;
    availableAt: string;
    expiresAt: string;
    status: string;
    downloadEnabled: boolean;
  };
}

export default function RecordingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [data, setData] = useState<PlaybackData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  // Video Player State
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);

  useEffect(() => {
    async function fetchPlayback() {
      try {
        const res = await api.get<PlaybackData>(`/recordings/${id}/play`);
        setData(res);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to load recording";
        setError(msg);
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchPlayback();
    }
  }, [id]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    setCurrentTime(videoRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    setDuration(videoRef.current.duration);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (!videoRef.current) return;
    videoRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      setIsMuted(val === 0);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    videoRef.current.muted = newMuted;
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleDownload = async () => {
    try {
      setDownloading(true);
      const res = await api.get<{ downloadUrl: string }>(`/recordings/${id}/download`);
      if (res.downloadUrl) {
        window.open(res.downloadUrl, "_blank");
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Download failed. Recording may have expired.");
    } finally {
      setDownloading(false);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <Compass className="w-10 h-10 text-aviation-yellow animate-spin" />
        <p className="text-xs font-bold text-aviation-charcoal uppercase tracking-widest">
          Validating 7-day security tokens...
        </p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-2xl mx-auto py-16 space-y-6">
        <Link href="/student/recordings" className="inline-flex items-center gap-2 text-xs font-bold text-aviation-black hover:underline">
          <ArrowLeft className="w-4 h-4" /> Back to Recordings Library
        </Link>

        <Card padding="lg" variant="default" className="border-2 border-red-200 bg-red-50/50">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-red-900 font-heading">
                Recording Access Unavailable
              </h2>
              <p className="text-sm text-red-700 leading-relaxed">
                {error || "This recording is either expired beyond the 7-day retention window or access is unauthorized for your batch enrollment."}
              </p>
              <div className="pt-2">
                <Link href="/student/recordings">
                  <Button variant="dark" size="sm">
                    Return to Available Recordings
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  const expiresDate = new Date(data.recording.expiresAt);
  const hoursLeft = Math.max(
    0,
    Math.round((expiresDate.getTime() - Date.now()) / (1000 * 60 * 60))
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          href="/student/recordings"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-aviation-muted hover:text-aviation-black transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Recordings
        </Link>

        <div className="flex items-center gap-2">
          {hoursLeft <= 24 ? (
            <Badge variant="expiring" size="sm" dot>
              Expires within {hoursLeft} Hours!
            </Badge>
          ) : (
            <Badge variant="ready" size="sm">
              Available ({Math.round(hoursLeft / 24)} Days Remaining)
            </Badge>
          )}
        </div>
      </div>

      {/* 7-Day Expiry Notice Banner */}
      <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between gap-4 text-xs text-amber-900">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-700 shrink-0" />
          <span>
            <strong>7-Day Retention Notice:</strong> This class recording will be automatically deleted on{" "}
            <strong>{expiresDate.toLocaleDateString("en-IN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</strong>.
          </span>
        </div>

        {data.recording.downloadEnabled && (
          <Button
            variant="secondary"
            size="sm"
            onClick={handleDownload}
            isLoading={downloading}
            leftIcon={<Download className="w-3.5 h-3.5" />}
            className="text-xs shrink-0 bg-white"
          >
            Download MP4
          </Button>
        )}
      </div>

      {/* Custom Video Player Container */}
      <div
        ref={containerRef}
        onMouseEnter={() => setShowControls(true)}
        className="relative aspect-video rounded-2xl bg-aviation-black overflow-hidden shadow-elevated border border-aviation-charcoal group"
      >
        <video
          ref={videoRef}
          src={data.playbackUrl}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onClick={togglePlay}
          className="w-full h-full object-contain cursor-pointer"
        />

        {/* Big Center Play Overlay (when paused) */}
        {!isPlaying && (
          <div
            onClick={togglePlay}
            className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] cursor-pointer"
          >
            <div className="w-16 h-16 rounded-full bg-aviation-yellow text-aviation-black flex items-center justify-center shadow-glowYellow transform group-hover:scale-110 transition-transform">
              <Play className="w-7 h-7 ml-1 fill-aviation-black" />
            </div>
          </div>
        )}

        {/* Video Player Control Bar */}
        <div
          className={`absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-4 transition-opacity duration-200 ${
            showControls || !isPlaying ? "opacity-100" : "opacity-0"
          }`}
        >
          {/* Progress Timeline Slider */}
          <div className="mb-3 flex items-center gap-3">
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-aviation-yellow"
            />
          </div>

          <div className="flex items-center justify-between text-white text-xs">
            {/* Left Controls: Play, Time, Volume */}
            <div className="flex items-center gap-4">
              <button
                onClick={togglePlay}
                className="p-1 hover:text-aviation-yellow transition-colors"
                title={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
              </button>

              <div className="font-mono text-[11px] text-gray-300">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={toggleMute}
                  className="p-1 hover:text-aviation-yellow transition-colors"
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-4 h-4 text-red-400" />
                  ) : (
                    <Volume2 className="w-4 h-4" />
                  )}
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-16 h-1 bg-white/20 rounded accent-aviation-yellow cursor-pointer"
                />
              </div>
            </div>

            {/* Right Controls: Speed, PiP, Fullscreen */}
            <div className="flex items-center gap-3">
              {/* Playback Speed selector */}
              <div className="flex items-center bg-white/10 rounded-lg p-0.5 text-[11px]">
                {[0.75, 1, 1.25, 1.5, 2].map((speed) => (
                  <button
                    key={speed}
                    onClick={() => handleSpeedChange(speed)}
                    className={`px-1.5 py-0.5 rounded font-mono transition-colors ${
                      playbackSpeed === speed
                        ? "bg-aviation-yellow text-aviation-black font-bold"
                        : "text-gray-300 hover:text-white"
                    }`}
                  >
                    {speed}x
                  </button>
                ))}
              </div>

              <button
                onClick={toggleFullscreen}
                className="p-1 hover:text-aviation-yellow transition-colors"
                title="Fullscreen"
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Details & Information Below Player */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-2">
        <div className="lg:col-span-8 space-y-4">
          <div>
            <h1 className="text-2xl font-bold text-aviation-black font-heading">
              {data.recording.title}
            </h1>
            <div className="text-xs text-aviation-muted mt-1">
              Course: <span className="font-semibold text-aviation-black">{data.recording.courseTitle}</span> • Batch:{" "}
              <span className="font-semibold text-aviation-black">{data.recording.batchName}</span>
            </div>
          </div>

          <Card padding="md" variant="default" className="space-y-3">
            <h3 className="text-sm font-bold text-aviation-black uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-aviation-yellowDeep" />
              Classroom Study Notes
            </h3>
            <p className="text-xs sm:text-sm text-aviation-muted leading-relaxed">
              This session covers practical computations, standard accounting adjustments, and statutory compliance. Review all problem derivations and Excel workbooks before upcoming exams.
            </p>
          </Card>
        </div>

        <div className="lg:col-span-4 space-y-4">
          <Card padding="md" variant="default" className="space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-aviation-muted">
              Faculty Mentor
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-aviation-black text-aviation-yellow flex items-center justify-center font-bold">
                <User className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-aviation-black">{data.recording.instructorName}</div>
                <div className="text-xs text-aviation-muted">Academy Faculty</div>
              </div>
            </div>
          </Card>

          <Card padding="md" variant="accent" className="space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-aviation-black">
              Session Download
            </div>
            <p className="text-xs text-aviation-muted">
              MP4 video direct download is available during the 7-day retention period.
            </p>
            {data.recording.downloadEnabled && (
              <Button
                variant="dark"
                size="sm"
                className="w-full text-xs"
                onClick={handleDownload}
                isLoading={downloading}
                leftIcon={<Download className="w-3.5 h-3.5 text-aviation-yellow" />}
              >
                Download Full MP4
              </Button>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
