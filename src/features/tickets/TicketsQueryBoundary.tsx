'use client';

// Uses the app's QueryProvider when it exists (Module 3 adds it to the root layout).
// Until that branch is merged, this gives Module 4 its own QueryClient so the board
// still works. Once QueryProvider is in the layout, this boundary does nothing.

import React, { useContext, useState } from 'react';
import { QueryClient, QueryClientContext, QueryClientProvider } from '@tanstack/react-query';

export function TicketsQueryBoundary({ children }: { children: React.ReactNode }) {
  const existing = useContext(QueryClientContext);
  const [fallback] = useState(
    () => new QueryClient({ defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } } })
  );
  if (existing) return <>{children}</>;
  return <QueryClientProvider client={fallback}>{children}</QueryClientProvider>;
}
