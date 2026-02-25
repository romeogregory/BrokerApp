"use client";

import { mockProperties } from "@/lib/mock-data";
import { Property, PropertyStatus } from "@/lib/types";

export function useProperties(status?: PropertyStatus) {
  const properties = status
    ? mockProperties.filter((p) => p.status === status)
    : mockProperties;

  function getById(id: string): Property | undefined {
    return mockProperties.find((p) => p.id === id);
  }

  return { properties, getById };
}
