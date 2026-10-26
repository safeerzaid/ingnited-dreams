// Server components reach the backend directly (inside Docker: http://backend:5000)
const SERVER_API_URL =
  process.env.API_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

/** GET from the public API on the server (uncached: seat counts must be live). Returns null on 404. */
export async function serverGet<T>(endpoint: string): Promise<T | null> {
  const res = await fetch(`${SERVER_API_URL}/api${endpoint}`, { cache: "no-store" });
  if (res.status === 404) return null;
  const json = await res.json();
  if (!res.ok || json.success === false) {
    throw new Error(json.message || `API request failed (${res.status})`);
  }
  return json.data as T;
}
