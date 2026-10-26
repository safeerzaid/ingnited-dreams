// Vercel serverless entry: serves the same Express app as src/server.ts.
// The hourly recording cleanup cron does not run on Vercel; trigger it with
// POST /api/internal/cleanup-recordings (x-cleanup-secret header) when needed.
import app from "../src/app";

export default app;
