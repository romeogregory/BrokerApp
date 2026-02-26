import { describe, it, expect, beforeEach } from "vitest";
import { createMockSupabaseClient, createPropertyRow, resetFactories } from "@/test-utils";
import { PropertyStatus } from "@/lib/types";
import {
  mapRowToProperty,
  queryKeys,
  getProperties,
  getPropertyById,
  getRecentProperties,
  getDashboardStats,
  getActivityFeed,
} from "@/lib/supabase/queries";

describe("mapRowToProperty", () => {
  it("maps all snake_case DB columns to camelCase domain fields", () => {
    const row = createPropertyRow({
      id: "prop-1",
      user_id: "user-1",
      organization_id: "org-1",
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
      status: "published",
      images: ["img1.jpg", "img2.jpg"],
      created_at: "2026-01-20T08:00:00.000Z",
      updated_at: "2026-01-21T09:00:00.000Z",
    });

    const result = mapRowToProperty(row);

    expect(result.id).toBe("prop-1");
    expect(result.user_id).toBe("user-1");
    expect(result.organization_id).toBe("org-1");
    expect(result.address).toBe("Herengracht 10");
    expect(result.postalCode).toBe("1015 BN");
    expect(result.city).toBe("Amsterdam");
    expect(result.price).toBe(500000);
    expect(result.squareMeters).toBe(120);
    expect(result.rooms).toBe(5);
    expect(result.bedrooms).toBe(3);
    expect(result.bathrooms).toBe(2);
    expect(result.buildYear).toBe(1890);
    expect(result.energyLabel).toBe("B");
    expect(result.status).toBe(PropertyStatus.Published);
    expect(result.images).toEqual(["img1.jpg", "img2.jpg"]);
  });

  it("converts created_at and updated_at strings to Date objects", () => {
    const row = createPropertyRow({
      created_at: "2026-02-01T12:00:00.000Z",
      updated_at: "2026-02-02T14:30:00.000Z",
    });

    const result = mapRowToProperty(row);

    expect(result.createdAt).toBeInstanceOf(Date);
    expect(result.updatedAt).toBeInstanceOf(Date);
    expect(result.createdAt.toISOString()).toBe("2026-02-01T12:00:00.000Z");
    expect(result.updatedAt.toISOString()).toBe("2026-02-02T14:30:00.000Z");
  });

  it("handles null images array by converting to empty array", () => {
    const row = createPropertyRow({ images: null });
    const result = mapRowToProperty(row);
    expect(result.images).toEqual([]);
  });

  it("handles non-null images array by passing through", () => {
    const row = createPropertyRow({ images: ["a.jpg", "b.png"] });
    const result = mapRowToProperty(row);
    expect(result.images).toEqual(["a.jpg", "b.png"]);
  });

  it("maps status string to PropertyStatus enum", () => {
    const draftRow = createPropertyRow({ status: "draft" });
    expect(mapRowToProperty(draftRow).status).toBe(PropertyStatus.Draft);

    const generatedRow = createPropertyRow({ status: "generated" });
    expect(mapRowToProperty(generatedRow).status).toBe(PropertyStatus.Generated);

    const publishedRow = createPropertyRow({ status: "published" });
    expect(mapRowToProperty(publishedRow).status).toBe(PropertyStatus.Published);
  });
});

describe("queryKeys", () => {
  it("properties.all returns ['properties']", () => {
    expect(queryKeys.properties.all).toEqual(["properties"]);
  });

  it("properties.detail(id) returns ['properties', id]", () => {
    expect(queryKeys.properties.detail("abc-123")).toEqual(["properties", "abc-123"]);
  });

  it("properties.recent(limit) returns ['properties', 'recent', limit]", () => {
    expect(queryKeys.properties.recent(5)).toEqual(["properties", "recent", 5]);
  });

  it("adverts.byProperty(id) returns ['adverts', 'byProperty', id]", () => {
    expect(queryKeys.adverts.byProperty("prop-1")).toEqual(["adverts", "byProperty", "prop-1"]);
  });

  it("dashboard.stats returns ['dashboard', 'stats']", () => {
    expect(queryKeys.dashboard.stats).toEqual(["dashboard", "stats"]);
  });

  it("activityFeed.all(limit) returns ['activityFeed', limit]", () => {
    expect(queryKeys.activityFeed.all(10)).toEqual(["activityFeed", 10]);
  });
});

