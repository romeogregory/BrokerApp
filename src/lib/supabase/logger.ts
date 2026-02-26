import type { PostgrestError } from "@supabase/postgrest-js";
import { FunctionsHttpError } from "@supabase/supabase-js";
import { StorageError } from "@supabase/storage-js";

export type ErrorCategory = "network" | "auth" | "rls" | "constraint" | "unknown";

export interface LogEntry {
  table: string;
  operation: string;
  duration_ms: number;
  error_category?: ErrorCategory;
  error_message?: string;
  error_code?: string;
  status?: "ok" | "error";
}

const NETWORK_PATTERNS = [
  "FetchError",
  "fetch failed",
  "timeout",
  "ECONNREFUSED",
  "ECONNRESET",
  "ETIMEDOUT",
  "network",
  "AbortError",
];

const CONSTRAINT_CODES = new Set(["23505", "23503", "23502"]);

function isPostgrestError(
  error: unknown
): error is PostgrestError {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    "message" in error &&
    "details" in error
  );
}

function hasStatusCode(
  error: unknown
): error is { status?: number; statusCode?: number } {
  return typeof error === "object" && error !== null;
}

export function classifyError(error: unknown): ErrorCategory {
  if (!error) return "unknown";

  // Check PostgrestError codes first
  if (isPostgrestError(error)) {
    if (error.code === "42501") return "rls";
    if (CONSTRAINT_CODES.has(error.code)) return "constraint";
  }

  // Check message for network patterns
  const message =
    error instanceof Error
      ? error.message
      : isPostgrestError(error)
        ? error.message
        : String(error);

  if (NETWORK_PATTERNS.some((p) => message.toLowerCase().includes(p.toLowerCase()))) {
    return "network";
  }

  // Check HTTP status codes
  if (hasStatusCode(error)) {
    const status = error.status ?? error.statusCode;
    if (status === 401 || status === 403) return "auth";
    if (status !== undefined && status >= 500) return "network";
  }

  // Check FunctionsHttpError for auth
  if (error instanceof FunctionsHttpError) {
    return "auth";
  }

  // Check StorageError
  if (error instanceof StorageError) {
    if (message.includes("401") || message.includes("403")) return "auth";
    return "unknown";
  }

  return "unknown";
}

export function isRetryable(error: unknown): boolean {
  const category = classifyError(error);
  if (category === "network") return true;

  // Also check for 5xx status codes directly
  if (hasStatusCode(error)) {
    const status = error.status ?? error.statusCode;
    if (status !== undefined && status >= 500) return true;
  }

  return false;
}

const isDev = process.env.NODE_ENV !== "production";

export function logQuery(entry: LogEntry): void {
  const payload = {
    ...entry,
    timestamp: new Date().toISOString(),
  };

  const formatted = isDev
    ? JSON.stringify(payload, null, 2)
    : JSON.stringify(payload);

  if (entry.status === "error") {
    console.error("[supabase]", formatted);
  } else {
    console.debug("[supabase]", formatted);
  }
}
