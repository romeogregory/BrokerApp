"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Property, PropertyStatus } from "@/lib/types";
import { BedDouble, Maximize, Zap } from "lucide-react";

function formatPrice(price: number): string {
  return (
    "\u20AC " +
    new Intl.NumberFormat("nl-NL", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
      .format(price)
      .replace(/,/g, ".")
  );
}

const statusConfig: Record<
  PropertyStatus,
  { label: string; className: string }
> = {
  [PropertyStatus.Draft]: {
    label: "Concept",
    className:
      "bg-[var(--surface-3)] text-[var(--ink-tertiary)] border-transparent",
  },
  [PropertyStatus.Generated]: {
    label: "Gegenereerd",
    className:
      "bg-[var(--warning-subtle)] text-[var(--warning)] border-transparent",
  },
  [PropertyStatus.Published]: {
    label: "Gepubliceerd",
    className:
      "bg-[var(--success-subtle)] text-[var(--success)] border-transparent",
  },
};

// Deterministic gradient based on property id
const gradients = [
  "from-[#D97756]/30 via-[#D4A754]/20 to-[#5D8C66]/30",
  "from-[#5B8EC4]/30 via-[#D97756]/20 to-[#D4A754]/30",
  "from-[#5D8C66]/30 via-[#5B8EC4]/20 to-[#D97756]/30",
  "from-[#D4A754]/30 via-[#5D8C66]/20 to-[#5B8EC4]/30",
];

interface PropertyCardProps {
  property: Property;
}

export function PropertyCard({ property }: PropertyCardProps) {
  const status = statusConfig[property.status];
  const href =
    property.status === PropertyStatus.Draft
      ? "/nieuw"
      : `/advertentie/${property.id}`;

  // Pick gradient based on id hash
  const gradientIndex =
    property.id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) %
    gradients.length;

  return (
    <Link
      href={href}
      className="group block overflow-hidden rounded-[var(--radius-md)] bg-[var(--surface-1)] transition-shadow duration-150 ease-out hover:shadow-[var(--shadow-elevated)]"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      {/* Image area - 60% height */}
      <div className="relative aspect-[16/10] w-full overflow-hidden">
        <div
          className={`absolute inset-0 bg-gradient-to-br ${gradients[gradientIndex]} bg-[var(--surface-2)]`}
        />
        {/* Bottom gradient overlay for legibility */}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/20 to-transparent" />
        {/* Status badge */}
        <Badge className={`absolute right-3 top-3 ${status.className}`}>
          {status.label}
        </Badge>
      </div>

      {/* Content */}
      <div className="p-[var(--space-4)]">
        <h3 className="text-[16px] font-semibold text-[var(--ink)] truncate">
          {property.address}
        </h3>
        <p className="text-[12px] tracking-[0.01em] text-[var(--ink-tertiary)]">
          {property.postalCode} {property.city}
        </p>
        <p className="mt-[var(--space-2)] text-[20px] font-semibold tracking-[-0.01em] text-[var(--ink)]">
          {formatPrice(property.price)}
        </p>
        {/* Stats row */}
        <div className="mt-[var(--space-3)] flex items-center gap-[var(--space-4)] text-[12px] tracking-[0.01em] text-[var(--ink-tertiary)]">
          <span className="flex items-center gap-[var(--space-1)]">
            <BedDouble className="h-3.5 w-3.5" />
            {property.rooms} kamers
          </span>
          <span className="flex items-center gap-[var(--space-1)]">
            <Maximize className="h-3.5 w-3.5" />
            {property.squareMeters} m&sup2;
          </span>
          <span className="flex items-center gap-[var(--space-1)]">
            <Zap className="h-3.5 w-3.5" />
            {property.energyLabel}
          </span>
        </div>
      </div>
    </Link>
  );
}
