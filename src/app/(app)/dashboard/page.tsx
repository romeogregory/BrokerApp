"use client";

import { Header } from "@/components/layout/header";
import { StatCard } from "@/components/dashboard/stat-card";
import { PropertyCard } from "@/components/dashboard/property-card";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { useProperties } from "@/hooks/use-properties";
import { mockDashboardStats, mockActivityFeed } from "@/lib/mock-data";
import { Building2, Sparkles, Globe, Timer } from "lucide-react";

export default function DashboardPage() {
  const { properties } = useProperties();

  return (
    <div>
      <Header title="Dashboard" />
      <div className="px-[var(--space-8)] pb-[var(--space-8)]">
        <p className="text-[14px] text-[var(--ink-secondary)]">
          Welkom terug, Jan.
        </p>

        {/* Stats row */}
        <div className="mt-[var(--space-6)] grid grid-cols-1 gap-[var(--space-4)] sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Totaal woningen"
            value={mockDashboardStats.totalProperties}
            trend={mockDashboardStats.totalPropertiesTrend}
            icon={Building2}
          />
          <StatCard
            label="Gegenereerd deze maand"
            value={mockDashboardStats.generatedThisMonth}
            trend={mockDashboardStats.generatedThisMonthTrend}
            icon={Sparkles}
          />
          <StatCard
            label="Gepubliceerd"
            value={mockDashboardStats.published}
            trend={mockDashboardStats.publishedTrend}
            icon={Globe}
          />
          <StatCard
            label="Gem. generatietijd"
            value={mockDashboardStats.averageGenerationTime}
            trend={mockDashboardStats.averageGenerationTimeTrend}
            icon={Timer}
          />
        </div>

        {/* Main content: property grid + activity feed */}
        <div className="mt-[var(--space-8)] grid grid-cols-1 gap-[var(--space-6)] lg:grid-cols-[1fr_360px]">
          {/* Property grid */}
          <div>
            <h2 className="text-[20px] font-semibold tracking-[-0.01em] text-[var(--ink)]">
              Woningen
            </h2>
            <div className="mt-[var(--space-4)] grid grid-cols-1 gap-[var(--space-4)] sm:grid-cols-2 xl:grid-cols-3">
              {properties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          </div>

          {/* Activity feed sidebar */}
          <div>
            <ActivityFeed activities={mockActivityFeed} />
          </div>
        </div>
      </div>
    </div>
  );
}
