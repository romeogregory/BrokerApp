"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import type { Property } from "@/lib/types";

interface AdvertEditorProps {
  title: string;
  description: string;
  features: string[];
  property: Property;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onFeaturesChange: (features: string[]) => void;
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

export function AdvertEditor({
  title,
  description,
  features,
  property,
  onTitleChange,
  onDescriptionChange,
  onFeaturesChange,
}: AdvertEditorProps) {
  function handleFeatureChange(index: number, value: string) {
    const updated = [...features];
    updated[index] = value;
    onFeaturesChange(updated);
  }

  function handleRemoveFeature(index: number) {
    onFeaturesChange(features.filter((_, i) => i !== index));
  }

  function handleAddFeature() {
    onFeaturesChange([...features, ""]);
  }

  return (
    <div className="flex flex-col gap-[var(--space-6)]">
      {/* Title */}
      <div className="flex flex-col gap-[var(--space-2)]">
        <label className="text-[13px] font-medium tracking-[0.01em] text-[var(--ink-secondary)]">
          Titel
        </label>
        <Input
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          className="text-[16px] font-semibold"
          placeholder="Titel van de advertentie"
        />
      </div>

      {/* Description */}
      <div className="flex flex-col gap-[var(--space-2)]">
        <label className="text-[13px] font-medium tracking-[0.01em] text-[var(--ink-secondary)]">
          Beschrijving
        </label>
        <Textarea
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          rows={8}
          className="text-[14px] leading-relaxed"
          placeholder="Beschrijving van de woning"
        />
      </div>

      {/* Features */}
      <div className="flex flex-col gap-[var(--space-2)]">
        <label className="text-[13px] font-medium tracking-[0.01em] text-[var(--ink-secondary)]">
          Kenmerken
        </label>
        <div className="flex flex-col gap-[var(--space-2)]">
          {features.map((feature, index) => (
            <div key={index} className="flex items-center gap-[var(--space-2)]">
              <span className="text-[var(--brand)]">&#8226;</span>
              <Input
                value={feature}
                onChange={(e) => handleFeatureChange(index, e.target.value)}
                className="flex-1 text-[14px]"
                placeholder="Voeg een kenmerk toe"
              />
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => handleRemoveFeature(index)}
                className="shrink-0 text-[var(--ink-tertiary)] hover:text-[var(--destructive)]"
              >
                <X className="size-3" />
              </Button>
            </div>
          ))}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleAddFeature}
            className="w-fit gap-[var(--space-1)] text-[var(--ink-tertiary)] hover:text-[var(--ink-secondary)]"
          >
            <Plus className="size-3.5" />
            Kenmerk toevoegen
          </Button>
        </div>
      </div>

      {/* Property details (read-only) */}
      <div className="flex flex-col gap-[var(--space-2)]">
        <label className="text-[13px] font-medium tracking-[0.01em] text-[var(--ink-secondary)]">
          Woningdetails
        </label>
        <div className="rounded-[var(--radius-md)] bg-[var(--surface-2)] p-[var(--space-4)]">
          <div className="grid grid-cols-2 gap-x-[var(--space-4)] gap-y-[var(--space-3)]">
            <DetailRow label="Vraagprijs" value={formatPrice(property.price)} />
            <DetailRow label="Woonoppervlakte" value={`${property.squareMeters} m²`} />
            <DetailRow label="Kamers" value={String(property.rooms)} />
            <DetailRow label="Slaapkamers" value={String(property.bedrooms)} />
            <DetailRow label="Badkamers" value={String(property.bathrooms)} />
            <DetailRow label="Bouwjaar" value={String(property.buildYear)} />
            <DetailRow label="Energielabel" value={property.energyLabel} />
            <DetailRow label="Postcode" value={property.postalCode} />
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-[12px] text-[var(--ink-tertiary)]">{label}</span>
      <span className="text-[14px] font-medium text-[var(--ink)]">{value}</span>
    </div>
  );
}