describe("getProperties", () => {
  let mock: ReturnType<typeof createMockSupabaseClient>;

  beforeEach(() => {
    resetFactories();
    mock = createMockSupabaseClient();
  });

  it("returns mapped Property array on success", async () => {
    const rows = [createPropertyRow({ id: "p1" }), createPropertyRow({ id: "p2" })];
    mock.mockResponse({ data: rows });

    const result = await getProperties(mock.client);

    expect(result).toHaveLength(2);
    expect(result[0].id).toBe("p1");
    expect(result[1].id).toBe("p2");
    expect(result[0].createdAt).toBeInstanceOf(Date);
  });

  it("applies status filter when provided", async () => {
    mock.mockResponse({ data: [] });

    await getProperties(mock.client, PropertyStatus.Published);

    expect(mock.from).toHaveBeenCalledWith("properties");
    expect(mock.chainable.eq).toHaveBeenCalledWith("status", "published");
  });

  it("orders by created_at descending", async () => {
    mock.mockResponse({ data: [] });

    await getProperties(mock.client);

    expect(mock.chainable.order).toHaveBeenCalledWith("created_at", { ascending: false });
  });

  it("throws Dutch error message on Supabase error", async () => {
    mock.mockResponse({ error: { message: "connection failed", code: "500" } });

    await expect(getProperties(mock.client)).rejects.toThrow(
      "Woningen ophalen mislukt: connection failed"
    );
  });
});

describe("getPropertyById", () => {
  let mock: ReturnType<typeof createMockSupabaseClient>;

  beforeEach(() => {
    resetFactories();
    mock = createMockSupabaseClient();
  });

  it("returns mapped Property on success", async () => {
    const row = createPropertyRow({ id: "prop-99" });
    mock.mockResponse({ data: row });

    const result = await getPropertyById(mock.client, "prop-99");

    expect(result).not.toBeNull();
    expect(result!.id).toBe("prop-99");
    expect(result!.createdAt).toBeInstanceOf(Date);
  });

  it("returns null when no row found (PGRST116 error code)", async () => {
    mock.mockResponse({ error: { message: "not found", code: "PGRST116" } });

    const result = await getPropertyById(mock.client, "missing-id");

    expect(result).toBeNull();
  });

  it("throws Dutch error message on non-PGRST116 error", async () => {
    mock.mockResponse({ error: { message: "db error", code: "500" } });

    await expect(getPropertyById(mock.client, "some-id")).rejects.toThrow(
      "Woning ophalen mislukt: db error"
    );
  });

  it("returns null when data is null but no error", async () => {
    mock.mockResponse({ data: null });

    const result = await getPropertyById(mock.client, "some-id");

    expect(result).toBeNull();
  });
});

describe("getRecentProperties", () => {
  let mock: ReturnType<typeof createMockSupabaseClient>;

  beforeEach(() => {
    resetFactories();
    mock = createMockSupabaseClient();
  });

  it("returns mapped properties with default limit of 3", async () => {
    const rows = [createPropertyRow({ id: "r1" }), createPropertyRow({ id: "r2" })];
    mock.mockResponse({ data: rows });

    const result = await getRecentProperties(mock.client);

    expect(result).toHaveLength(2);
    expect(mock.chainable.limit).toHaveBeenCalledWith(3);
  });

  it("applies custom limit parameter", async () => {
    mock.mockResponse({ data: [] });

    await getRecentProperties(mock.client, 10);

    expect(mock.chainable.limit).toHaveBeenCalledWith(10);
  });

  it("throws Dutch error message on error", async () => {
    mock.mockResponse({ error: { message: "timeout", code: "TIMEOUT" } });

    await expect(getRecentProperties(mock.client)).rejects.toThrow(
      "Recente woningen ophalen mislukt: timeout"
    );
  });
});

