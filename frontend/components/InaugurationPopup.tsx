"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { api } from "@/lib/api";

/**
 * One-time website inauguration.
 * Until someone presses "Inaugurate", every visitor to a public page sees the invite.
 * The first person to press it gets the celebration; after that nobody sees the popup again.
 * Admins can bring it back with POST /api/admin/inauguration/reset.
 */

type Phase = "hidden" | "invite" | "celebrating";

// Portal pages never show the popup, so staff working there are not interrupted
const EXCLUDED_PREFIXES = ["/admin", "/instructor", "/student", "/classroom"];
const SKIP_KEY = "id_inauguration_skipped";

const BURST_COLORS = ["#F5C400", "#FFD21F", "#b5f93d", "#ffffff", "#ff8a3d", "#ff5d8f", "#7dd3fc"];

function formatInaugurationTime(date: Date) {
  return date.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function InaugurationPopup() {
  const pathname = usePathname();
  const [phase, setPhase] = useState<Phase>("hidden");
  const [busy, setBusy] = useState(false);
  const [ribbonCut, setRibbonCut] = useState(false);
  const [result, setResult] = useState<{ first: boolean; at: Date } | null>(null);
  const [error, setError] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stopFireworksRef = useRef<(() => void) | null>(null);

  const excluded = EXCLUDED_PREFIXES.some((p) => pathname?.startsWith(p));

  // Check once whether the site still waits for its inauguration
  useEffect(() => {
    if (excluded) return;
    try {
      if (sessionStorage.getItem(SKIP_KEY)) return;
    } catch {
      // storage blocked: still show the invite
    }
    let cancelled = false;
    api
      .get<{ inaugurated: boolean }>("/public/inauguration")
      .then((data) => {
        if (!cancelled && !data.inaugurated) setPhase("invite");
      })
      .catch(() => {
        // Backend unreachable: never block the website
      });
    return () => {
      cancelled = true;
    };
  }, [excluded]);

  // Lock page scroll while the popup is open
  useEffect(() => {
    if (phase === "hidden") return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [phase]);

  // Stop the animation loop when the component goes away
  useEffect(() => () => stopFireworksRef.current?.(), []);

  const inaugurate = useCallback(async () => {
    setBusy(true);
    setError("");
    // Created inside the click so browsers allow the cracker sounds
    const audio = createAudio();
    try {
      const data = await api.post<{ firstToInaugurate: boolean; inauguratedAt: string }>(
        "/public/inauguration"
      );
      setResult({ first: data.firstToInaugurate, at: new Date(data.inauguratedAt) });
      setRibbonCut(true);
      if (canvasRef.current) {
        stopFireworksRef.current?.();
        stopFireworksRef.current = startCelebration(canvasRef.current, audio, data.firstToInaugurate);
      }
      // Let the ribbon halves fall away before the message appears
      setTimeout(() => setPhase("celebrating"), 650);
    } catch {
      audio?.close().catch(() => {});
      setError("Could not reach the server. Please try again.");
    } finally {
      setBusy(false);
    }
  }, []);

  const close = useCallback(() => {
    stopFireworksRef.current?.();
    stopFireworksRef.current = null;
    setPhase("hidden");
  }, []);

  const skipForNow = useCallback(() => {
    try {
      sessionStorage.setItem(SKIP_KEY, "1");
    } catch {
      // ignore
    }
    setPhase("hidden");
  }, []);

  if (excluded) return null;

  return (
    <AnimatePresence>
      {phase !== "hidden" && (
        <motion.div
          key="inauguration"
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.4 } }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="inauguration-title"
        >
          {/* Night-sky backdrop */}
          <div
            className="absolute inset-0 backdrop-blur-md"
            style={{
              background:
                "radial-gradient(ellipse at top, rgba(22,58,43,0.96) 0%, rgba(14,39,29,0.96) 45%, rgba(6,20,14,0.97) 100%)",
            }}
          />

          {/* Fireworks + confetti layer */}
          <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 h-full w-full" />

          <motion.div
            className="relative w-full max-w-lg overflow-hidden rounded-[28px] border border-[#F5C400]/30 bg-white text-center shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)]"
            initial={{ scale: 0.85, y: 30, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 180, damping: 18, delay: 0.1 }}
          >
            {/* Gold top band */}
            <div className="h-1.5 w-full bg-gradient-to-r from-[#D9A900] via-[#FFD21F] to-[#D9A900]" />

            <div className="px-6 pb-8 pt-8 sm:px-10">
              <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-2xl border border-[#E5E5E0] bg-[#f8faf8] shadow-sm">
                <Image src="/logo.png" alt="Ignited Dreams" width={64} height={64} className="h-14 w-14 object-contain" />
              </div>

              <AnimatePresence mode="wait">
                {phase === "invite" ? (
                  <motion.div key="invite" exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#0e271d] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-[#F5C400]">
                      <Sparkles className="h-3.5 w-3.5" />
                      Grand Launch
                    </span>
                    <h2
                      id="inauguration-title"
                      className="mt-4 text-2xl font-extrabold leading-tight text-[#0e271d] sm:text-3xl"
                    >
                      Ignited Dreams Integrated
                    </h2>
                    <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-[#0e271d]/70">
                      Our new website is ready and waiting for its first visitor. Cut the ribbon to
                      inaugurate it.
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="celebrate"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 16 }}
                  >
                    <h2
                      id="inauguration-title"
                      className="bg-gradient-to-r from-[#D9A900] via-[#F5C400] to-[#D9A900] bg-clip-text text-4xl font-extrabold text-transparent sm:text-5xl"
                    >
                      Congratulations!
                    </h2>
                    <p className="mt-3 text-lg font-bold text-[#0e271d] sm:text-xl">
                      {result?.first
                        ? "You inaugurated this website"
                        : "This website has been inaugurated"}
                    </p>
                    {result && (
                      <p className="mt-2 text-xs font-medium uppercase tracking-wider text-[#0e271d]/50">
                        Inaugurated on {formatInaugurationTime(result.at)}
                      </p>
                    )}
                    <p className="mx-auto mt-4 max-w-sm text-sm leading-relaxed text-[#0e271d]/70">
                      Thank you for opening the doors of Ignited Dreams Integrated. May this be the
                      start of many bright careers.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Ribbon */}
              {phase === "invite" && (
                <div className="relative my-7 h-10" aria-hidden="true">
                  <motion.div
                    className="absolute left-0 top-1/2 h-5 w-1/2 -translate-y-1/2 origin-left bg-gradient-to-b from-[#FFD21F] via-[#F5C400] to-[#D9A900] shadow-[0_2px_6px_rgba(217,169,0,0.45)]"
                    animate={ribbonCut ? { x: "-35%", rotate: -18, y: 40, opacity: 0 } : {}}
                    transition={{ duration: 0.7, ease: "easeIn" }}
                  />
                  <motion.div
                    className="absolute right-0 top-1/2 h-5 w-1/2 -translate-y-1/2 origin-right bg-gradient-to-b from-[#FFD21F] via-[#F5C400] to-[#D9A900] shadow-[0_2px_6px_rgba(217,169,0,0.45)]"
                    animate={ribbonCut ? { x: "35%", rotate: 18, y: 40, opacity: 0 } : {}}
                    transition={{ duration: 0.7, ease: "easeIn" }}
                  />
                  {/* Bow */}
                  <motion.svg
                    viewBox="0 0 64 40"
                    className="absolute left-1/2 top-1/2 h-10 w-16 -translate-x-1/2 -translate-y-1/2 drop-shadow"
                    animate={ribbonCut ? { scale: 0, opacity: 0 } : {}}
                    transition={{ duration: 0.3 }}
                  >
                    <path d="M32 20 C20 2, 2 6, 6 20 C2 34, 20 38, 32 20Z" fill="#D9A900" />
                    <path d="M32 20 C44 2, 62 6, 58 20 C62 34, 44 38, 32 20Z" fill="#D9A900" />
                    <circle cx="32" cy="20" r="6" fill="#FFD21F" stroke="#B88F00" strokeWidth="1.5" />
                  </motion.svg>
                </div>
              )}

              {phase === "invite" ? (
                <div className="flex flex-col items-center gap-3">
                  <button
                    type="button"
                    onClick={inaugurate}
                    disabled={busy || ribbonCut}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#0e271d] px-6 py-4 text-sm font-bold uppercase tracking-wider text-[#F5C400] shadow-lg transition hover:bg-[#163a2b] hover:shadow-[0_0_25px_-5px_rgba(245,196,0,0.5)] disabled:opacity-70 sm:w-auto sm:px-10"
                  >
                    <span aria-hidden="true">✂️</span>
                    {busy ? "Inaugurating…" : "Cut the Ribbon & Inaugurate"}
                  </button>
                  {error && <p className="text-xs font-medium text-red-600">{error}</p>}
                  <button
                    type="button"
                    onClick={skipForNow}
                    className="text-xs font-medium text-[#0e271d]/40 underline-offset-4 transition hover:text-[#0e271d]/70 hover:underline"
                  >
                    Not now
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={close}
                  className="mt-7 inline-flex w-full items-center justify-center rounded-full bg-[#F5C400] px-6 py-4 text-sm font-bold uppercase tracking-wider text-[#0e271d] shadow-lg transition hover:bg-[#FFD21F] sm:w-auto sm:px-10"
                >
                  Enter the Website
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ---------------- Fireworks, confetti and cracker sounds ---------------- */

type Spark = {
  x: number;
  y: number;
  px: number;
  py: number;
  vx: number;
  vy: number;
  life: number;
  decay: number;
  color: string;
  size: number;
};

type Rocket = { x: number; y: number; vx: number; vy: number; targetY: number; color: string };

type Confetti = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  w: number;
  h: number;
  rot: number;
  vr: number;
  color: string;
  wobble: number;
};

function createAudio(): AudioContext | null {
  try {
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    return Ctx ? new Ctx() : null;
  } catch {
    return null;
  }
}

function playCracker(ctx: AudioContext | null, loud = 1) {
  if (!ctx || ctx.state === "closed") return;
  try {
    const duration = 0.6;
    const buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * duration), ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      const t = i / data.length;
      // Sharp bang followed by a crackling tail
      const crackle = Math.random() < 0.02 ? 1 : 0.15;
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - t, 3) * crackle;
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 1800 + Math.random() * 1800;
    const gain = ctx.createGain();
    gain.gain.value = 0.35 * loud;
    source.connect(filter).connect(gain).connect(ctx.destination);
    source.start();
  } catch {
    // sound is optional
  }
}

function startCelebration(canvas: HTMLCanvasElement, audio: AudioContext | null, grand: boolean) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return () => {};

  const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  let width = 0;
  let height = 0;

  const resize = () => {
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  resize();
  window.addEventListener("resize", resize);

  const rockets: Rocket[] = [];
  const sparks: Spark[] = [];
  const confetti: Confetti[] = [];
  const pick = () => BURST_COLORS[Math.floor(Math.random() * BURST_COLORS.length)];

  const shootConfetti = (fromX: number, dir: number, count: number) => {
    for (let i = 0; i < count; i++) {
      const angle = (-Math.PI / 2) + dir * (0.25 + Math.random() * 0.45);
      const speed = 9 + Math.random() * 9;
      confetti.push({
        x: fromX,
        y: height + 10,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        w: 6 + Math.random() * 6,
        h: 3 + Math.random() * 4,
        rot: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.3,
        color: pick(),
        wobble: Math.random() * Math.PI * 2,
      });
    }
  };

  const launchRocket = () => {
    rockets.push({
      x: width * (0.15 + Math.random() * 0.7),
      y: height + 5,
      vx: (Math.random() - 0.5) * 1.5,
      vy: -(height * 0.017 + Math.random() * 4),
      targetY: height * (0.12 + Math.random() * 0.33),
      color: pick(),
    });
  };

  const explode = (x: number, y: number, color: string) => {
    const count = 70 + Math.floor(Math.random() * 40);
    const second = Math.random() < 0.5 ? pick() : color;
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.1;
      const speed = 2 + Math.random() * 4.5;
      sparks.push({
        x,
        y,
        px: x,
        py: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        decay: 0.011 + Math.random() * 0.012,
        color: i % 3 === 0 ? second : color,
        size: 1.6 + Math.random() * 1.4,
      });
    }
    playCracker(audio, 0.7 + Math.random() * 0.4);
  };

  // Opening salvo: confetti cannons from both bottom corners, then a volley of rockets
  shootConfetti(0, 1, reduceMotion ? 40 : 140);
  shootConfetti(width, -1, reduceMotion ? 40 : 140);
  playCracker(audio, 1.2);

  const timers: number[] = [];
  if (!reduceMotion) {
    const volley = grand ? 7 : 4;
    for (let i = 0; i < volley; i++) timers.push(window.setTimeout(launchRocket, 250 + i * 280));
  }

  let lastLaunch = performance.now();
  let lastConfettiWave = performance.now();
  let running = true;
  let frame = 0;

  const tick = (now: number) => {
    if (!running) return;
    ctx.clearRect(0, 0, width, height);
    ctx.globalCompositeOperation = "lighter";

    // Keep the sky alive while the popup is open
    if (!reduceMotion && now - lastLaunch > 650 + Math.random() * 600) {
      launchRocket();
      if (Math.random() < 0.35) launchRocket();
      lastLaunch = now;
    }
    if (!reduceMotion && now - lastConfettiWave > 4500) {
      shootConfetti(0, 1, 50);
      shootConfetti(width, -1, 50);
      lastConfettiWave = now;
    }

    for (let i = rockets.length - 1; i >= 0; i--) {
      const r = rockets[i];
      r.x += r.vx;
      r.y += r.vy;
      r.vy += 0.12;
      ctx.strokeStyle = r.color;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(r.x, r.y);
      ctx.lineTo(r.x - r.vx * 3, r.y - r.vy * 3);
      ctx.stroke();
      if (r.y <= r.targetY || r.vy >= -1) {
        explode(r.x, r.y, r.color);
        rockets.splice(i, 1);
      }
    }

    for (let i = sparks.length - 1; i >= 0; i--) {
      const s = sparks[i];
      s.px = s.x;
      s.py = s.y;
      s.vx *= 0.975;
      s.vy = s.vy * 0.975 + 0.05;
      s.x += s.vx;
      s.y += s.vy;
      s.life -= s.decay;
      if (s.life <= 0) {
        sparks.splice(i, 1);
        continue;
      }
      ctx.globalAlpha = Math.max(s.life, 0);
      ctx.strokeStyle = s.color;
      ctx.lineWidth = s.size;
      ctx.beginPath();
      ctx.moveTo(s.px, s.py);
      ctx.lineTo(s.x, s.y);
      ctx.stroke();
    }

    ctx.globalCompositeOperation = "source-over";
    for (let i = confetti.length - 1; i >= 0; i--) {
      const c = confetti[i];
      c.vx *= 0.985;
      c.vy = Math.min(c.vy + 0.22, 4.5);
      c.wobble += 0.12;
      c.x += c.vx + Math.sin(c.wobble) * 0.8;
      c.y += c.vy;
      c.rot += c.vr;
      if (c.y > height + 30) {
        confetti.splice(i, 1);
        continue;
      }
      ctx.globalAlpha = 1;
      ctx.save();
      ctx.translate(c.x, c.y);
      ctx.rotate(c.rot);
      ctx.scale(1, Math.cos(c.wobble));
      ctx.fillStyle = c.color;
      ctx.fillRect(-c.w / 2, -c.h / 2, c.w, c.h);
      ctx.restore();
    }
    ctx.globalAlpha = 1;

    frame = requestAnimationFrame(tick);
  };
  frame = requestAnimationFrame(tick);

  return () => {
    running = false;
    cancelAnimationFrame(frame);
    timers.forEach((t) => clearTimeout(t));
    window.removeEventListener("resize", resize);
    ctx.clearRect(0, 0, width, height);
    audio?.close().catch(() => {});
  };
}
