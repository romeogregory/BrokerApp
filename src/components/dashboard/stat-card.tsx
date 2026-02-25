"use client";

import { type LucideIcon } from "lucide-react";
import { TrendingUp, TrendingDown } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  trend: number;
  icon: LucideIcon;
}

export function StatCard({ label, value, trend, icon: Icon }: StatCardProps) {
  const isPositive = trend >= 0;

  return (
    <div
      className="flex items-start gap-[var(--space-4)] rounded-[var(--radius-md)] bg-[var(--surface-1)] p-[var(--space-5)]"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--brand-subtle)]">
        <Icon className="h-5 w-5 text-[var(--brand)]" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[30px] font-bold leading-tight tracking-[-0.02em] text-[var(--ink)]">
          {value}
        </p>
        <p className="mt-[var(--space-1)] text-[12px] tracking-[0.01em] text-[var(--ink-tertiary)]">
          {label}
        </p>
        <div className="mt-[var(--space-2)] flex items-center gap-[var(--space-1)]">
          {isPositive ? (
            <TrendingUp className="h-3.5 w-3.5 text-[var(--success)]" />
          ) : (
            <TrendingDown className="h-3.5 w-3.5 text-[var(--destructive)]" />
          )}
          <span
            className="text-[12px] font-medium"
            style={{
              color: isPositive ? "var(--success)" : "var(--destructive)",
            }}
          >
            {isPositive ? "+" : ""}
            {trend}%
          </span>
        </div>
      </div>
    </div>
  );
}
