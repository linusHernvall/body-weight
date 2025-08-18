"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { useState } from "react";
import { UnitsProvider } from "@/contexts/units-context";

export function Providers({ children }: { children: React.ReactNode }) {
  const [query_client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={query_client}>
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem
        disableTransitionOnChange
      >
        <UnitsProvider>{children}</UnitsProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
