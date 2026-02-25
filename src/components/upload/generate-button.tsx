"use client";

import { Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface GenerateButtonProps {
  isReady: boolean;
  isLoading: boolean;
  onClick: () => void;
}

export function GenerateButton({
  isReady,
  isLoading,
  onClick,
}: GenerateButtonProps) {
  return (
    <Button
      size="lg"
      disabled={!isReady || isLoading}
      onClick={onClick}
      className="w-full gap-[var(--space-2)]"
    >
      {isLoading ? (
        <>
          <Loader2 className="size-4 animate-spin" />
          Advertentie genereren...
        </>
      ) : (
        <>
          <Sparkles className="size-4" />
          Advertentie genereren
        </>
      )}
    </Button>
  );
}
