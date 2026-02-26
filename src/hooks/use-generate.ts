"use client";

import { useState, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { queryKeys } from "@/lib/supabase/queries";
import { logQuery } from "@/lib/supabase/logger";
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
        throw new Error(
          `Advertentie opslaan mislukt: ${advertError.message}`
        );
      }

      // Update property status to generated
      const { error: updateError } = await supabase
        .from("properties")
        .update({ status: PropertyStatus.Generated })
        .eq("id", property.id);

      if (updateError) {
        throw new Error(
          `Woningsstatus bijwerken mislukt: ${updateError.message}`
        );
      }

      // Insert activity log entry (non-critical: log but don't throw)
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
          logQuery({
            table: "activity_log",
            operation: "insert",
            duration_ms: 0,
            error_category: "unknown",
            error_message: activityError.message,
            error_code: activityError.code,
            status: "error",
          });
        }
      }

      // Build advert object for UI (advertRow guaranteed non-null after error check)
      const resultAdvert: Advert = {
        id: advertRow!.id,
        propertyId: property.id,
        title: generated.title,
        description: generated.description,
        features: generated.features,
        platform,
        createdAt: new Date(advertRow!.created_at),
      };

      setAdvert(resultAdvert);

      // Invalidate relevant caches
      queryClient.invalidateQueries({ queryKey: queryKeys.properties.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.properties.detail(property.id),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.adverts.byProperty(property.id),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.activityFeed.all(10),
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
