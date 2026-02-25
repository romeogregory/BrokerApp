"use client";

import { useState, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { queryKeys } from "@/lib/supabase/queries";
import type { Property, Advert } from "@/lib/types";
import { Platform, PropertyStatus } from "@/lib/types";

interface GenerateResponse {
  title: string;
  description: string;
  features: string[];
  platform: string;
}

interface UseGenerateReturn {
  advert: Advert | null;
  isLoading: boolean;
  error: string | null;
  generate: (property: Property) => Promise<void>;
  reset: () => void;
}

function mapErrorMessage(status: number): string {
  switch (status) {
    case 401:
      return "U bent niet ingelogd. Log opnieuw in.";
    case 400:
      return "Onvolledige woninggegevens. Controleer alle velden.";
    default:
      return "Generatie mislukt, probeer het opnieuw.";
  }
}

export function useGenerate(): UseGenerateReturn {
  const [advert, setAdvert] = useState<Advert | null>(null);
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (property: Property) => {
      const supabase = createClient();

      const { data, error: fnError } = await supabase.functions.invoke<GenerateResponse>(
        "generate-advert",
        {
          body: {
            propertyId: property.id,
            address: property.address,
            city: property.city,
            price: property.price,
            squareMeters: property.squareMeters,
            rooms: property.rooms,
            bedrooms: property.bedrooms,
            bathrooms: property.bathrooms,
            buildYear: property.buildYear,
            energyLabel: property.energyLabel,
            images: property.images,
          },
        }
      );

      if (fnError) {
        // supabase.functions.invoke wraps non-2xx responses as FunctionsHttpError
        const status =
          "context" in fnError && typeof fnError.context === "object" && fnError.context !== null
            ? (fnError.context as { status?: number }).status
            : undefined;
        throw new Error(mapErrorMessage(status ?? 500));
      }

      if (!data) {
        throw new Error("Generatie mislukt, probeer het opnieuw.");
      }

      return { property, generated: data };
    },
    onSuccess: async ({ property, generated }) => {
      const supabase = createClient();

      const platform = (generated.platform ?? "funda") as Platform;

      // Insert advert into adverts table
      const { data: advertRow, error: advertError } = await supabase
        .from("adverts")
        .insert({
          property_id: property.id,
          title: generated.title,
          description: generated.description,
          features: generated.features,
          platform,
        })
        .select()
        .single();

      if (advertError) {
        console.error("Failed to save advert:", advertError);
      }

      // Update property status to generated
      const { error: updateError } = await supabase
        .from("properties")
        .update({ status: PropertyStatus.Generated })
        .eq("id", property.id);

      if (updateError) {
        console.error("Failed to update property status:", updateError);
      }

      // Insert activity log entry
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error: activityError } = await supabase
          .from("activity_log")
          .insert({
            user_id: user.id,
            type: "generated",
            property_id: property.id,
            property_address: property.address,
            platform,
          });

        if (activityError) {
          console.error("Failed to insert activity log:", activityError);
        }
      }

      // Build advert object for UI
      const resultAdvert: Advert = {
        id: advertRow?.id ?? crypto.randomUUID(),
        propertyId: property.id,
        title: generated.title,
        description: generated.description,
        features: generated.features,
        platform,
        createdAt: advertRow?.created_at
          ? new Date(advertRow.created_at)
          : new Date(),
      };

      setAdvert(resultAdvert);

      // Invalidate relevant caches
      queryClient.invalidateQueries({ queryKey: queryKeys.properties.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.properties.detail(property.id),
      });
      queryClient.invalidateQueries({
        queryKey: ["properties", "recent"],
      });
    },
    onError: (err: Error) => {
      setError(err.message);
    },
  });

  const generate = useCallback(
    async (property: Property) => {
      setError(null);
      setAdvert(null);
      mutation.mutate(property);
    },
    [mutation]
  );

  const reset = useCallback(() => {
    setAdvert(null);
    setError(null);
    mutation.reset();
  }, [mutation]);

  return {
    advert,
    isLoading: mutation.isPending,
    error,
    generate,
    reset,
  };
}
