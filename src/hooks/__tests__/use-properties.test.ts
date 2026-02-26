import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { TestQueryWrapper, createProperty } from "@/test-utils";
import { PropertyStatus } from "@/lib/types";
import type { Property } from "@/lib/types";

// Mock modules
vi.mock("@/lib/supabase/client", () => ({ createClient: vi.fn() }));
vi.mock("@/lib/supabase/queries", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/supabase/queries")>();
  return {
    ...actual,
    getProperties: vi.fn(),
    getPropertyById: vi.fn(),
    getRecentProperties: vi.fn(),
  };
});
vi.mock("@/lib/supabase/mutations", () => ({
  createProperty: vi.fn(),
  updateProperty: vi.fn(),
  deleteProperty: vi.fn(),
}));

import { createClient } from "@/lib/supabase/client";
import {
  getProperties,
  getPropertyById,
  getRecentProperties,
} from "@/lib/supabase/queries";
import {
  createProperty as createPropertyMutation,
  updateProperty as updatePropertyMutation,
  deleteProperty as deletePropertyMutation,
} from "@/lib/supabase/mutations";
import {
  useProperties,
  useProperty,
  useRecentProperties,
  useCreateProperty,
  useUpdateProperty,
  useDeleteProperty,
} from "../use-properties";

