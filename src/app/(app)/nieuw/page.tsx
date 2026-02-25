"use client";

import { useState, useCallback } from "react";
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
import { PropertyStatus } from "@/lib/types";
import type { Property } from "@/lib/types";

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

function formToProperty(data: PropertyFormData, images: ImageFile[]): Property {
  return {
    id: `prop-${Date.now()}`,
    address: data.address,
    postalCode: data.postalCode,
    city: data.city,
    price: Number(data.price),
    squareMeters: Number(data.squareMeters),
    rooms: Number(data.rooms),
    bedrooms: Number(data.bedrooms),
    bathrooms: Number(data.bathrooms),
    buildYear: Number(data.buildYear),
    energyLabel: data.energyLabel,
    status: PropertyStatus.Draft,
    images: images.map((img) => img.previewUrl),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

export default function NieuwPage() {
  const [formData, setFormData] = useState<PropertyFormData>(emptyFormData);
  const [images, setImages] = useState<ImageFile[]>([]);
  const { advert, isLoading, error, generate } = useGenerate();

  const isReady = isFormComplete(formData, images);

  const handleGenerate = useCallback(() => {
    if (!isReady) return;
    const property = formToProperty(formData, images);
    generate(property);
  }, [isReady, formData, images, generate]);

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
              <ImageGallery images={images} onImagesChange={setImages} />
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
