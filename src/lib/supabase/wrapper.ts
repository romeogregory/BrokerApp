import type { SupabaseClient } from "@supabase/supabase-js";
import { classifyError, isRetryable, logQuery } from "./logger";

const TERMINAL_METHODS = ["select", "insert", "update", "upsert", "delete"] as const;

const MAX_RETRIES = (() => {
  const envVal = typeof process !== "undefined"
    ? process.env.SUPABASE_QUERY_MAX_RETRIES
    : undefined;
  const parsed = envVal ? parseInt(envVal, 10) : NaN;
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 3;
})();

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function backoffMs(attempt: number): number {
  return Math.min(1000 * Math.pow(2, attempt), 10000);
}

function isPostgrestError(
  error: unknown
): error is { code: string; message: string; details: string } {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    "message" in error &&
    "details" in error
  );
}

function wrapThen(
  originalThen: PromiseLike<unknown>["then"],
  context: { table: string; operation: string },
  originalBuilder: unknown
): PromiseLike<unknown>["then"] {
  return function wrappedThen(onfulfilled, onrejected) {
    const start = performance.now();

    async function executeWithRetry(attempt: number): Promise<unknown> {
      const result = await originalThen.call(originalBuilder, (res: unknown) => res);
      const typedResult = result as { error?: unknown; data?: unknown };

      if (typedResult.error) {
        const duration_ms = Math.round(performance.now() - start);
        const error = typedResult.error;

        if (isRetryable(error) && attempt < MAX_RETRIES) {
          await delay(backoffMs(attempt));
          // Re-execute by calling originalThen again
          return executeWithRetry(attempt + 1);
        }

        const errorCategory = classifyError(error);
        logQuery({
          table: context.table,
          operation: context.operation,
          duration_ms,
          status: "error",
          error_category: errorCategory,
          error_message: isPostgrestError(error) ? error.message : String(error),
          error_code: isPostgrestError(error) ? error.code : undefined,
        });

        return typedResult;
      }

      const duration_ms = Math.round(performance.now() - start);
      logQuery({
        table: context.table,
        operation: context.operation,
        duration_ms,
        status: "ok",
      });

      return typedResult;
    }

    const promise = executeWithRetry(0);
    return promise.then(onfulfilled, onrejected);
  };
}

function proxyFilterBuilder(
  filterBuilder: Record<string, unknown>,
  context: { table: string; operation: string }
): typeof filterBuilder {
  return new Proxy(filterBuilder, {
    get(target, prop, receiver) {
      const value = Reflect.get(target, prop, receiver);

      if (prop === "then" && typeof value === "function") {
        return wrapThen(
          value as PromiseLike<unknown>["then"],
          context,
          target
        );
      }

      // For chained methods (eq, filter, order, etc.), proxy the return value too
      if (typeof value === "function" && prop !== "then") {
        return function (this: unknown, ...args: unknown[]) {
          const result = value.apply(target, args);
          // If the method returns an object with a then (still a builder), proxy it
          if (result && typeof result === "object" && "then" in result) {
            return proxyFilterBuilder(result as Record<string, unknown>, context);
          }
          return result;
        };
      }

      return value;
    },
  });
}

function proxyQueryBuilder(
  queryBuilder: Record<string, unknown>,
  table: string
): typeof queryBuilder {
  return new Proxy(queryBuilder, {
    get(target, prop, receiver) {
      const value = Reflect.get(target, prop, receiver);

      if (
        typeof value === "function" &&
        TERMINAL_METHODS.includes(prop as (typeof TERMINAL_METHODS)[number])
      ) {
        return function (this: unknown, ...args: unknown[]) {
          const filterBuilder = value.apply(target, args);
          return proxyFilterBuilder(
            filterBuilder as Record<string, unknown>,
            { table, operation: String(prop) }
          );
        };
      }

      return value;
    },
  });
}

export function wrapClient(client: SupabaseClient): SupabaseClient {
  return new Proxy(client, {
    get(target, prop, receiver) {
      const value = Reflect.get(target, prop, receiver);

      if (prop === "from" && typeof value === "function") {
        return function (this: unknown, table: string, ...args: unknown[]) {
          const queryBuilder = value.apply(target, [table, ...args]);
          return proxyQueryBuilder(
            queryBuilder as Record<string, unknown>,
            table
          );
        };
      }

      return value;
    },
  }) as SupabaseClient;
}
