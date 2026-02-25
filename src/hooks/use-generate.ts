"use client";

import { useState, useCallback } from "react";
import { generateAdvert } from "@/lib/mock-ai";
import type { Property, Advert } from "@/lib/types";

interface UseGenerateReturn {
  advert: Advert | null;
  isLoading: boolean;
  error: string | null;
  generate: (property: Property) => Promise<void>;
  reset: () => void;
}

export function useGenerate(): UseGenerateReturn {
  const [advert, setAdvert] = useState<Advert | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(async (property: Property) => {
    setIsLoading(true);
    setError(null);
    setAdvert(null);

    try {
      const result = await generateAdvert(property);
      setAdvert(result);
    } catch {
      setError("Er ging iets mis bij het genereren. Probeer het opnieuw.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setAdvert(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return { advert, isLoading, error, generate, reset };
}
