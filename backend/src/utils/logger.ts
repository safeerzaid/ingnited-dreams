type LogLevel = "info" | "warn" | "error" | "debug";

const SENSITIVE_KEYS = [
  "password",
  "passwordhash",
  "token",
  "jwt",
  "secret",
  "authorization",
  "cookie",
  "r2_secret_access_key",
  "livekit_api_secret",
];

function sanitize(data: unknown): unknown {
  if (typeof data !== "object" || data === null) {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(sanitize);
  }

  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
    if (SENSITIVE_KEYS.some((sk) => key.toLowerCase().includes(sk))) {
      sanitized[key] = "[REDACTED]";
    } else if (typeof value === "object" && value !== null) {
      sanitized[key] = sanitize(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

function log(level: LogLevel, message: string, meta?: unknown) {
  const timestamp = new Date().toISOString();
  const metaString = meta ? ` | ${JSON.stringify(sanitize(meta))}` : "";
  const prefix = `[${timestamp}] [${level.toUpperCase()}] [IGNITEDDREAMS]`;

  if (level === "error") {
    console.error(`${prefix} ${message}${metaString}`);
  } else if (level === "warn") {
    console.warn(`${prefix} ${message}${metaString}`);
  } else {
    console.log(`${prefix} ${message}${metaString}`);
  }
}

export const logger = {
  info: (msg: string, meta?: unknown) => log("info", msg, meta),
  warn: (msg: string, meta?: unknown) => log("warn", msg, meta),
  error: (msg: string, meta?: unknown) => log("error", msg, meta),
  debug: (msg: string, meta?: unknown) => log("debug", msg, meta),
};
