import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { TestQueryWrapper, createDashboardStats } from "@/test-utils";
import type { DashboardStats } from "@/lib/types";

// Mock modules
vi.mock("@/lib/supabase/client", () => ({ createClient: vi.fn() }));
vi.mock("@/lib/supabase/queries", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/supabase/queries")>();
  return {
    ...actual,
    getDashboardStats: vi.fn(),
  };
});

import { createClient } from "@/lib/supabase/client";
import { getDashboardStats } from "@/lib/supabase/queries";
import { useDashboardStats } from "../use-dashboard-stats";

describe("useDashboardStats", () => {
  const mockClient = {} as ReturnType<typeof createClient>;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(createClient).mockReturnValue(mockClient);
  });

  it("returns loading state initially, then resolves with stats", async () => {
    const stats = createDashboardStats();
    vi.mocked(getDashboardStats).mockResolvedValue(stats);

    const { result } = renderHook(() => useDashboardStats(), {
      wrapper: TestQueryWrapper,
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.stats).toBeNull();

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.stats).toEqual(stats);
    expect(result.current.error).toBeNull();
    expect(getDashboardStats).toHaveBeenCalledWith(mockClient);
  });

  it("returns null stats while loading", () => {
    vi.mocked(getDashboardStats).mockReturnValue(new Promise(() => {})); // never resolves

    const { result } = renderHook(() => useDashboardStats(), {
      wrapper: TestQueryWrapper,
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.stats).toBeNull();
  });

  it("returns error state when getDashboardStats throws", async () => {
    vi.mocked(getDashboardStats).mockRejectedValue(
      new Error("Dashboard statistieken ophalen mislukt: connection error")
    );

    const { result } = renderHook(() => useDashboardStats(), {
      wrapper: TestQueryWrapper,
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toBeTruthy();
    expect(result.current.stats).toBeNull();
  });

  it("calls getDashboardStats with the supabase client", async () => {
    const stats: DashboardStats = createDashboardStats({ totalProperties: 42 });
    vi.mocked(getDashboardStats).mockResolvedValue(stats);

    const { result } = renderHook(() => useDashboardStats(), {
      wrapper: TestQueryWrapper,
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(getDashboardStats).toHaveBeenCalledTimes(1);
    expect(getDashboardStats).toHaveBeenCalledWith(mockClient);
    expect(result.current.stats?.totalProperties).toBe(42);
  });
});
