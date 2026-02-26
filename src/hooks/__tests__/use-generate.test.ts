import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { createMockSupabaseClient, TestQueryWrapper, createProperty } from "@/test-utils";
import { Platform, PropertyStatus } from "@/lib/types";

// Mock modules
vi.mock("@/lib/supabase/client", () => ({ createClient: vi.fn() }));
vi.mock("@/lib/supabase/logger", () => ({ logQuery: vi.fn() }));

import { createClient } from "@/lib/supabase/client";
import { logQuery } from "@/lib/supabase/logger";
import { useGenerate } from "../use-generate";

describe("useGenerate", () => {
  let mock: ReturnType<typeof createMockSupabaseClient>;
  const testProperty = createProperty({
    id: "prop-1",
    address: "Keizersgracht 100",
    city: "Amsterdam",
    price: 450000,
    squareMeters: 85,
    rooms: 4,
    bedrooms: 2,
    bathrooms: 1,
    buildYear: 1920,
    energyLabel: "C",
    images: [],
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mock = createMockSupabaseClient();
    vi.mocked(createClient).mockReturnValue(mock.client);
  });

  it("calls supabase.functions.invoke with correct payload", async () => {
    mock.functions.invoke.mockResolvedValue({
      data: {
        title: "Test",
        description: "Desc",
        features: ["F1"],
        platform: "funda",
      },
      error: null,
    });

    // Mock the onSuccess DB operations
    const advertRow = {
      id: "adv-1",
      property_id: "prop-1",
      title: "Test",
      description: "Desc",
      features: ["F1"],
      platform: "funda",
      created_at: "2026-01-16T12:00:00.000Z",
    };
    mock.mockResponse({ data: advertRow });
    mock.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: null,
    });

    const { result } = renderHook(() => useGenerate(), {
      wrapper: TestQueryWrapper,
    });

    await act(async () => {
      result.current.generate(testProperty);
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(mock.functions.invoke).toHaveBeenCalledWith("generate-advert", {
      body: {
        propertyId: "prop-1",
        address: "Keizersgracht 100",
        city: "Amsterdam",
        price: 450000,
        squareMeters: 85,
        rooms: 4,
        bedrooms: 2,
        bathrooms: 1,
        buildYear: 1920,
        energyLabel: "C",
        images: [],
      },
    });
  });

  it("on success: sets advert state with correctly mapped result", async () => {
    mock.functions.invoke.mockResolvedValue({
      data: {
        title: "Prachtig appartement",
        description: "Een geweldig pand",
        features: ["Balkon", "Tuin"],
        platform: "funda",
      },
      error: null,
    });

    const advertRow = {
      id: "adv-1",
      property_id: "prop-1",
      title: "Prachtig appartement",
      description: "Een geweldig pand",
      features: ["Balkon", "Tuin"],
      platform: "funda",
      created_at: "2026-01-16T12:00:00.000Z",
    };
    mock.mockResponse({ data: advertRow });
    mock.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: null,
    });

    const { result } = renderHook(() => useGenerate(), {
      wrapper: TestQueryWrapper,
    });

    await act(async () => {
      result.current.generate(testProperty);
    });

    await waitFor(() => expect(result.current.advert).not.toBeNull());

    expect(result.current.advert).toEqual(
      expect.objectContaining({
        id: "adv-1",
        propertyId: "prop-1",
        title: "Prachtig appartement",
        platform: "funda",
      })
    );
    expect(result.current.error).toBeNull();
  });

  it("sets error on Edge Function failure (401 -> Dutch auth message)", async () => {
    mock.functions.invoke.mockResolvedValue({
      data: null,
      error: { message: "Unauthorized", context: { status: 401 } },
    });

    const { result } = renderHook(() => useGenerate(), {
      wrapper: TestQueryWrapper,
    });

    await act(async () => {
      result.current.generate(testProperty);
    });

    await waitFor(() => expect(result.current.error).not.toBeNull());

    expect(result.current.error).toBe(
      "U bent niet ingelogd. Log opnieuw in."
    );
  });

  it("sets error on Edge Function failure (400 -> Dutch incomplete data message)", async () => {
    mock.functions.invoke.mockResolvedValue({
      data: null,
      error: { message: "Bad Request", context: { status: 400 } },
    });

    const { result } = renderHook(() => useGenerate(), {
      wrapper: TestQueryWrapper,
    });

    await act(async () => {
      result.current.generate(testProperty);
    });

    await waitFor(() => expect(result.current.error).not.toBeNull());

    expect(result.current.error).toBe(
      "Onvolledige woninggegevens. Controleer alle velden."
    );
  });

  it("sets error on Edge Function null data", async () => {
    mock.functions.invoke.mockResolvedValue({
      data: null,
      error: null,
    });

    const { result } = renderHook(() => useGenerate(), {
      wrapper: TestQueryWrapper,
    });

    await act(async () => {
      result.current.generate(testProperty);
    });

    await waitFor(() => expect(result.current.error).not.toBeNull());

    expect(result.current.error).toBe(
      "Generatie mislukt, probeer het opnieuw."
    );
  });

  it("sets error on Edge Function failure (500 -> Dutch generic message)", async () => {
    mock.functions.invoke.mockResolvedValue({
      data: null,
      error: { message: "Internal Error", context: { status: 500 } },
    });

    const { result } = renderHook(() => useGenerate(), {
      wrapper: TestQueryWrapper,
    });

    await act(async () => {
      result.current.generate(testProperty);
    });

    await waitFor(() => expect(result.current.error).not.toBeNull());

    expect(result.current.error).toBe(
      "Generatie mislukt, probeer het opnieuw."
    );
  });

  it("logs but does not throw when activity_log insert fails in onSuccess", async () => {
    mock.functions.invoke.mockResolvedValue({
      data: {
        title: "Test",
        description: "Desc",
        features: [],
        platform: "funda",
      },
      error: null,
    });

    // Track from() calls to return different responses
    let fromCallCount = 0;
    const advertRow = {
      id: "adv-1",
      property_id: "prop-1",
      title: "Test",
      description: "Desc",
      features: [],
      platform: "funda",
      created_at: "2026-01-16T12:00:00.000Z",
    };

    mock.chainable.then = (resolve: (value: unknown) => void) => {
      fromCallCount++;
      if (fromCallCount <= 2) {
        // First two: advert insert + property update succeed
        resolve({ data: advertRow, error: null, count: null });
      } else {
        // Third: activity_log insert fails
        resolve({
          data: null,
          error: { message: "activity log failed", code: "UNKNOWN" },
          count: null,
        });
      }
    };

    mock.auth.getUser.mockResolvedValue({
      data: { user: { id: "user-1" } },
      error: null,
    });

    const { result } = renderHook(() => useGenerate(), {
      wrapper: TestQueryWrapper,
    });

    await act(async () => {
      result.current.generate(testProperty);
    });

    await waitFor(() => expect(result.current.advert).not.toBeNull());

    expect(logQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        table: "activity_log",
        operation: "insert",
        status: "error",
      })
    );
    // Should still set advert successfully
    expect(result.current.error).toBeNull();
  });

  it("sets error when advert insert fails in onSuccess", async () => {
    mock.functions.invoke.mockResolvedValue({
      data: {
        title: "Test",
        description: "Desc",
        features: [],
        platform: "funda",
      },
      error: null,
    });

    mock.mockResponse({
      data: null,
      error: { message: "insert failed", code: "23505" },
    });

    const { result } = renderHook(() => useGenerate(), {
      wrapper: TestQueryWrapper,
    });

    await act(async () => {
      result.current.generate(testProperty);
    });

    await waitFor(() => expect(result.current.error).not.toBeNull());

    expect(result.current.error).toContain("Advertentie opslaan mislukt");
  });

  it("sets error when property status update fails in onSuccess", async () => {
    mock.functions.invoke.mockResolvedValue({
      data: {
        title: "Test",
        description: "Desc",
        features: [],
        platform: "funda",
      },
      error: null,
    });

    // First from() call (advert insert) succeeds, second (property update) fails
    let fromCallCount = 0;
    const advertRow = {
      id: "adv-1",
      property_id: "prop-1",
      title: "Test",
      description: "Desc",
      features: [],
      platform: "funda",
      created_at: "2026-01-16T12:00:00.000Z",
    };

    mock.chainable.then = (resolve: (value: unknown) => void) => {
      fromCallCount++;
      if (fromCallCount === 1) {
        resolve({ data: advertRow, error: null, count: null });
      } else {
        resolve({
          data: null,
          error: { message: "update failed", code: "42501" },
          count: null,
        });
      }
    };

    const { result } = renderHook(() => useGenerate(), {
      wrapper: TestQueryWrapper,
    });

    await act(async () => {
      result.current.generate(testProperty);
    });

    await waitFor(() => expect(result.current.error).not.toBeNull());

    expect(result.current.error).toContain("Woningsstatus bijwerken mislukt");
  });

  it("reset() clears both advert and error state", async () => {
    // First trigger an error
    mock.functions.invoke.mockResolvedValue({
      data: null,
      error: { message: "fail", context: { status: 500 } },
    });

    const { result } = renderHook(() => useGenerate(), {
      wrapper: TestQueryWrapper,
    });

    await act(async () => {
      result.current.generate(testProperty);
    });

    await waitFor(() => expect(result.current.error).not.toBeNull());

    act(() => {
      result.current.reset();
    });

    expect(result.current.advert).toBeNull();
    expect(result.current.error).toBeNull();
  });
});
