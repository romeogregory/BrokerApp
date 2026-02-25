export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="flex min-h-svh flex-col items-center justify-center px-4 py-12"
      style={{ backgroundColor: "var(--canvas)" }}
    >
      <div className="mb-8 flex items-center gap-2">
        <div
          className="flex h-9 w-9 items-center justify-center rounded-lg text-sm font-bold"
          style={{
            backgroundColor: "var(--brand)",
            color: "var(--brand-foreground)",
          }}
        >
          B
        </div>
        <span
          className="text-xl font-bold tracking-tight"
          style={{ color: "var(--ink)" }}
        >
          BrokerApp
        </span>
      </div>
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
