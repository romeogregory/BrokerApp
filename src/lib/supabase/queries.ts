import type { SupabaseClient } from "@supabase/supabase-js";
import { PropertyStatus } from "@/lib/types";
import type { Property } from "@/lib/types";

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
