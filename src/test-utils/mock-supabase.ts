import { vi } from "vitest";

type MockResponse<T = unknown> = {
  data: T | null;
  error: { message: string; code: string } | null;
  count: number | null;
};

export function createMockSupabaseClient() {
  let currentResponse: MockResponse = { data: null, error: null, count: null };

  const chainable: Record<string, unknown> = {};

  const chainMethods = [
    "select", "insert", "update", "upsert", "delete",
    "eq", "neq", "gt", "gte", "lt", "lte",
    "like", "ilike", "in", "is",
    "order", "limit", "range",
    "single", "maybeSingle", "csv", "head",
  ];

  for (const method of chainMethods) {
    chainable[method] = vi.fn().mockReturnValue(chainable);
  }

  // Make the chain thenable -- when awaited, resolves to currentResponse
  chainable.then = (resolve: (value: MockResponse) => void) => {
    resolve(currentResponse);
  };

  const from = vi.fn().mockReturnValue(chainable);
  const rpc = vi.fn().mockResolvedValue(currentResponse);

  const authMock = {
    getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
    getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
    signInWithPassword: vi.fn().mockResolvedValue({ data: { session: null, user: null }, error: null }),
    signUp: vi.fn().mockResolvedValue({ data: { session: null, user: null }, error: null }),
    signOut: vi.fn().mockResolvedValue({ error: null }),
    onAuthStateChange: vi.fn().mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    }),
  };

  const storageBucket = {
    upload: vi.fn().mockResolvedValue({ data: { path: "" }, error: null }),
    remove: vi.fn().mockResolvedValue({ data: [], error: null }),
    getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: "https://example.com/image.jpg" } }),
  };

  const storage = { from: vi.fn().mockReturnValue(storageBucket) };
  const functions = { invoke: vi.fn().mockResolvedValue({ data: null, error: null }) };

  const client = { from, rpc, auth: authMock, storage, functions } as unknown;

  function mockResponse(response: Partial<MockResponse>) {
    currentResponse = {
      data: response.data ?? null,
      error: response.error ?? null,
      count: response.count ?? null,
    };
  }

  function mockAuthSession(session: unknown) {
    authMock.getSession.mockResolvedValue({ data: { session }, error: null });
  }

  return {
    client: client as ReturnType<typeof import("@supabase/supabase-js").createClient>,
    from, rpc, auth: authMock, storage, storageBucket, functions,
    chainable, mockResponse, mockAuthSession,
  };
}
