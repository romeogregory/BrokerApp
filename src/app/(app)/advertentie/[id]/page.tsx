"use client";

import { useState, useEffect, useMemo } from "react";
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
import { useProperty } from "@/hooks/use-properties";
import {
  useAdvert,
  useSaveAdvert,
  usePublishAdvert,
} from "@/hooks/use-adverts";
import { Platform, PropertyStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

type MobileView = "edit" | "preview";

function EditorSkeleton() {
  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      {/* Header skeleton */}
      <div className="shrink-0 border-b border-[var(--border)]">
        <div className="flex items-center gap-[var(--space-4)] px-[var(--space-8)] pt-[var(--space-6)] pb-[var(--space-4)]">
          <div className="size-5 animate-pulse rounded-[var(--radius-sm)] bg-[var(--surface-2)]" />
          <div className="flex-1 space-y-[var(--space-2)]">
            <div className="flex items-center gap-[var(--space-3)]">
              <div className="h-6 w-64 animate-pulse rounded-[var(--radius-sm)] bg-[var(--surface-2)]" />
              <div className="h-5 w-24 animate-pulse rounded-[var(--radius-full)] bg-[var(--surface-2)]" />
            </div>
            <div className="h-4 w-32 animate-pulse rounded-[var(--radius-sm)] bg-[var(--surface-2)]" />
          </div>
        </div>
        <div className="flex gap-[var(--space-2)] px-[var(--space-8)] pb-[var(--space-4)]">
          <div className="h-8 w-24 animate-pulse rounded-[var(--radius-sm)] bg-[var(--surface-2)]" />
          <div className="h-8 w-28 animate-pulse rounded-[var(--radius-sm)] bg-[var(--surface-2)]" />
          <div className="h-8 w-24 animate-pulse rounded-[var(--radius-sm)] bg-[var(--surface-2)]" />
        </div>
      </div>

      {/* Split view skeleton */}
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 space-y-[var(--space-4)] border-r border-[var(--border)] p-[var(--space-6)]">
          <div className="h-10 w-full animate-pulse rounded-[var(--radius-sm)] bg-[var(--surface-2)]" />
          <div className="h-48 w-full animate-pulse rounded-[var(--radius-sm)] bg-[var(--surface-2)]" />
          <div className="space-y-[var(--space-2)]">
            <div className="h-8 w-full animate-pulse rounded-[var(--radius-sm)] bg-[var(--surface-2)]" />
            <div className="h-8 w-full animate-pulse rounded-[var(--radius-sm)] bg-[var(--surface-2)]" />
            <div className="h-8 w-3/4 animate-pulse rounded-[var(--radius-sm)] bg-[var(--surface-2)]" />
          </div>
        </div>
        <div className="hidden flex-1 bg-[var(--surface-2)] p-[var(--space-6)] lg:block">
          <div className="h-10 w-48 animate-pulse rounded-[var(--radius-sm)] bg-[var(--surface-3)]" />
          <div className="mx-auto mt-[var(--space-4)] h-96 max-w-md animate-pulse rounded-[var(--radius-md)] bg-[var(--surface-3)]" />
        </div>
      </div>
    </div>
  );
}

export default function AdvertentiePage() {
  const params = useParams<{ id: string }>();
  const { property, isLoading: propertyLoading } = useProperty(params.id);
  const { advert, isLoading: advertLoading } = useAdvert(params.id);
  const { saveAdvert, isSaving } = useSaveAdvert();
  const { publishAdvert, isPublishing } = usePublishAdvert();

  // Editor state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [features, setFeatures] = useState<string[]>([]);
  const [activePlatform, setActivePlatform] = useState<Platform>(
    Platform.Funda
  );
  const [initialized, setInitialized] = useState(false);

  // Mobile toggle between edit and preview
  const [mobileView, setMobileView] = useState<MobileView>("edit");

  // Initialize editor state from loaded advert
  useEffect(() => {
    if (advert && !initialized) {
      setTitle(advert.title);
      setDescription(advert.description);
      setFeatures(advert.features);
      setActivePlatform(advert.platform);
      setInitialized(true);
    }
  }, [advert, initialized]);

  // Dirty tracking: compare current form values to loaded advert
  const isDirty = useMemo(() => {
    if (!advert) return false;
    return (
      title !== advert.title ||
      description !== advert.description ||
      JSON.stringify(features) !== JSON.stringify(advert.features)
    );
  }, [advert, title, description, features]);

  const isPublished = property?.status === PropertyStatus.Published;

  const isLoading = propertyLoading || advertLoading;

  if (isLoading) {
    return <EditorSkeleton />;
  }

  // Property not found
  if (!property) {
    return (
      <div>
        <Header title="Advertentie niet gevonden" />
        <div className="px-[var(--space-8)] pb-[var(--space-8)]">
          <p className="text-[14px] text-[var(--ink-secondary)]">
            Deze woning bestaat niet of is verwijderd.
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

  // Property exists but no advert generated yet
  if (!advert) {
    return (
      <div>
        <Header title={`${property.address}, ${property.city}`} />
        <div className="px-[var(--space-8)] pb-[var(--space-8)]">
          <p className="text-[14px] text-[var(--ink-secondary)]">
            Advertentie nog niet gegenereerd. Ga naar de woning om een
            advertentie te genereren.
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

  async function handleSave() {
    if (!property || !advert) return;
    await saveAdvert({
      propertyId: property.id,
      title,
      description,
      features,
      platform: activePlatform,
      propertyAddress: property.address,
    });
    // Reset initialized so next cache update re-syncs
    setInitialized(false);
  }

  async function handlePublish() {
    if (!property) return;
    await publishAdvert({
      propertyId: property.id,
      propertyAddress: property.address,
      platform: activePlatform,
    });
  }

  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      {/* Header */}
      <div className="shrink-0 border-b border-[var(--border)]">
        <div className="flex items-center gap-[var(--space-4)] px-[var(--space-8)] pt-[var(--space-6)] pb-[var(--space-4)]">
          <Link
            href="/dashboard"
            className="rounded-[var(--radius-sm)] p-[var(--space-1)] text-[var(--ink-tertiary)] transition-colors hover:bg-[var(--surface-2)] hover:text-[var(--ink-secondary)]"
          >
            <ArrowLeft className="size-5" />
          </Link>
          <div className="min-w-0 flex-1">
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
            isSaving={isSaving}
            isPublishing={isPublishing}
            isDirty={isDirty}
            onSave={handleSave}
            onPublish={handlePublish}
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
