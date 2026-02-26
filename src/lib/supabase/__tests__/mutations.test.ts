import { describe, it, expect, beforeEach } from "vitest";
import { createMockSupabaseClient, createPropertyRow, resetFactories } from "@/test-utils";
import { PropertyStatus } from "@/lib/types";
import {
  createProperty,
  updateProperty,
  deleteProperty,
} from "@/lib/supabase/mutations";
import type { CreatePropertyInput } from "@/lib/supabase/mutations";

const fullInput: CreatePropertyInput = {
  userId: "user-1",
  address: "Herengracht 10",
  postalCode: "1015 BN",
  city: "Amsterdam",
  price: 500000,
  squareMeters: 120,
  rooms: 5,
  bedrooms: 3,
  bathrooms: 2,
  buildYear: 1890,
  energyLabel: "B",
};

describe("createProperty", () => {
  let mock: ReturnType<typeof createMockSupabaseClient>;

  beforeEach(() => {
    resetFactories();
    mock = createMockSupabaseClient();
  });

  it("inserts row with all fields mapped from camelCase to snake_case", async () => {
    const row = createPropertyRow({
      id: "new-prop",
      user_id: "user-1",
      address: "Herengracht 10",
      postal_code: "1015 BN",
      city: "Amsterdam",
      price: 500000,
      square_meters: 120,
      rooms: 5,
      bedrooms: 3,
      bathrooms: 2,
      build_year: 1890,
      energy_label: "B",
    });
    mock.mockResponse({ data: row });

    await createProperty(mock.client, fullInput);

    expect(mock.from).toHaveBeenCalledWith("properties");
    expect(mock.chainable.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: "user-1",
        address: "Herengracht 10",
        postal_code: "1015 BN",
        city: "Amsterdam",
        price: 500000,
        square_meters: 120,
        rooms: 5,
        bedrooms: 3,
        bathrooms: 2,
        build_year: 1890,
        energy_label: "B",
      })
    );
  });

  it("returns mapped Property from inserted row", async () => {
    const row = createPropertyRow({ id: "created-1" });
    mock.mockResponse({ data: row });

    const result = await createProperty(mock.client, fullInput);

    expect(result.id).toBe("created-1");
    expect(result.createdAt).toBeInstanceOf(Date);
    expect(result.postalCode).toBe("1015 AA"); // from factory default
  });

  it("throws Dutch error message on error", async () => {
    mock.mockResponse({ error: { message: "duplicate key", code: "23505" } });

    await expect(createProperty(mock.client, fullInput)).rejects.toThrow(
      "Woning aanmaken mislukt: duplicate key"
    );
  });

  it("handles optional fields (id, organizationId, status, images)", async () => {
    const inputWithOptionals: CreatePropertyInput = {
      ...fullInput,
      id: "custom-id",
      organizationId: "org-1",
      status: PropertyStatus.Published,
      images: ["img1.jpg"],
    };
    const row = createPropertyRow({ id: "custom-id" });
    mock.mockResponse({ data: row });

    await createProperty(mock.client, inputWithOptionals);

    expect(mock.chainable.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "custom-id",
        organization_id: "org-1",
        status: "published",
        images: ["img1.jpg"],
      })
    );
  });
});

describe("updateProperty", () => {
  let mock: ReturnType<typeof createMockSupabaseClient>;

  beforeEach(() => {
    resetFactories();
    mock = createMockSupabaseClient();
  });

  it("updates with partial input (only changed fields)", async () => {
    const row = createPropertyRow({ id: "upd-1", price: 600000 });
    mock.mockResponse({ data: row });

    await updateProperty(mock.client, "upd-1", { price: 600000 });

    expect(mock.chainable.update).toHaveBeenCalledWith(
      expect.objectContaining({ price: 600000 })
    );
    // Should not include fields not in the partial input
    const updateArg = (mock.chainable.update as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(updateArg).not.toHaveProperty("user_id");
    expect(updateArg).not.toHaveProperty("address");
  });

  it("calls .eq('id', id) to target correct row", async () => {
    const row = createPropertyRow({ id: "upd-2" });
    mock.mockResponse({ data: row });

    await updateProperty(mock.client, "upd-2", { city: "Rotterdam" });

    expect(mock.chainable.eq).toHaveBeenCalledWith("id", "upd-2");
  });

  it("returns mapped Property from updated row", async () => {
    const row = createPropertyRow({ id: "upd-3", city: "Rotterdam" });
    mock.mockResponse({ data: row });

    const result = await updateProperty(mock.client, "upd-3", { city: "Rotterdam" });

    expect(result.id).toBe("upd-3");
    expect(result.city).toBe("Rotterdam");
    expect(result.createdAt).toBeInstanceOf(Date);
  });

  it("throws Dutch error message on error", async () => {
    mock.mockResponse({ error: { message: "row not found", code: "PGRST116" } });

    await expect(updateProperty(mock.client, "bad-id", { price: 1 })).rejects.toThrow(
      "Woning bijwerken mislukt: row not found"
    );
  });
});

describe("deleteProperty", () => {
  let mock: ReturnType<typeof createMockSupabaseClient>;

  beforeEach(() => {
    resetFactories();
    mock = createMockSupabaseClient();
  });

  it("calls .delete().eq('id', id) on properties table", async () => {
    mock.mockResponse({ data: null });

    await deleteProperty(mock.client, "del-1");

    expect(mock.from).toHaveBeenCalledWith("properties");
    expect(mock.chainable.delete).toHaveBeenCalled();
    expect(mock.chainable.eq).toHaveBeenCalledWith("id", "del-1");
  });

  it("returns void on success", async () => {
    mock.mockResponse({ data: null });

    const result = await deleteProperty(mock.client, "del-2");

    expect(result).toBeUndefined();
  });

  it("throws Dutch error message on error", async () => {
    mock.mockResponse({ error: { message: "foreign key violation", code: "23503" } });

    await expect(deleteProperty(mock.client, "del-3")).rejects.toThrow(
      "Woning verwijderen mislukt: foreign key violation"
    );
  });
});
