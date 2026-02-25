"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Eye, Pencil } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AdvertEditor } from "@/components/editor/advert-editor";
import { PlatformPreview } from "@/components/editor/platform-preview";
import { PlatformTabs } from "@/components/editor/platform-tabs";
import { ExportActions } from "@/components/editor/export-actions";
import { useProperties } from "@/hooks/use-properties";
import { mockAdverts } from "@/lib/mock-data";
import { Platform, PropertyStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

type MobileView = "edit" | "preview";

export default function AdvertentiePage() {
  const params = useParams<{ id: string }>();
  const { getById } = useProperties();

  const property = getById(params.id);
  const advert = useMemo(
    () => mockAdverts.find((a) => a.propertyId === params.id),
    [params.id]
  );

  // Editor state
  const [title, setTitle] = useState(advert?.title ?? "");
  const [description, setDescription] = useState(advert?.description ?? "");
  const [features, setFeatures] = useState<string[]>(
    advert?.features ?? []
  );
  const [activePlatform, setActivePlatform] = useState<Platform>(
    advert?.platform ?? Platform.Funda
  );
  const [isPublished, setIsPublished] = useState(
    property?.status === PropertyStatus.Published
  );

  // Mobile toggle between edit and preview
  const [mobileView, setMobileView] = useState<MobileView>("edit");

  if (!property || !advert) {
    return (
      <div>
        <Header title="Advertentie niet gevonden" />
        <div className="px-[var(--space-8)] pb-[var(--space-8)]">
          <p className="text-[14px] text-[var(--ink-secondary)]">
            Deze advertentie bestaat niet of is nog niet gegenereerd.
          </p>
          <Link
            href="/dashboard"
            className="mt-[var(--space-4)] inline-flex items-center gap-[var(--space-2)] text-[14px] font-medium text-[var(--brand)] hover:text-[var(--brand-hover)]"
          >
            <ArrowLeft className="size-4" />
            Terug naar dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      {/* Header */}
      <div className="shrink-0 border-b border-[var(--border)]">
        <div className="flex items-center gap-[var(--space-4)] px-[var(--space-8)] pt-[var(--space-6)] pb-[var(--space-4)]">
          <Link
            href="/dashboard"
            className="rounded-[var(--radius-sm)] p-[var(--space-1)] text-[var(--ink-tertiary)] transition-colors hover:bg-[var(--surface-2)] hover:text-[var(--ink-secondary)]"
          >
            <ArrowLeft className="size-5" />
          </Link>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-[var(--space-3)]">
              <h1 className="truncate text-[20px] font-semibold tracking-[-0.01em] text-[var(--ink)]">
                {property.address}, {property.city}
              </h1>
              <Badge
                className={cn(
                  "shrink-0",
                  isPublished
                    ? "bg-[var(--success-subtle)] text-[var(--success)]"
                    : "bg-[var(--warning-subtle)] text-[var(--warning)]"
                )}
              >
                {isPublished ? "Gepubliceerd" : "Gegenereerd"}
              </Badge>
            </div>
            <p className="text-[13px] text-[var(--ink-tertiary)]">
              Bewerk advertentie
            </p>
          </div>
        </div>

        {/* Export actions row */}
        <div className="px-[var(--space-8)] pb-[var(--space-4)]">
          <ExportActions
            title={title}
            description={description}
            features={features}
            propertyAddress={`${property.address}, ${property.postalCode} ${property.city}`}
            isPublished={isPublished}
            onTogglePublish={() => setIsPublished((prev) => !prev)}
          />
        </div>

        {/* Mobile view toggle */}
        <div className="flex gap-[var(--space-1)] px-[var(--space-8)] pb-[var(--space-3)] lg:hidden">
          <Button
            variant={mobileView === "edit" ? "default" : "secondary"}
            size="sm"
            onClick={() => setMobileView("edit")}
            className="gap-[var(--space-1)]"
          >
            <Pencil className="size-3.5" />
            Bewerken
          </Button>
          <Button
            variant={mobileView === "preview" ? "default" : "secondary"}
            size="sm"
            onClick={() => setMobileView("preview")}
            className="gap-[var(--space-1)]"
          >
            <Eye className="size-3.5" />
            Voorbeeld
          </Button>
        </div>
      </div>

      {/* Split view: Editor + Preview */}
      <div className="flex flex-1 overflow-hidden">
        {/* Editor panel (left) */}
        <div
          className={cn(
            "flex-1 overflow-y-auto border-r border-[var(--border)] p-[var(--space-6)]",
            mobileView === "preview" ? "hidden lg:block" : "block"
          )}
        >
          <AdvertEditor
            title={title}
            description={description}
            features={features}
            property={property}
            onTitleChange={setTitle}
            onDescriptionChange={setDescription}
            onFeaturesChange={setFeatures}
          />
        </div>

        {/* Preview panel (right) */}
        <div
          className={cn(
            "flex-1 overflow-y-auto bg-[var(--surface-2)] p-[var(--space-6)]",
            mobileView === "edit" ? "hidden lg:block" : "block"
          )}
        >
          <div className="mb-[var(--space-4)]">
            <PlatformTabs
              active={activePlatform}
              onChange={setActivePlatform}
            />
          </div>
          <div className="mx-auto max-w-md">
            <PlatformPreview
              platform={activePlatform}
              title={title}
              description={description}
              features={features}
              property={property}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