describe("getDashboardStats", () => {
  let mock: ReturnType<typeof createMockSupabaseClient>;

  beforeEach(() => {
    resetFactories();
    mock = createMockSupabaseClient();
  });

  it("returns correct stats when all 6 queries succeed", async () => {
    // The mock resolves all chained queries with the same response,
    // so we set count to test the stats computation
    mock.mockResponse({ data: null, count: 10 });

    const result = await getDashboardStats(mock.client);

    expect(result.totalProperties).toBe(10);
    expect(result.published).toBe(10);
    expect(result.generatedThisMonth).toBe(10);
    expect(result.averageGenerationTime).toBe("2,4s");
    expect(result.averageGenerationTimeTrend).toBe(0);
  });

  it("throws if any one of the 6 queries returns an error", async () => {
    mock.mockResponse({ error: { message: "db down", code: "500" } });

    await expect(getDashboardStats(mock.client)).rejects.toThrow(
      "Dashboard statistieken ophalen mislukt: db down"
    );
  });

  it("handles null counts by defaulting to 0", async () => {
    mock.mockResponse({ data: null, count: null });

    const result = await getDashboardStats(mock.client);

    expect(result.totalProperties).toBe(0);
    expect(result.published).toBe(0);
    expect(result.generatedThisMonth).toBe(0);
  });

  it("returns hardcoded averageGenerationTime and trend", async () => {
    mock.mockResponse({ data: null, count: 5 });

    const result = await getDashboardStats(mock.client);

    expect(result.averageGenerationTime).toBe("2,4s");
    expect(result.averageGenerationTimeTrend).toBe(0);
  });

  it("computes trend as 0 when previous count is 0 (division by zero guard)", async () => {
    // All 6 queries return count: 0 => computeTrend(0, 0) => 0
    mock.mockResponse({ data: null, count: 0 });

    const result = await getDashboardStats(mock.client);

    expect(result.totalPropertiesTrend).toBe(0);
    expect(result.generatedThisMonthTrend).toBe(0);
    expect(result.publishedTrend).toBe(0);
  });
});

describe("getActivityFeed", () => {
  let mock: ReturnType<typeof createMockSupabaseClient>;

  beforeEach(() => {
    resetFactories();
    mock = createMockSupabaseClient();
  });

  it("returns mapped ActivityItem array on success", async () => {
    const rows = [
      {
        id: "act-1",
        type: "generated",
        property_address: "Keizersgracht 100",
        property_id: "prop-1",
        platform: "funda",
        created_at: "2026-01-16T14:30:00.000Z",
      },
    ];
    mock.mockResponse({ data: rows });

    const result = await getActivityFeed(mock.client, 10);

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("act-1");
    expect(result[0].type).toBe("generated");
    expect(result[0].timestamp).toBeInstanceOf(Date);
  });

  it("maps property_address to propertyAddress and property_id to propertyId", async () => {
    const rows = [
      {
        id: "act-2",
        type: "edited",
        property_address: "Prinsengracht 200",
        property_id: "prop-2",
        platform: null,
        created_at: "2026-01-17T10:00:00.000Z",
      },
    ];
    mock.mockResponse({ data: rows });

    const result = await getActivityFeed(mock.client, 5);

    expect(result[0].propertyAddress).toBe("Prinsengracht 200");
    expect(result[0].propertyId).toBe("prop-2");
  });

  it("converts null platform to undefined", async () => {
    const rows = [
      {
        id: "act-3",
        type: "published",
        property_address: "Damrak 50",
        property_id: "prop-3",
        platform: null,
        created_at: "2026-01-18T08:00:00.000Z",
      },
    ];
    mock.mockResponse({ data: rows });

    const result = await getActivityFeed(mock.client, 5);

    expect(result[0].platform).toBeUndefined();
  });

  it("respects limit parameter", async () => {
    mock.mockResponse({ data: [] });

    await getActivityFeed(mock.client, 20);

    expect(mock.chainable.limit).toHaveBeenCalledWith(20);
  });

  it("throws Dutch error message on error", async () => {
    mock.mockResponse({ error: { message: "query failed", code: "500" } });

    await expect(getActivityFeed(mock.client, 10)).rejects.toThrow(
      "Activiteit ophalen mislukt: query failed"
    );
  });
});
