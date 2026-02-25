import type { SupabaseClient } from "@supabase/supabase-js";
import { PropertyStatus } from "@/lib/types";
import type { Property, DashboardStats, ActivityItem, Platform } from "@/lib/types";

export interface PropertyRow {
  id: string;
  user_id: string;
  organization_id: string | null;
  address: string;
  postal_code: string;
  city: string;
  price: number;
  square_meters: number;
  rooms: number;
  bedrooms: number;
  bathrooms: number;
  build_year: number;
  energy_label: string;
  status: string;
  images: string[] | null;
  created_at: string;
  updated_at: string;
}

export function mapRowToProperty(row: PropertyRow): Property {
  return {
    id: row.id,
    user_id: row.user_id,
    organization_id: row.organization_id,
    address: row.address,
    postalCode: row.postal_code,
    city: row.city,
    price: row.price,
    squareMeters: row.square_meters,
    rooms: row.rooms,
    bedrooms: row.bedrooms,
    bathrooms: row.bathrooms,
    buildYear: row.build_year,
    energyLabel: row.energy_label,
    status: row.status as PropertyStatus,
    images: row.images ?? [],
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

export const queryKeys = {
  properties: {
    all: ["properties"] as const,
    detail: (id: string) => ["properties", id] as const,
    recent: (limit: number) => ["properties", "recent", limit] as const,
  },
  adverts: {
    byProperty: (propertyId: string) =>
      ["adverts", "byProperty", propertyId] as const,
  },
  dashboard: {
    stats: ["dashboard", "stats"] as const,
  },
  activityFeed: {
    all: (limit: number) => ["activityFeed", limit] as const,
  },
} as const;

export async function getProperties(
  supabase: SupabaseClient,
  status?: PropertyStatus
): Promise<Property[]> {
  let query = supabase
    .from("properties")
    .select("*")
    .order("created_at", { ascending: false });

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Woningen ophalen mislukt: ${error.message}`);
  }

  return (data as PropertyRow[]).map(mapRowToProperty);
}

export async function getPropertyById(
  supabase: SupabaseClient,
  id: string
): Promise<Property | null> {
  const { data, error } = await supabase
    .from("properties")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw new Error(`Woning ophalen mislukt: ${error.message}`);
  }

  return data ? mapRowToProperty(data as PropertyRow) : null;
}

export async function getRecentProperties(
  supabase: SupabaseClient,
  limit = 3
): Promise<Property[]> {
  const { data, error } = await supabase
    .from("properties")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Recente woningen ophalen mislukt: ${error.message}`);
  }

  return (data as PropertyRow[]).map(mapRowToProperty);
}

function getMonthRange(offset: number): { start: string; end: string } {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + offset;
  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 1);
  return {
    start: start.toISOString(),
    end: end.toISOString(),
  };
}

function computeTrend(current: number, previous: number): number {
  if (previous === 0) return 0;
  return Math.round(((current - previous) / previous) * 1000) / 10;
}

export async function getDashboardStats(
  supabase: SupabaseClient
): Promise<DashboardStats> {
  const currentMonth = getMonthRange(0);
  const previousMonth = getMonthRange(-1);

  const [
    totalProps,
    publishedProps,
    advertsCurrent,
    totalPropsPrev,
    publishedPropsPrev,
    advertsPrev,
  ] = await Promise.all([
    supabase
      .from("properties")
      .select("*", { count: "exact", head: true }),
    supabase
      .from("properties")
      .select("*", { count: "exact", head: true })
      .eq("status", "published"),
    supabase
      .from("adverts")
      .select("*", { count: "exact", head: true })
      .gte("created_at", currentMonth.start)
      .lt("created_at", currentMonth.end),
    supabase
      .from("properties")
      .select("*", { count: "exact", head: true })
      .lt("created_at", previousMonth.end),
    supabase
      .from("properties")
      .select("*", { count: "exact", head: true })
      .eq("status", "published")
      .lt("created_at", previousMonth.end),
    supabase
      .from("adverts")
      .select("*", { count: "exact", head: true })
      .gte("created_at", previousMonth.start)
      .lt("created_at", previousMonth.end),
  ]);

  const totalProperties = totalProps.count ?? 0;
  const published = publishedProps.count ?? 0;
  const generatedThisMonth = advertsCurrent.count ?? 0;
  const totalPropertiesPrev = totalPropsPrev.count ?? 0;
  const publishedPrev = publishedPropsPrev.count ?? 0;
  const generatedPrev = advertsPrev.count ?? 0;

  return {
    totalProperties,
    generatedThisMonth,
    published,
    // TODO(BRO-8): compute from advert generation timestamps
    averageGenerationTime: "2,4s",
    totalPropertiesTrend: computeTrend(totalProperties, totalPropertiesPrev),
    generatedThisMonthTrend: computeTrend(generatedThisMonth, generatedPrev),
    publishedTrend: computeTrend(published, publishedPrev),
    averageGenerationTimeTrend: 0,
  };
}

interface ActivityLogRow {
  id: string;
  type: "generated" | "edited" | "published";
  property_address: string;
  property_id: string;
  platform: Platform | null;
  created_at: string;
}

export async function getActivityFeed(
  supabase: SupabaseClient,
  limit: number
): Promise<ActivityItem[]> {
  const { data, error } = await supabase
    .from("activity_log")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Activiteit ophalen mislukt: ${error.message}`);
  }

  return (data as ActivityLogRow[]).map((row) => ({
    id: row.id,
    type: row.type,
    propertyAddress: row.property_address,
    propertyId: row.property_id,
    platform: row.platform ?? undefined,
    timestamp: new Date(row.created_at),
  }));
}
