import { type ReactNode } from "react";

interface HeaderProps {
  title: string;
  action?: ReactNode;
}

export function Header({ title, action }: HeaderProps) {
  return (
    <div className="flex items-center justify-between px-[var(--space-8)] pt-[var(--space-8)] pb-[var(--space-6)]">
      <h1 className="text-[30px] font-bold tracking-[-0.02em] text-[var(--ink)]">
        {title}
      </h1>
      {action && <div>{action}</div>}
    </div>
  );
}
