"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { queryKeys, getDashboardStats } from "@/lib/supabase/queries";

export function useDashboardStats() {
  const supabase = createClient();

  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.dashboard.stats,
    queryFn: () => getDashboardStats(supabase),
    staleTime: 60_000, // 1 minute cache
  });

  return {
    stats: data ?? null,
    isLoading,
    error,
  };
}
