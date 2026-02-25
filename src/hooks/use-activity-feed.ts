"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { queryKeys, getActivityFeed } from "@/lib/supabase/queries";

export function useActivityFeed(limit = 10) {
  const supabase = createClient();

  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.activityFeed.all(limit),
    queryFn: () => getActivityFeed(supabase, limit),
    staleTime: 30_000, // 30 second cache
  });

  return {
    activities: data ?? [],
    isLoading,
    error,
  };
}