describe("useProperties", () => {
  const mockClient = {} as ReturnType<typeof createClient>;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(createClient).mockReturnValue(mockClient);
  });

  describe("useProperties", () => {
    it("returns loading state initially, then resolves with properties", async () => {
      const props = [
        createProperty({ id: "p1" }),
        createProperty({ id: "p2" }),
      ];
      vi.mocked(getProperties).mockResolvedValue(props);

      const { result } = renderHook(() => useProperties(), {
        wrapper: TestQueryWrapper,
      });

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.properties).toEqual(props);
      expect(result.current.error).toBeNull();
    });

    it("returns empty array when query returns no data", async () => {
      vi.mocked(getProperties).mockResolvedValue([]);

      const { result } = renderHook(() => useProperties(), {
        wrapper: TestQueryWrapper,
      });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.properties).toEqual([]);
    });

    it("passes status filter to queryFn when provided", async () => {
      vi.mocked(getProperties).mockResolvedValue([]);

      const { result } = renderHook(
        () => useProperties(PropertyStatus.Published),
        { wrapper: TestQueryWrapper }
      );

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(getProperties).toHaveBeenCalledWith(
        mockClient,
        PropertyStatus.Published
      );
    });

    it("surfaces error when query fails", async () => {
      vi.mocked(getProperties).mockRejectedValue(
        new Error("Woningen ophalen mislukt: connection error")
      );

      const { result } = renderHook(() => useProperties(), {
        wrapper: TestQueryWrapper,
      });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.error).toBeTruthy();
      expect(result.current.properties).toEqual([]);
    });

    it("provides getById helper that finds properties by id", async () => {
      const p1 = createProperty({ id: "p1" });
      const p2 = createProperty({ id: "p2" });
      vi.mocked(getProperties).mockResolvedValue([p1, p2]);

      const { result } = renderHook(() => useProperties(), {
        wrapper: TestQueryWrapper,
      });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.getById("p1")).toEqual(p1);
      expect(result.current.getById("nonexistent")).toBeUndefined();
    });
  });

  describe("useProperty", () => {
    it("returns loading then property data for valid ID", async () => {
      const property = createProperty({ id: "p1" });
      vi.mocked(getPropertyById).mockResolvedValue(property);

      const { result } = renderHook(() => useProperty("p1"), {
        wrapper: TestQueryWrapper,
      });

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.property).toEqual(property);
      expect(result.current.error).toBeNull();
    });

    it("returns null when property not found", async () => {
      vi.mocked(getPropertyById).mockResolvedValue(null);

      const { result } = renderHook(() => useProperty("nonexistent"), {
        wrapper: TestQueryWrapper,
      });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.property).toBeNull();
    });

    it("does not fetch when id is undefined", () => {
      const { result } = renderHook(() => useProperty(undefined), {
        wrapper: TestQueryWrapper,
      });

      // isLoading should be false because the query is disabled
      expect(result.current.isLoading).toBe(false);
      expect(getPropertyById).not.toHaveBeenCalled();
    });

    it("surfaces error on query failure", async () => {
      vi.mocked(getPropertyById).mockRejectedValue(
        new Error("Woning ophalen mislukt: server error")
      );

      const { result } = renderHook(() => useProperty("p1"), {
        wrapper: TestQueryWrapper,
      });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.error).toBeTruthy();
      expect(result.current.property).toBeNull();
    });
  });

  describe("useRecentProperties", () => {
    it("returns loading then limited property list", async () => {
      const props = [
        createProperty({ id: "r1" }),
        createProperty({ id: "r2" }),
        createProperty({ id: "r3" }),
      ];
      vi.mocked(getRecentProperties).mockResolvedValue(props);

      const { result } = renderHook(() => useRecentProperties(), {
        wrapper: TestQueryWrapper,
      });

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.properties).toEqual(props);
      expect(getRecentProperties).toHaveBeenCalledWith(mockClient, 3);
    });

    it("respects custom limit parameter", async () => {
      vi.mocked(getRecentProperties).mockResolvedValue([]);

      const { result } = renderHook(() => useRecentProperties(5), {
        wrapper: TestQueryWrapper,
      });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(getRecentProperties).toHaveBeenCalledWith(mockClient, 5);
    });

    it("returns error state on failure", async () => {
      vi.mocked(getRecentProperties).mockRejectedValue(
        new Error("Recente woningen ophalen mislukt: timeout")
      );

      const { result } = renderHook(() => useRecentProperties(), {
        wrapper: TestQueryWrapper,
      });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.error).toBeTruthy();
      expect(result.current.properties).toEqual([]);
    });
  });

  describe("useCreateProperty", () => {
    it("calls createProperty mutation and returns created property", async () => {
      const created = createProperty({ id: "new-1" });
      vi.mocked(createPropertyMutation).mockResolvedValue(created);

      const { result } = renderHook(() => useCreateProperty(), {
        wrapper: TestQueryWrapper,
      });

      let returnedProperty: Property | undefined;
      await act(async () => {
        returnedProperty = await result.current.createProperty({
          userId: "user-1",
          address: "Prinsengracht 200",
          postalCode: "1016 AA",
          city: "Amsterdam",
          price: 500000,
          squareMeters: 90,
          rooms: 4,
          bedrooms: 2,
          bathrooms: 1,
          buildYear: 1900,
          energyLabel: "B",
        });
      });

      expect(returnedProperty).toEqual(created);
      expect(createPropertyMutation).toHaveBeenCalledWith(
        mockClient,
        expect.objectContaining({ address: "Prinsengracht 200" })
      );
    });

    it("returns error on failure", async () => {
      vi.mocked(createPropertyMutation).mockRejectedValue(
        new Error("Woning aanmaken mislukt: duplicate")
      );

      const { result } = renderHook(() => useCreateProperty(), {
        wrapper: TestQueryWrapper,
      });

      await act(async () => {
        await expect(
          result.current.createProperty({
            userId: "user-1",
            address: "Test",
            postalCode: "1000 AA",
            city: "Test",
            price: 1,
            squareMeters: 1,
            rooms: 1,
            bedrooms: 1,
            bathrooms: 1,
            buildYear: 2000,
            energyLabel: "A",
          })
        ).rejects.toThrow("Woning aanmaken mislukt");
      });
    });
  });

  describe("useUpdateProperty", () => {
    it("calls updateProperty with id and partial data", async () => {
      const updated = createProperty({ id: "p1", price: 600000 });
      vi.mocked(updatePropertyMutation).mockResolvedValue(updated);

      const { result } = renderHook(() => useUpdateProperty(), {
        wrapper: TestQueryWrapper,
      });

      let returnedProperty: Property | undefined;
      await act(async () => {
        returnedProperty = await result.current.updateProperty({
          id: "p1",
          data: { price: 600000 },
        });
      });

      expect(returnedProperty).toEqual(updated);
      expect(updatePropertyMutation).toHaveBeenCalledWith(
        mockClient,
        "p1",
        { price: 600000 }
      );
    });

    it("returns error on failure", async () => {
      vi.mocked(updatePropertyMutation).mockRejectedValue(
        new Error("Woning bijwerken mislukt: not found")
      );

      const { result } = renderHook(() => useUpdateProperty(), {
        wrapper: TestQueryWrapper,
      });

      await act(async () => {
        await expect(
          result.current.updateProperty({ id: "p1", data: { price: 1 } })
        ).rejects.toThrow("Woning bijwerken mislukt");
      });
    });
  });

  describe("useDeleteProperty", () => {
    it("calls deleteProperty with id", async () => {
      vi.mocked(deletePropertyMutation).mockResolvedValue(undefined);

      const { result } = renderHook(() => useDeleteProperty(), {
        wrapper: TestQueryWrapper,
      });

      await act(async () => {
        await result.current.deleteProperty("p1");
      });

      expect(deletePropertyMutation).toHaveBeenCalledWith(mockClient, "p1");
    });

    it("returns error on failure", async () => {
      vi.mocked(deletePropertyMutation).mockRejectedValue(
        new Error("Woning verwijderen mislukt: permission denied")
      );

      const { result } = renderHook(() => useDeleteProperty(), {
        wrapper: TestQueryWrapper,
      });

      await act(async () => {
        await expect(
          result.current.deleteProperty("p1")
        ).rejects.toThrow("Woning verwijderen mislukt");
      });
    });
  });
});
