import {
  type Property, type Advert, type DashboardStats, type ActivityItem,
  PropertyStatus, Platform,
} from "@/lib/types";
import type { PropertyRow } from "@/lib/supabase/queries";

let counter = 0;
function nextId(): string {
  counter += 1;
  return "test-id-" + counter;
}

export function resetFactories(): void { counter = 0; }

export function createProperty(overrides: Partial<Property> = {}): Property {
  const id = overrides.id ?? nextId();
  return {
    id, user_id: "user-1", organization_id: null,
    address: "Keizersgracht 100", postalCode: "1015 AA", city: "Amsterdam",
    price: 450000, squareMeters: 85, rooms: 4, bedrooms: 2, bathrooms: 1,
    buildYear: 1920, energyLabel: "C", status: PropertyStatus.Draft,
    images: [],
    createdAt: new Date("2026-01-15T10:00:00Z"),
    updatedAt: new Date("2026-01-15T10:00:00Z"),
    ...overrides,
  };
}

export function createPropertyRow(overrides: Partial<PropertyRow> = {}): PropertyRow {
  const id = overrides.id ?? nextId();
  return {
    id, user_id: "user-1", organization_id: null,
    address: "Keizersgracht 100", postal_code: "1015 AA", city: "Amsterdam",
    price: 450000, square_meters: 85, rooms: 4, bedrooms: 2, bathrooms: 1,
    build_year: 1920, energy_label: "C", status: "draft",
    images: null,
    created_at: "2026-01-15T10:00:00.000Z",
    updated_at: "2026-01-15T10:00:00.000Z",
    ...overrides,
  };
}

export function createAdvert(overrides: Partial<Advert> = {}): Advert {
  return {
    id: overrides.id ?? nextId(),
    propertyId: "property-1",
    title: "Prachtig appartement aan de Keizersgracht",
    description: "Een ruim en licht appartement in het hart van Amsterdam.",
    features: ["Balkon", "Parkeerplaats", "Berging"],
    platform: Platform.Funda,
    createdAt: new Date("2026-01-16T12:00:00Z"),
    ...overrides,
  };
}

export function createDashboardStats(overrides: Partial<DashboardStats> = {}): DashboardStats {
  return {
    totalProperties: 12, generatedThisMonth: 5, published: 3,
    averageGenerationTime: "2,4s",
    totalPropertiesTrend: 8.3, generatedThisMonthTrend: 25.0,
    publishedTrend: -10.0, averageGenerationTimeTrend: 0,
    ...overrides,
  };
}

export function createActivityItem(overrides: Partial<ActivityItem> = {}): ActivityItem {
  return {
    id: overrides.id ?? nextId(),
    type: "generated",
    propertyAddress: "Keizersgracht 100, Amsterdam",
    propertyId: "property-1",
    platform: Platform.Funda,
    timestamp: new Date("2026-01-16T14:30:00Z"),
    ...overrides,
  };
}
