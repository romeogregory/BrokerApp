"use client";

import { useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageGallery, type ImageFile } from "@/components/upload/image-gallery";
import {
  PropertyForm,
  type PropertyFormData,
  emptyFormData,
} from "@/components/upload/property-form";
import { GenerateButton } from "@/components/upload/generate-button";
import { useGenerate } from "@/hooks/use-generate";
import { useAuth } from "@/hooks/use-auth";
import { useCreateProperty } from "@/hooks/use-properties";
import { PropertyStatus } from "@/lib/types";

function isFormComplete(data: PropertyFormData, images: ImageFile[]): boolean {
  return (
    data.address.trim() !== "" &&
    data.postalCode.trim() !== "" &&
    data.city.trim() !== "" &&
    data.price.trim() !== "" &&
    data.squareMeters.trim() !== "" &&
    data.rooms.trim() !== "" &&
    data.bedrooms.trim() !== "" &&
    data.bathrooms.trim() !== "" &&
    data.buildYear.trim() !== "" &&
    data.energyLabel.trim() !== "" &&
    images.length > 0
  );
}

export default function NieuwPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [formData, setFormData] = useState<PropertyFormData>(emptyFormData);
  const [images, setImages] = useState<ImageFile[]>([]);
  const { advert, isLoading: isGenerating, error: generateError, generate } = useGenerate();
  const { createProperty, isCreating, error: createError } = useCreateProperty();

  const propertyId = useMemo(() => crypto.randomUUID(), []);

  const isReady = isFormComplete(formData, images);
  const isLoading = isGenerating || isCreating;
  const error = createError
    ? createError instanceof Error
      ? createError.message
      : "Er ging iets mis bij het opslaan"
    : generateError;

  const handleGenerate = useCallback(async () => {
    if (!isReady || !user) return;

    try {
      const imageUrls = images.map((img) => img.storagePath ?? img.previewUrl);

      const property = await createProperty({
        id: propertyId,
        userId: user.id,
        address: formData.address,
        postalCode: formData.postalCode,
        city: formData.city,
        price: Number(formData.price),
        squareMeters: Number(formData.squareMeters),
        rooms: Number(formData.rooms),
        bedrooms: Number(formData.bedrooms),
        bathrooms: Number(formData.bathrooms),
        buildYear: Number(formData.buildYear),
        energyLabel: formData.energyLabel,
        status: PropertyStatus.Draft,
        images: imageUrls,
      });

      generate(property);
      router.push(`/advertentie/${property.id}`);
    } catch {
      // Error is handled via the createError state from the mutation
    }
  }, [isReady, user, images, createProperty, propertyId, formData, generate, router]);

  return (
    <div>
      <Header title="Nieuwe advertentie" />

      <div className="px-[var(--space-8)] pb-[var(--space-8)]">
        <div className="grid gap-[var(--space-6)] lg:grid-cols-2">
          {/* Left column: Image gallery */}
          <Card>
            <CardHeader>
              <CardTitle className="text-[16px] font-semibold text-[var(--ink)]">
                Foto&apos;s
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ImageGallery
                images={images}
                onImagesChange={setImages}
                userId={user?.id}
                propertyId={propertyId}
              />
            </CardContent>
          </Card>

          {/* Right column: Property form + generate */}
          <div className="flex flex-col gap-[var(--space-6)]">
            <Card>
              <CardHeader>
                <CardTitle className="text-[16px] font-semibold text-[var(--ink)]">
                  Woninggegevens
                </CardTitle>
              </CardHeader>
              <CardContent>
                <PropertyForm data={formData} onChange={setFormData} />
              </CardContent>
            </Card>

            <GenerateButton
              isReady={isReady}
              isLoading={isLoading}
              onClick={handleGenerate}
            />

            {error && (
              <div className="rounded-[var(--radius-md)] bg-[var(--destructive-subtle)] px-[var(--space-4)] py-[var(--space-3)] text-[14px] text-[var(--destructive)]">
                {error}
              </div>
            )}

            {advert && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-[16px] font-semibold text-[var(--ink)]">
                    Gegenereerde advertentie
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-[var(--space-4)]">
                  <div>
                    <h3 className="text-[14px] font-semibold text-[var(--ink)]">
                      {advert.title}
                    </h3>
                    <p className="mt-[var(--space-2)] text-[14px] leading-relaxed text-[var(--ink-secondary)]">
                      {advert.description}
                    </p>
                  </div>
                  <div>
                    <p className="text-[13px] font-medium tracking-[0.01em] text-[var(--ink-tertiary)]">
                      Kenmerken
                    </p>
                    <ul className="mt-[var(--space-2)] flex flex-col gap-[var(--space-1)]">
                      {advert.features.map((feature, i) => (
                        <li
                          key={i}
                          className="text-[14px] text-[var(--ink-secondary)] before:mr-[var(--space-2)] before:content-['•'] before:text-[var(--brand)]"
                        >
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
