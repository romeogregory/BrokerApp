import { Header } from "@/components/layout/header";

export default function DashboardPage() {
  return (
    <div>
      <Header title="Dashboard" />
      <div className="px-[var(--space-8)]">
        <p className="text-[14px] text-[var(--ink-secondary)]">
          Welkom terug, Jan.
        </p>
      </div>
    </div>
  );
}
