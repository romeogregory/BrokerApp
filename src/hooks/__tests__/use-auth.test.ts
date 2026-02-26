import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { createMockSupabaseClient, mockRouter, setupNavigationMocks } from "@/test-utils";

// Mock modules
vi.mock("@/lib/supabase/client", () => ({ createClient: vi.fn() }));
vi.mock("next/navigation", () => setupNavigationMocks());

import { createClient } from "@/lib/supabase/client";
import { useAuth } from "../use-auth";

describe("useAuth", () => {
  let mock: ReturnType<typeof createMockSupabaseClient>;

  beforeEach(() => {
    vi.clearAllMocks();
    mock = createMockSupabaseClient();
    vi.mocked(createClient).mockReturnValue(mock.client);
  });

  it("returns isLoading=true initially, then resolves with user/session", async () => {
    const mockSession = {
      user: { id: "user-1", email: "test@example.com" },
      access_token: "token",
      refresh_token: "refresh",
    };
    mock.auth.getSession.mockResolvedValue({
      data: { session: mockSession },
      error: null,
    });

    const { result } = renderHook(() => useAuth());

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.user).toEqual(
      expect.objectContaining({ id: "user-1", email: "test@example.com" })
    );
    expect(result.current.session).toEqual(
      expect.objectContaining({ access_token: "token" })
    );
  });

  it("sets user to null and isLoading=false when getSession returns error", async () => {
    mock.auth.getSession.mockResolvedValue({
      data: { session: null },
      error: { message: "session expired", status: 401 },
    });

    const { result } = renderHook(() => useAuth());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.user).toBeNull();
    expect(result.current.session).toBeNull();
  });

  it("sets user to null when session is null (not authenticated)", async () => {
    mock.auth.getSession.mockResolvedValue({
      data: { session: null },
      error: null,
    });

    const { result } = renderHook(() => useAuth());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.user).toBeNull();
    expect(result.current.session).toBeNull();
  });

  it("updates user/session when onAuthStateChange fires", async () => {
    mock.auth.getSession.mockResolvedValue({
      data: { session: null },
      error: null,
    });

    // Capture the onAuthStateChange callback
    let authChangeCallback: (event: string, session: unknown) => void = () => {};
    mock.auth.onAuthStateChange.mockImplementation(
      (callback: (event: string, session: unknown) => void) => {
        authChangeCallback = callback;
        return { data: { subscription: { unsubscribe: vi.fn() } } };
      }
    );

    const { result } = renderHook(() => useAuth());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.user).toBeNull();

    // Simulate auth state change
    const newSession = {
      user: { id: "user-2", email: "new@example.com" },
      access_token: "new-token",
    };

    act(() => {
      authChangeCallback("SIGNED_IN", newSession);
    });

    expect(result.current.user).toEqual(
      expect.objectContaining({ id: "user-2" })
    );
    expect(result.current.session).toEqual(
      expect.objectContaining({ access_token: "new-token" })
    );
  });

  it("unsubscribes from auth state change on unmount", async () => {
    mock.auth.getSession.mockResolvedValue({
      data: { session: null },
      error: null,
    });

    const unsubscribeMock = vi.fn();
    mock.auth.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: unsubscribeMock } },
    });

    const { result, unmount } = renderHook(() => useAuth());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    unmount();

    expect(unsubscribeMock).toHaveBeenCalled();
  });

  it("signOut calls supabase.auth.signOut and navigates to /login", async () => {
    mock.auth.getSession.mockResolvedValue({
      data: { session: null },
      error: null,
    });
    mock.auth.signOut.mockResolvedValue({ error: null });

    const { result } = renderHook(() => useAuth());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.signOut();
    });

    expect(mock.auth.signOut).toHaveBeenCalled();
    expect(mockRouter.push).toHaveBeenCalledWith("/login");
  });

  it("signOut throws when signOut returns error", async () => {
    mock.auth.getSession.mockResolvedValue({
      data: { session: null },
      error: null,
    });
    mock.auth.signOut.mockResolvedValue({
      error: { message: "signout failed" },
    });

    const { result } = renderHook(() => useAuth());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await expect(result.current.signOut()).rejects.toEqual(
        expect.objectContaining({ message: "signout failed" })
      );
    });
  });
});
