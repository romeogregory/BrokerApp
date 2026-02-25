"use client";

import { Platform } from "@/lib/types";
import { cn } from "@/lib/utils";

interface PlatformTabsProps {
  active: Platform;
  onChange: (platform: Platform) => void;
}

const platforms = [
  { value: Platform.Funda, label: "Funda", color: "#003580" },
  { value: Platform.Pararius, label: "Pararius", color: "#00A651" },
  { value: Platform.Jaap, label: "Jaap", color: "#F28C00" },
] as const;

export function PlatformTabs({ active, onChange }: PlatformTabsProps) {
  return (
    <div className="flex gap-[var(--space-1)] rounded-[var(--radius-sm)] bg-[var(--surface-2)] p-[3px]">
      {platforms.map((p) => {
        const isActive = active === p.value;
        return (
          <button
            key={p.value}
            onClick={() => onChange(p.value)}
            className={cn(
              "relative flex-1 rounded-[calc(var(--radius-sm)-2px)] px-[var(--space-3)] py-[var(--space-2)] text-[13px] font-medium transition-all duration-200",
              isActive
                ? "bg-[var(--surface-1)] text-[var(--ink)] shadow-[var(--shadow-card)]"
                : "text-[var(--ink-secondary)] hover:text-[var(--ink)]"
            )}
          >
            <span className="flex items-center justify-center gap-[var(--space-2)]">
              <span
                className="inline-block size-2 rounded-full"
                style={{ backgroundColor: p.color }}
              />
              {p.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
