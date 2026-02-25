import type { SupabaseClient } from "@supabase/supabase-js";
import type { Property } from "@/lib/types";
import type { PropertyStatus } from "@/lib/types";
import { mapRowToProperty } from "@/lib/supabase/queries";
import type { PropertyRow } from "@/lib/supabase/queries";

export interface CreatePropertyInput {
  id?: string;
  userId: string;
  organizationId?: string | null;
  address: string;
  postalCode: string;
  city: string;
  price: number;
  squareMeters: number;
  rooms: number;
  bedrooms: number;
  bathrooms: number;
  buildYear: number;
  energyLabel: string;
  status?: PropertyStatus;
  images?: string[];
}

function mapInputToRow(
  input: CreatePropertyInput | Partial<CreatePropertyInput>
): Record<string, unknown> {
  const row: Record<string, unknown> = {};

  if (input.id !== undefined) row.id = input.id;
  if ("userId" in input) row.user_id = input.userId;
  if ("organizationId" in input) row.organization_id = input.organizationId;
  if ("address" in input) row.address = input.address;
  if ("postalCode" in input) row.postal_code = input.postalCode;
  if ("city" in input) row.city = input.city;
  if ("price" in input) row.price = input.price;
  if ("squareMeters" in input) row.square_meters = input.squareMeters;
  if ("rooms" in input) row.rooms = input.rooms;
  if ("bedrooms" in input) row.bedrooms = input.bedrooms;
  if ("bathrooms" in input) row.bathrooms = input.bathrooms;
  if ("buildYear" in input) row.build_year = input.buildYear;
  if ("energyLabel" in input) row.energy_label = input.energyLabel;
  if ("status" in input) row.status = input.status;
  if ("images" in input) row.images = input.images;

  return row;
}

export async function createProperty(
  supabase: SupabaseClient,
  data: CreatePropertyInput
): Promise<Property> {
  const row = mapInputToRow(data);

  const { data: inserted, error } = await supabase
    .from("properties")
    .insert(row)
    .select()
    .single();

  if (error) {
    throw new Error(`Woning aanmaken mislukt: ${error.message}`);
  }

  return mapRowToProperty(inserted as PropertyRow);
}

export async function updateProperty(
  supabase: SupabaseClient,
  id: string,
  data: Partial<CreatePropertyInput>
): Promise<Property> {
  const row = mapInputToRow(data);

  const { data: updated, error } = await supabase
    .from("properties")
    .update(row)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(`Woning bijwerken mislukt: ${error.message}`);
  }

  return mapRowToProperty(updated as PropertyRow);
}

export async function deleteProperty(
  supabase: SupabaseClient,
  id: string
): Promise<void> {
  const { error } = await supabase.from("properties").delete().eq("id", id);

  if (error) {
    throw new Error(`Woning verwijderen mislukt: ${error.message}`);
  }
}
