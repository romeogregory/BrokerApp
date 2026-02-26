import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false, gcTime: 0 },
    },
  });
}

export function TestQueryWrapper({ children }: { children: React.ReactNode }) {
  const [queryClient] = React.useState(() => createTestQueryClient());
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
