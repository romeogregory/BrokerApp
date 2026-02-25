"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Plus, Menu, X, Home } from "lucide-react";
import { cn } from "@/lib/utils";
import { mockProperties } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const navLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/nieuw", label: "Nieuwe advertentie", icon: Plus },
];

const recentProperties = mockProperties.slice(0, 3);

export function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile hamburger button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-[var(--space-3)] left-[var(--space-3)] z-50 md:hidden"
        onClick={() => setMobileOpen(true)}
        aria-label="Open menu"
      >
        <Menu className="size-5" />
      </Button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "flex h-screen w-64 shrink-0 flex-col border-r bg-[var(--canvas)] border-[var(--border)]",
          "fixed z-50 transition-transform duration-200 ease-out md:sticky md:top-0 md:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Mobile close button */}
        <div className="flex items-center justify-between px-[var(--space-4)] pt-[var(--space-4)] md:hidden">
          <span className="text-[20px] font-semibold tracking-[-0.01em] text-[var(--brand)]">
            BrokerApp
          </span>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setMobileOpen(false)}
            aria-label="Sluit menu"
          >
            <X className="size-4" />
          </Button>
        </div>

        {/* Brand mark (desktop) */}
        <div className="hidden px-[var(--space-4)] pt-[var(--space-6)] pb-[var(--space-4)] md:block">
          <Link href="/dashboard" className="text-[20px] font-semibold tracking-[-0.01em] text-[var(--brand)]">
            BrokerApp
          </Link>
        </div>

        {/* Navigation links */}
        <nav className="flex flex-col gap-[var(--space-1)] px-[var(--space-3)] pt-[var(--space-2)]">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-[var(--space-3)] rounded-[var(--radius-sm)] px-[var(--space-3)] py-[var(--space-2)] text-[14px] font-medium transition-colors duration-150",
                  isActive
                    ? "bg-[var(--brand-subtle)] text-[var(--brand)]"
                    : "text-[var(--ink-secondary)] hover:bg-[var(--surface-2)]"
                )}
              >
                <link.icon className="size-4 shrink-0" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Recent properties section */}
        <div className="mt-[var(--space-6)] px-[var(--space-3)]">
          <Separator className="mb-[var(--space-4)]" />
          <p className="px-[var(--space-3)] text-[12px] font-medium tracking-[0.01em] text-[var(--ink-tertiary)] uppercase">
            Recente woningen
          </p>
          <div className="mt-[var(--space-2)] flex flex-col gap-[var(--space-1)]">
            {recentProperties.map((property) => (
              <Link
                key={property.id}
                href={
                  property.status === "draft"
                    ? "/nieuw"
                    : `/advertentie/${property.id}`
                }
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-[var(--space-2)] rounded-[var(--radius-sm)] px-[var(--space-3)] py-[var(--space-2)] text-[13px] text-[var(--ink-secondary)] transition-colors duration-150 hover:bg-[var(--surface-2)]"
              >
                <Home className="size-3.5 shrink-0 text-[var(--ink-tertiary)]" />
                <span className="truncate">
                  {property.address}, {property.city}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* User section */}
        <div className="px-[var(--space-3)] pb-[var(--space-4)]">
          <Separator className="mb-[var(--space-4)]" />
          <div className="flex items-center gap-[var(--space-3)] rounded-[var(--radius-sm)] px-[var(--space-3)] py-[var(--space-2)]">
            <Avatar>
              <AvatarFallback className="bg-[var(--brand-subtle)] text-[var(--brand)] text-[13px] font-medium">
                JV
              </AvatarFallback>
            </Avatar>
            <span className="text-[14px] font-medium text-[var(--ink)]">
              Jan de Vries
            </span>
          </div>
        </div>
      </aside>
    </>
  );
}
