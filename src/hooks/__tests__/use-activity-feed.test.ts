import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { TestQueryWrapper, createActivityItem } from "@/test-utils";

// Mock modules
vi.mock("@/lib/supabase/client", () => ({ createClient: vi.fn() }));
vi.mock("@/lib/supabase/queries", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/supabase/queries")>();
  return {
    ...actual,
    getActivityFeed: vi.fn(),
  };
});

import { createClient } from "@/lib/supabase/client";
import { getActivityFeed } from "@/lib/supabase/queries";
import { useActivityFeed } from "../use-activity-feed";

describe("useActivityFeed", () => {
  const mockClient = {} as ReturnType<typeof createClient>;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(createClient).mockReturnValue(mockClient);
  });

  it("returns loading state then activity items", async () => {
    const items = [
      createActivityItem({ id: "a1", type: "generated" }),
      createActivityItem({ id: "a2", type: "edited" }),
    ];
    vi.mocked(getActivityFeed).mockResolvedValue(items);

    const { result } = renderHook(() => useActivityFeed(), {
      wrapper: TestQueryWrapper,
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.activities).toEqual(items);
    expect(result.current.error).toBeNull();
  });

  it("returns empty array as default while loading", () => {
    vi.mocked(getActivityFeed).mockReturnValue(new Promise(() => {}));

    const { result } = renderHook(() => useActivityFeed(), {
      wrapper: TestQueryWrapper,
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.activities).toEqual([]);
  });

  it("returns error state on query failure", async () => {
    vi.mocked(getActivityFeed).mockRejectedValue(
      new Error("Activiteit ophalen mislukt: connection error")
    );

    const { result } = renderHook(() => useActivityFeed(), {
      wrapper: TestQueryWrapper,
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toBeTruthy();
    expect(result.current.activities).toEqual([]);
  });

  it("passes custom limit to queryFn", async () => {
    const items = [createActivityItem({ id: "a1" })];
    vi.mocked(getActivityFeed).mockResolvedValue(items);

    const { result } = renderHook(() => useActivityFeed(5), {
      wrapper: TestQueryWrapper,
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(getActivityFeed).toHaveBeenCalledWith(mockClient, 5);
    expect(result.current.activities).toEqual(items);
  });
});
