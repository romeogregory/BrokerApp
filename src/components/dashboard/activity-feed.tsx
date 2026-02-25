"use client";

import { ActivityItem, Platform } from "@/lib/types";
import { Sparkles, Pencil, Globe } from "lucide-react";

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) return "zojuist";
  if (diffMinutes < 60) return `${diffMinutes} min geleden`;
  if (diffHours < 24) return `${diffHours} uur geleden`;
  if (diffDays === 1) return "gisteren";
  if (diffDays < 7) return `${diffDays} dagen geleden`;
  if (diffDays < 14) return "vorige week";
  return `${Math.floor(diffDays / 7)} weken geleden`;
}

const activityConfig: Record<
  ActivityItem["type"],
  { icon: typeof Sparkles; label: string; color: string }
> = {
  generated: {
    icon: Sparkles,
    label: "Advertentie gegenereerd",
    color: "var(--warning)",
  },
  edited: {
    icon: Pencil,
    label: "Advertentie bewerkt",
    color: "var(--info)",
  },
  published: {
    icon: Globe,
    label: "Gepubliceerd",
    color: "var(--success)",
  },
};

const platformLabels: Record<Platform, string> = {
  [Platform.Funda]: "Funda",
  [Platform.Pararius]: "Pararius",
  [Platform.Jaap]: "Jaap",
};

interface ActivityFeedProps {
  activities: ActivityItem[];
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  return (
    <div
      className="rounded-[var(--radius-md)] bg-[var(--surface-1)] p-[var(--space-5)]"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <h2 className="text-[16px] font-semibold text-[var(--ink)]">
        Recente activiteit
      </h2>
      <div className="mt-[var(--space-4)] flex flex-col gap-0 divide-y divide-[var(--border)]">
        {activities.map((activity) => {
          const config = activityConfig[activity.type];
          const Icon = config.icon;
          const platformSuffix =
            activity.type === "published" && activity.platform
              ? ` op ${platformLabels[activity.platform]}`
              : "";

          return (
            <div
              key={activity.id}
              className="flex items-start gap-[var(--space-3)] py-[var(--space-3)] first:pt-0 last:pb-0"
            >
              <div
                className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-[var(--radius-full)]"
                style={{ backgroundColor: `color-mix(in srgb, ${config.color} 15%, transparent)` }}
              >
                <Icon
                  className="h-3.5 w-3.5"
                  style={{ color: config.color }}
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-medium text-[var(--ink)]">
                  {config.label}
                  {platformSuffix}
                </p>
                <p className="truncate text-[12px] tracking-[0.01em] text-[var(--ink-secondary)]">
                  {activity.propertyAddress}
                </p>
              </div>
              <span className="shrink-0 text-[12px] tracking-[0.01em] text-[var(--ink-tertiary)]">
                {formatRelativeTime(activity.timestamp)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
