"use client";

import { Platform } from "@/lib/types";
import type { Property } from "@/lib/types";

interface PlatformPreviewProps {
  platform: Platform;
  title: string;
  description: string;
  features: string[];
  property: Property;
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

export function PlatformPreview({
  platform,
  title,
  description,
  features,
  property,
}: PlatformPreviewProps) {
  switch (platform) {
    case Platform.Funda:
      return (
        <FundaPreview
          title={title}
          description={description}
          features={features}
          property={property}
        />
      );
    case Platform.Pararius:
      return (
        <ParariusPreview
          title={title}
          description={description}
          features={features}
          property={property}
        />
      );
    case Platform.Jaap:
      return (
        <JaapPreview
          title={title}
          description={description}
          features={features}
          property={property}
        />
      );
  }
}

/* ────────────────────────────────────────
   Funda Preview — Blue header, sidebar details, image carousel placeholder
   ──────────────────────────────────────── */
function FundaPreview({
  title,
  description,
  features,
  property,
}: Omit<PlatformPreviewProps, "platform">) {
  return (
    <div className="overflow-hidden rounded-[var(--radius-md)] border border-[#E0E0E0] bg-white">
      {/* Funda header bar */}
      <div className="bg-[#003580] px-4 py-3">
        <span className="text-[15px] font-bold text-white">funda</span>
      </div>

      {/* Image placeholder */}
      <div className="relative h-48 bg-gradient-to-br from-[#003580]/10 via-[#E8EEF6] to-[#003580]/5">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex flex-col items-center gap-1 text-[#003580]/40">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="m21 15-5-5L5 21" />
            </svg>
            <span className="text-[11px] font-medium">Foto&apos;s</span>
          </div>
        </div>
        <div className="absolute bottom-2 right-2 rounded bg-black/60 px-2 py-0.5 text-[11px] text-white">
          1/{property.images.length || 1} foto&apos;s
        </div>
      </div>

      {/* Content area */}
      <div className="flex flex-col gap-4 p-4">
        {/* Price + address */}
        <div>
          <p className="text-[22px] font-bold text-[#003580]">
            {formatPrice(property.price)} <span className="text-[13px] font-normal text-[#666]">k.k.</span>
          </p>
          <p className="text-[15px] font-semibold text-[#333]">
            {property.address}
          </p>
          <p className="text-[13px] text-[#666]">
            {property.postalCode} {property.city}
          </p>
        </div>

        {/* Quick stats row */}
        <div className="flex gap-4 border-y border-[#E0E0E0] py-3">
          <QuickStat label="Woonoppervlakte" value={`${property.squareMeters} m²`} />
          <QuickStat label="Kamers" value={`${property.rooms}`} />
          <QuickStat label="Bouwjaar" value={`${property.buildYear}`} />
          <QuickStat label="Energielabel" value={property.energyLabel} />
        </div>

        {/* Title + description */}
        <div>
          <h2 className="text-[16px] font-semibold text-[#333]">{title}</h2>
          <p className="mt-2 whitespace-pre-line text-[13px] leading-[1.6] text-[#4A4A4A]">
            {description}
          </p>
        </div>

        {/* Features */}
        {features.length > 0 && features.some((f) => f.trim()) && (
          <div>
            <h3 className="text-[14px] font-semibold text-[#333]">Kenmerken</h3>
            <ul className="mt-2 flex flex-col gap-1.5">
              {features.filter((f) => f.trim()).map((feature, i) => (
                <li key={i} className="flex items-start gap-2 text-[13px] text-[#4A4A4A]">
                  <span className="mt-1 inline-block size-1.5 shrink-0 rounded-full bg-[#003580]" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-[#E0E0E0] bg-[#F7F7F7] px-4 py-2.5">
        <span className="text-[11px] text-[#999]">
          Aangeboden door Jan de Vries Makelaardij
        </span>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────
   Pararius Preview — Green accents, horizontal stats, clean layout
   ──────────────────────────────────────── */
function ParariusPreview({
  title,
  description,
  features,
  property,
}: Omit<PlatformPreviewProps, "platform">) {
  return (
    <div className="overflow-hidden rounded-[var(--radius-md)] border border-[#E5E5E5] bg-white">
      {/* Pararius header */}
      <div className="flex items-center justify-between bg-white px-4 py-3 border-b-2 border-[#00A651]">
        <span className="text-[15px] font-bold text-[#00A651]">pararius</span>
        <span className="rounded-full bg-[#00A651]/10 px-2 py-0.5 text-[11px] font-medium text-[#00A651]">
          Te koop
        </span>
      </div>

      {/* Image placeholder */}
      <div className="relative h-44 bg-gradient-to-br from-[#00A651]/5 via-[#F0F9F4] to-[#00A651]/10">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex flex-col items-center gap-1 text-[#00A651]/30">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="m21 15-5-5L5 21" />
            </svg>
            <span className="text-[11px] font-medium">Foto&apos;s</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-4 p-4">
        {/* Address + price */}
        <div>
          <h2 className="text-[17px] font-bold text-[#222]">
            {property.address}
          </h2>
          <p className="text-[13px] text-[#777]">
            {property.postalCode} {property.city}
          </p>
          <p className="mt-2 text-[24px] font-bold text-[#00A651]">
            {formatPrice(property.price)}
          </p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-4 gap-2 rounded-lg bg-[#F8F8F8] p-3">
          <StatBox label="m²" value={`${property.squareMeters}`} />
          <StatBox label="kamers" value={`${property.rooms}`} />
          <StatBox label="slaapk." value={`${property.bedrooms}`} />
          <StatBox label="energie" value={property.energyLabel} />
        </div>

        {/* Description */}
        <div>
          <h3 className="text-[14px] font-bold text-[#222]">{title}</h3>
          <p className="mt-2 whitespace-pre-line text-[13px] leading-[1.65] text-[#555]">
            {description}
          </p>
        </div>

        {/* Features */}
        {features.length > 0 && features.some((f) => f.trim()) && (
          <div>
            <h3 className="text-[13px] font-bold uppercase tracking-wider text-[#999]">
              Kenmerken
            </h3>
            <div className="mt-2 flex flex-wrap gap-2">
              {features.filter((f) => f.trim()).map((feature, i) => (
                <span
                  key={i}
                  className="rounded-full border border-[#E0E0E0] bg-[#FAFAFA] px-2.5 py-1 text-[12px] text-[#555]"
                >
                  {feature}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-[#E5E5E5] px-4 py-2.5">
        <span className="text-[11px] text-[#AAA]">
          Jan de Vries Makelaardij &bull; Bekijk op Pararius
        </span>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────
   Jaap Preview — Orange accents, minimal layout, bold pricing
   ──────────────────────────────────────── */
function JaapPreview({
  title,
  description,
  features,
  property,
}: Omit<PlatformPreviewProps, "platform">) {
  return (
    <div className="overflow-hidden rounded-[var(--radius-md)] border border-[#E5E5E5] bg-white">
      {/* Jaap header */}
      <div className="bg-[#F28C00] px-4 py-2.5">
        <span className="text-[16px] font-extrabold text-white">Jaap.nl</span>
      </div>

      {/* Image placeholder */}
      <div className="relative h-40 bg-gradient-to-br from-[#F28C00]/5 via-[#FFF8F0] to-[#F28C00]/10">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex flex-col items-center gap-1 text-[#F28C00]/30">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="m21 15-5-5L5 21" />
            </svg>
            <span className="text-[11px] font-medium">Foto&apos;s</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-3 p-4">
        {/* Price banner */}
        <div className="rounded-lg bg-[#FFF4E6] p-3">
          <p className="text-[26px] font-extrabold text-[#F28C00]">
            {formatPrice(property.price)}
          </p>
          <p className="text-[11px] font-medium text-[#C07000]">Vraagprijs</p>
        </div>

        {/* Address */}
        <div>
          <p className="text-[16px] font-bold text-[#333]">
            {property.address}
          </p>
          <p className="text-[13px] text-[#888]">
            {property.postalCode} {property.city}
          </p>
        </div>

        {/* Stats inline */}
        <div className="flex flex-wrap gap-3 text-[13px]">
          <span className="font-medium text-[#333]">{property.squareMeters} m²</span>
          <span className="text-[#CCC]">&bull;</span>
          <span className="font-medium text-[#333]">{property.rooms} kamers</span>
          <span className="text-[#CCC]">&bull;</span>
          <span className="font-medium text-[#333]">Bouwjaar {property.buildYear}</span>
          <span className="text-[#CCC]">&bull;</span>
          <span className="font-medium text-[#333]">Label {property.energyLabel}</span>
        </div>

        {/* Description */}
        <div className="border-t border-[#EFEFEF] pt-3">
          <h3 className="text-[14px] font-bold text-[#333]">{title}</h3>
          <p className="mt-1.5 whitespace-pre-line text-[13px] leading-[1.6] text-[#666]">
            {description}
          </p>
        </div>

        {/* Features as simple list */}
        {features.length > 0 && features.some((f) => f.trim()) && (
          <div className="border-t border-[#EFEFEF] pt-3">
            <h3 className="text-[13px] font-bold text-[#333]">Kenmerken</h3>
            <ul className="mt-1.5 flex flex-col gap-1">
              {features.filter((f) => f.trim()).map((feature, i) => (
                <li key={i} className="flex items-start gap-1.5 text-[12px] text-[#666]">
                  <span className="mt-[5px] inline-block size-1 shrink-0 rounded-full bg-[#F28C00]" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-[#EFEFEF] bg-[#FAFAFA] px-4 py-2">
        <span className="text-[11px] text-[#BBB]">
          Via Jan de Vries Makelaardij
        </span>
      </div>
    </div>
  );
}

/* Shared helper components */
function QuickStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-[14px] font-semibold text-[#333]">{value}</span>
      <span className="text-[10px] text-[#999]">{label}</span>
    </div>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-[15px] font-bold text-[#222]">{value}</span>
      <span className="text-[10px] text-[#999]">{label}</span>
    </div>
  );
}
