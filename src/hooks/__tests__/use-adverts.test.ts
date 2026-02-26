import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { createMockSupabaseClient, TestQueryWrapper } from "@/test-utils";
import { Platform, PropertyStatus } from "@/lib/types";

// Mock modules
vi.mock("@/lib/supabase/client", () => ({ createClient: vi.fn() }));
vi.mock("@/lib/supabase/logger", () => ({ logQuery: vi.fn() }));

import { createClient } from "@/lib/supabase/client";
import { logQuery } from "@/lib/supabase/logger";
import { useAdvert, useSaveAdvert, usePublishAdvert } from "../use-adverts";

describe("useAdverts", () => {
  let mock: ReturnType<typeof createMockSupabaseClient>;

  beforeEach(() => {
    vi.clearAllMocks();
    mock = createMockSupabaseClient();
    vi.mocked(createClient).mockReturnValue(mock.client);
  });

  describe("useAdvert", () => {
    it("returns loading then advert data when found", async () => {
      const advertRow = {
        id: "adv-1",
        property_id: "prop-1",
        title: "Mooi appartement",
        description: "Een prachtig appartement",
        features: ["Balkon", "Parkeerplaats"],
        platform: "funda",
        created_at: "2026-01-16T12:00:00.000Z",
      };
      mock.mockResponse({ data: advertRow });

      const { result } = renderHook(() => useAdvert("prop-1"), {
        wrapper: TestQueryWrapper,
      });

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.advert).toEqual({
        id: "adv-1",
        propertyId: "prop-1",
        title: "Mooi appartement",
        description: "Een prachtig appartement",
        features: ["Balkon", "Parkeerplaats"],
        platform: Platform.Funda,
        createdAt: new Date("2026-01-16T12:00:00.000Z"),
      });
      expect(result.current.error).toBeNull();
    });

    it("returns null when maybeSingle returns null", async () => {
      mock.mockResponse({ data: null });

      const { result } = renderHook(() => useAdvert("prop-1"), {
        wrapper: TestQueryWrapper,
      });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.advert).toBeNull();
      expect(result.current.error).toBeNull();
    });

    it("is disabled when propertyId is undefined", () => {
      const { result } = renderHook(() => useAdvert(undefined), {
        wrapper: TestQueryWrapper,
      });

      expect(result.current.isLoading).toBe(false);
      expect(mock.from).not.toHaveBeenCalled();
    });

    it("throws Dutch error on query failure", async () => {
      mock.mockResponse({
        data: null,
        error: { message: "relation does not exist", code: "42P01" },
      });

      const { result } = renderHook(() => useAdvert("prop-1"), {
        wrapper: TestQueryWrapper,
      });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.error).toBeTruthy();
      expect(result.current.error?.message).toContain(
        "Advertentie ophalen mislukt"
      );
    });
  });

  describe("useSaveAdvert", () => {
    const saveInput = {
      propertyId: "prop-1",
      title: "Nieuw",
      description: "Beschrijving",
      features: ["Feature1"],
      platform: Platform.Funda,
      propertyAddress: "Keizersgracht 100, Amsterdam",
    };

    it("upserts advert and returns mapped Advert on success", async () => {
      const advertRow = {
        id: "adv-1",
        property_id: "prop-1",
        title: "Nieuw",
        description: "Beschrijving",
        features: ["Feature1"],
        platform: "funda",
        created_at: "2026-01-16T12:00:00.000Z",
      };
      mock.mockResponse({ data: advertRow });
      mock.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const { result } = renderHook(() => useSaveAdvert(), {
        wrapper: TestQueryWrapper,
      });

      let advert: unknown;
      await act(async () => {
        advert = await result.current.saveAdvert(saveInput);
      });

      expect(advert).toEqual(
        expect.objectContaining({
          id: "adv-1",
          propertyId: "prop-1",
          title: "Nieuw",
          platform: Platform.Funda,
        })
      );
      expect(mock.from).toHaveBeenCalledWith("adverts");
    });

    it("creates activity_log entry when user is authenticated", async () => {
      const advertRow = {
        id: "adv-1",
        property_id: "prop-1",
        title: "T",
        description: "D",
        features: [],
        platform: "funda",
        created_at: "2026-01-16T12:00:00.000Z",
      };
      mock.mockResponse({ data: advertRow });
      mock.auth.getUser.mockResolvedValue({
        data: { user: { id: "user-123" } },
        error: null,
      });

      const { result } = renderHook(() => useSaveAdvert(), {
        wrapper: TestQueryWrapper,
      });

      await act(async () => {
        await result.current.saveAdvert(saveInput);
      });

      // from() is called for both "adverts" (upsert) and "activity_log" (insert)
      expect(mock.from).toHaveBeenCalledWith("activity_log");
    });

    it("logs but does not throw when activity_log insert fails", async () => {
      // First call: upsert succeeds
      const advertRow = {
        id: "adv-1",
        property_id: "prop-1",
        title: "T",
        description: "D",
        features: [],
        platform: "funda",
        created_at: "2026-01-16T12:00:00.000Z",
      };

      // We need the first from().upsert chain to succeed, then the second from().insert chain to fail.
      // Since the mock uses shared currentResponse, we need to track calls.
      // The mock's thenable resolves to currentResponse at the time of await.
      // For this test, we set the response to success first, then after getUser, we set to error.
      let callCount = 0;
      mock.chainable.then = (resolve: (value: unknown) => void) => {
        callCount++;
        if (callCount <= 1) {
          // First await: upsert success
          resolve({ data: advertRow, error: null, count: null });
        } else {
          // Second await: activity_log insert failure
          resolve({
            data: null,
            error: { message: "permission denied", code: "42501" },
            count: null,
          });
        }
      };

      mock.auth.getUser.mockResolvedValue({
        data: { user: { id: "user-123" } },
        error: null,
      });

      const { result } = renderHook(() => useSaveAdvert(), {
        wrapper: TestQueryWrapper,
      });

      // Should NOT throw even though activity_log fails
      await act(async () => {
        await result.current.saveAdvert(saveInput);
      });

      expect(logQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          table: "activity_log",
          operation: "insert",
          status: "error",
        })
      );
    });

    it("throws Dutch error when upsert fails", async () => {
      mock.mockResponse({
        data: null,
        error: { message: "unique violation", code: "23505" },
      });

      const { result } = renderHook(() => useSaveAdvert(), {
        wrapper: TestQueryWrapper,
      });

      await act(async () => {
        await expect(result.current.saveAdvert(saveInput)).rejects.toThrow(
          "Advertentie opslaan mislukt"
        );
      });
    });

    it("skips activity_log when no user session", async () => {
      const advertRow = {
        id: "adv-1",
        property_id: "prop-1",
        title: "T",
        description: "D",
        features: [],
        platform: "funda",
        created_at: "2026-01-16T12:00:00.000Z",
      };
      mock.mockResponse({ data: advertRow });
      mock.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const { result } = renderHook(() => useSaveAdvert(), {
        wrapper: TestQueryWrapper,
      });

      await act(async () => {
        await result.current.saveAdvert(saveInput);
      });

      // from() should only be called for "adverts" upsert, not for "activity_log"
      const fromCalls = mock.from.mock.calls.map((c) => c[0]);
      expect(fromCalls).not.toContain("activity_log");
    });
  });

  describe("usePublishAdvert", () => {
    const publishInput = {
      propertyId: "prop-1",
      propertyAddress: "Keizersgracht 100, Amsterdam",
      platform: Platform.Funda,
    };

    it("updates property status to Published", async () => {
      mock.mockResponse({ data: null, error: null });
      mock.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const { result } = renderHook(() => usePublishAdvert(), {
        wrapper: TestQueryWrapper,
      });

      await act(async () => {
        await result.current.publishAdvert(publishInput);
      });

      expect(mock.from).toHaveBeenCalledWith("properties");
      expect(mock.chainable.update).toHaveBeenCalledWith({
        status: PropertyStatus.Published,
      });
    });

    it("creates activity_log entry on success", async () => {
      mock.mockResponse({ data: null, error: null });
      mock.auth.getUser.mockResolvedValue({
        data: { user: { id: "user-123" } },
        error: null,
      });

      const { result } = renderHook(() => usePublishAdvert(), {
        wrapper: TestQueryWrapper,
      });

      await act(async () => {
        await result.current.publishAdvert(publishInput);
      });

      expect(mock.from).toHaveBeenCalledWith("activity_log");
    });

    it("logs but does not throw when activity_log fails", async () => {
      let callCount = 0;
      mock.chainable.then = (resolve: (value: unknown) => void) => {
        callCount++;
        if (callCount <= 1) {
          resolve({ data: null, error: null, count: null });
        } else {
          resolve({
            data: null,
            error: { message: "log failed", code: "UNKNOWN" },
            count: null,
          });
        }
      };

      mock.auth.getUser.mockResolvedValue({
        data: { user: { id: "user-123" } },
        error: null,
      });

      const { result } = renderHook(() => usePublishAdvert(), {
        wrapper: TestQueryWrapper,
      });

      await act(async () => {
        await result.current.publishAdvert(publishInput);
      });

      expect(logQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          table: "activity_log",
          operation: "insert",
          status: "error",
        })
      );
    });

    it("throws Dutch error when property update fails", async () => {
      mock.mockResponse({
        data: null,
        error: { message: "not found", code: "PGRST116" },
      });

      const { result } = renderHook(() => usePublishAdvert(), {
        wrapper: TestQueryWrapper,
      });

      await act(async () => {
        await expect(
          result.current.publishAdvert(publishInput)
        ).rejects.toThrow("Publiceren mislukt");
      });
    });
  });
});
