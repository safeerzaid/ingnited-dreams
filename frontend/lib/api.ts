export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface FetchOptions extends RequestInit {
  data?: unknown;
}

export class ApiError extends Error {
  statusCode: number;
  details?: unknown;

  constructor(message: string, statusCode: number, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.details = details;
  }
}

async function fetcher<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const url = endpoint.startsWith("http") ? endpoint : `${API_URL}/api${endpoint}`;

  const isFormData = typeof FormData !== "undefined" && options.data instanceof FormData;
  const headers: Record<string, string> = {
    // Browser sets the multipart boundary itself for FormData uploads
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(options.headers as Record<string, string>),
  };

  const config: RequestInit = {
    ...options,
    headers,
    credentials: "include", // Sends HTTP-only auth cookies
  };

  if (options.data) {
    config.body = isFormData ? (options.data as FormData) : JSON.stringify(options.data);
  }

  try {
    const res = await fetch(url, config);
    const json = await res.json().catch(() => ({ success: false, message: `Server error (${res.status})` }));

    if (!res.ok || json.success === false) {
      // Zod validation errors carry the useful message in details[0]
      const detailMsg = Array.isArray(json.details) && json.details[0]?.message;
      throw new ApiError(
        detailMsg || json.message || "An unexpected error occurred",
        res.status,
        json.details
      );
    }

    return json.data !== undefined ? json.data : json;
  } catch (err) {
    if (err instanceof ApiError) {
      throw err;
    }
    throw new ApiError(
      err instanceof Error ? err.message : "Network error, please check connection",
      500
    );
  }
}

/** Like api.get but also returns pagination meta */
export async function getWithMeta<T>(endpoint: string) {
  const res = await fetch(`${API_URL}/api${endpoint}`, { credentials: "include" });
  const json = await res.json().catch(() => ({ success: false, message: `Server error (${res.status})` }));
  if (!res.ok || json.success === false) {
    throw new ApiError(json.message || "An unexpected error occurred", res.status, json.details);
  }
  return json as { data: T; meta?: { page: number; limit: number; total: number; totalPages: number } };
}

export const api = {
  get: <T>(endpoint: string, options?: FetchOptions) =>
    fetcher<T>(endpoint, { ...options, method: "GET" }),
  post: <T>(endpoint: string, data?: unknown, options?: FetchOptions) =>
    fetcher<T>(endpoint, { ...options, method: "POST", data }),
  patch: <T>(endpoint: string, data?: unknown, options?: FetchOptions) =>
    fetcher<T>(endpoint, { ...options, method: "PATCH", data }),
  delete: <T>(endpoint: string, data?: unknown, options?: FetchOptions) =>
    fetcher<T>(endpoint, { ...options, method: "DELETE", data }),
};

export default api;
