"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { queryKeys } from "@/lib/supabase/queries";
import { logQuery } from "@/lib/supabase/logger";
import { PropertyStatus } from "@/lib/types";
import type { Advert, Platform } from "@/lib/types";

interface AdvertRow {
  id: string;
  property_id: string;
  title: string;
  description: string;
  features: string[];
  platform: string;
  created_at: string;
}

function mapRowToAdvert(row: AdvertRow): Advert {
  return {
    id: row.id,
    propertyId: row.property_id,
    title: row.title,
    description: row.description,
    features: row.features,
    platform: row.platform as Platform,
    createdAt: new Date(row.created_at),
  };
}

export function useAdvert(propertyId: string | undefined) {
  const supabase = createClient();

  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.adverts.byProperty(propertyId ?? ""),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("adverts")
        .select("*")
        .eq("property_id", propertyId!)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        throw new Error(`Advertentie ophalen mislukt: ${error.message}`);
      }

      return data ? mapRowToAdvert(data as AdvertRow) : null;
    },
    enabled: !!propertyId,
  });

  return { advert: data ?? null, isLoading, error };
}

interface SaveAdvertInput {
  propertyId: string;
  title: string;
  description: string;
  features: string[];
  platform: Platform;
  propertyAddress: string;
}

export function useSaveAdvert() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  const { mutateAsync, isPending, error } = useMutation({
    mutationFn: async (input: SaveAdvertInput) => {
      const { data, error } = await supabase
        .from("adverts")
        .upsert(
          {
            property_id: input.propertyId,
            title: input.title,
            description: input.description,
            features: input.features,
            platform: input.platform,
          },
          { onConflict: "property_id" }
        )
        .select()
        .single();

      if (error) {
        throw new Error(`Advertentie opslaan mislukt: ${error.message}`);
      }

      // Create activity log entry (non-critical: log but don't throw)
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { error: activityError } = await supabase
          .from("activity_log")
          .insert({
            user_id: user.id,
            type: "edited",
            property_id: input.propertyId,
            property_address: input.propertyAddress,
            platform: input.platform,
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

      return mapRowToAdvert(data as AdvertRow);
    },
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.adverts.byProperty(variables.propertyId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.activityFeed.all(10),
      });
    },
    onError: () => {
      toast.error("Advertentie opslaan mislukt", {
        description: "Probeer het later opnieuw.",
      });
    },
  });

  return { saveAdvert: mutateAsync, isSaving: isPending, error };
}

interface PublishAdvertInput {
  propertyId: string;
  propertyAddress: string;
  platform: Platform;
}

export function usePublishAdvert() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  const { mutateAsync, isPending, error } = useMutation({
    mutationFn: async (input: PublishAdvertInput) => {
      const { error: updateError } = await supabase
        .from("properties")
        .update({ status: PropertyStatus.Published })
        .eq("id", input.propertyId);

      if (updateError) {
        throw new Error(`Publiceren mislukt: ${updateError.message}`);
      }

      // Create activity log entry (non-critical: log but don't throw)
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { error: activityError } = await supabase
          .from("activity_log")
          .insert({
            user_id: user.id,
            type: "published",
            property_id: input.propertyId,
            property_address: input.propertyAddress,
            platform: input.platform,
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
    },
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.properties.all,
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.properties.detail(variables.propertyId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.activityFeed.all(10),
      });
    },
    onError: () => {
      toast.error("Publiceren mislukt", {
        description: "Probeer het later opnieuw.",
      });
    },
  });

  return { publishAdvert: mutateAsync, isPublishing: isPending, error };
}
