"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import {
  queryKeys,
  getProperties,
  getPropertyById,
  getRecentProperties,
} from "@/lib/supabase/queries";
import {
  createProperty,
  updateProperty,
  deleteProperty,
} from "@/lib/supabase/mutations";
import type { CreatePropertyInput } from "@/lib/supabase/mutations";
import type { Property, PropertyStatus } from "@/lib/types";

export function useProperties(status?: PropertyStatus) {
  const supabase = createClient();

  const { data, isLoading, error } = useQuery({
    queryKey: status
      ? [...queryKeys.properties.all, status]
      : queryKeys.properties.all,
    queryFn: () => getProperties(supabase, status),
  });

  const properties = data ?? [];

  function getById(id: string): Property | undefined {
    return properties.find((p) => p.id === id);
  }

  return { properties, getById, isLoading, error };
}

export function useProperty(id: string | undefined) {
  const supabase = createClient();

  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.properties.detail(id ?? ""),
    queryFn: () => getPropertyById(supabase, id!),
    enabled: !!id,
  });

  return { property: data ?? null, isLoading, error };
}

export function useRecentProperties(limit = 3) {
  const supabase = createClient();

  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.properties.recent(limit),
    queryFn: () => getRecentProperties(supabase, limit),
  });

  return { properties: data ?? [], isLoading, error };
}

export function useCreateProperty() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  const { mutateAsync, isPending, error } = useMutation({
    mutationFn: (data: CreatePropertyInput) => createProperty(supabase, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.properties.all });
    },
    onError: () => {
      toast.error("Woning aanmaken mislukt", {
        description: "Probeer het later opnieuw.",
      });
    },
  });

  return { createProperty: mutateAsync, isCreating: isPending, error };
}

export function useUpdateProperty() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  const { mutateAsync, isPending, error } = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreatePropertyInput> }) =>
      updateProperty(supabase, id, data),
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.properties.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.properties.detail(variables.id),
      });
    },
    onError: () => {
      toast.error("Woning bijwerken mislukt", {
        description: "Probeer het later opnieuw.",
      });
    },
  });

  return { updateProperty: mutateAsync, isUpdating: isPending, error };
}

export function useDeleteProperty() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  const { mutateAsync, isPending, error } = useMutation({
    mutationFn: (id: string) => deleteProperty(supabase, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.properties.all });
    },
    onError: () => {
      toast.error("Woning verwijderen mislukt", {
        description: "Probeer het later opnieuw.",
      });
    },
  });

  return { deleteProperty: mutateAsync, isDeleting: isPending, error };
}
