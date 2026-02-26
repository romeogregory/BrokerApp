"use client";

import { Header } from "@/components/layout/header";
import { StatCard } from "@/components/dashboard/stat-card";
import { PropertyCard } from "@/components/dashboard/property-card";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { useProperties } from "@/hooks/use-properties";
import { useDashboardStats } from "@/hooks/use-dashboard-stats";
import { useActivityFeed } from "@/hooks/use-activity-feed";
import { useAuth } from "@/hooks/use-auth";
import { Building2, Sparkles, Globe, Timer } from "lucide-react";

function StatCardSkeleton() {
  return (
    <div
      className="flex items-start gap-[var(--space-4)] rounded-[var(--radius-md)] bg-[var(--surface-1)] p-[var(--space-5)]"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <div className="h-10 w-10 shrink-0 animate-pulse rounded-[var(--radius-sm)] bg-[var(--surface-2)]" />
      <div className="min-w-0 flex-1">
        <div className="h-8 w-16 animate-pulse rounded-[var(--radius-sm)] bg-[var(--surface-2)]" />
        <div className="mt-[var(--space-1)] h-3 w-24 animate-pulse rounded-[var(--radius-sm)] bg-[var(--surface-2)]" />
        <div className="mt-[var(--space-2)] h-3 w-12 animate-pulse rounded-[var(--radius-sm)] bg-[var(--surface-2)]" />
      </div>
    </div>
  );
}

function ActivityFeedSkeleton() {
  return (
    <div
      className="rounded-[var(--radius-md)] bg-[var(--surface-1)] p-[var(--space-5)]"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <div className="h-5 w-32 animate-pulse rounded-[var(--radius-sm)] bg-[var(--surface-2)]" />
      <div className="mt-[var(--space-4)] flex flex-col gap-[var(--space-3)]">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-start gap-[var(--space-3)]">
            <div className="h-7 w-7 shrink-0 animate-pulse rounded-[var(--radius-full)] bg-[var(--surface-2)]" />
            <div className="min-w-0 flex-1">
              <div className="h-3 w-36 animate-pulse rounded-[var(--radius-sm)] bg-[var(--surface-2)]" />
              <div className="mt-1 h-3 w-48 animate-pulse rounded-[var(--radius-sm)] bg-[var(--surface-2)]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { properties, error: propertiesError } = useProperties();
  const { stats, isLoading: statsLoading, error: statsError } = useDashboardStats();
  const { activities, isLoading: feedLoading, error: feedError } = useActivityFeed(10);
  const { user } = useAuth();

  const firstName = user?.user_metadata?.full_name?.split(" ")[0]
    ?? user?.email?.split("@")[0];
  const greeting = firstName ? `Welkom terug, ${firstName}.` : "Welkom terug.";

  return (
    <div>
      <Header title="Dashboard" />
      <div className="px-[var(--space-8)] pb-[var(--space-8)]">
        <p className="text-[14px] text-[var(--ink-secondary)]">
          {greeting}
        </p>

        {/* Stats row */}
        <div className="mt-[var(--space-6)] grid grid-cols-1 gap-[var(--space-4)] sm:grid-cols-2 lg:grid-cols-4">
          {statsLoading ? (
            <>
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
            </>
          ) : statsError ? (
            <div className="col-span-full rounded-[var(--radius-md)] bg-[var(--destructive-subtle)] px-[var(--space-4)] py-[var(--space-3)] text-[14px] text-[var(--destructive)]">
              Statistieken konden niet worden geladen.
            </div>
          ) : (
            <>
              <StatCard
                label="Totaal woningen"
                value={stats?.totalProperties ?? 0}
                trend={stats?.totalPropertiesTrend ?? 0}
                icon={Building2}
              />
              <StatCard
                label="Gegenereerd deze maand"
                value={stats?.generatedThisMonth ?? 0}
                trend={stats?.generatedThisMonthTrend ?? 0}
                icon={Sparkles}
              />
              <StatCard
                label="Gepubliceerd"
                value={stats?.published ?? 0}
                trend={stats?.publishedTrend ?? 0}
                icon={Globe}
              />
              <StatCard
                label="Gem. generatietijd"
                value={stats?.averageGenerationTime ?? "\u2014"}
                trend={stats?.averageGenerationTimeTrend ?? 0}
                icon={Timer}
              />
            </>
          )}
        </div>

        {/* Main content: property grid + activity feed */}
        <div className="mt-[var(--space-8)] grid grid-cols-1 gap-[var(--space-6)] lg:grid-cols-[1fr_360px]">
          {/* Property grid */}
          <div>
            <h2 className="text-[20px] font-semibold tracking-[-0.01em] text-[var(--ink)]">
              Woningen
            </h2>
            {propertiesError ? (
              <div className="mt-[var(--space-4)] rounded-[var(--radius-md)] bg-[var(--destructive-subtle)] px-[var(--space-4)] py-[var(--space-3)] text-[14px] text-[var(--destructive)]">
                Woningen konden niet worden geladen.
              </div>
            ) : !statsLoading && stats?.totalProperties === 0 ? (
              <p className="mt-[var(--space-4)] text-[14px] text-[var(--ink-secondary)]">
                Nog geen woningen toegevoegd. Begin met het uploaden van een woning.
              </p>
            ) : (
              <div className="mt-[var(--space-4)] grid grid-cols-1 gap-[var(--space-4)] sm:grid-cols-2 xl:grid-cols-3">
                {properties.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            )}
          </div>

          {/* Activity feed sidebar */}
          <div>
            {feedLoading ? (
              <ActivityFeedSkeleton />
            ) : feedError ? (
              <div className="rounded-[var(--radius-md)] bg-[var(--destructive-subtle)] px-[var(--space-4)] py-[var(--space-3)] text-[14px] text-[var(--destructive)]">
                Activiteit kon niet worden geladen.
              </div>
            ) : activities.length === 0 ? (
              <div
                className="rounded-[var(--radius-md)] bg-[var(--surface-1)] p-[var(--space-5)]"
                style={{ boxShadow: "var(--shadow-card)" }}
              >
                <h2 className="text-[16px] font-semibold text-[var(--ink)]">
                  Recente activiteit
                </h2>
                <p className="mt-[var(--space-4)] text-[14px] text-[var(--ink-secondary)]">
                  Nog geen activiteit.
                </p>
              </div>
            ) : (
              <ActivityFeed activities={activities} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
