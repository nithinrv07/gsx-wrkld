import { Suspense } from 'react';
import type { Metadata } from 'next';
import { AnalyticsView } from '@/components/analytics/AnalyticsView';
import { ProjectProgressSkeleton } from '@/components/analytics/ProjectProgressSection';

export const metadata: Metadata = { title: 'Analytics — Wrkld' };

export default function AnalyticsPage() {
  // Filters live in the URL (?project=&pod=), which is only known at request time.
  return (
    <Suspense fallback={<ProjectProgressSkeleton />}>
      <AnalyticsView />
    </Suspense>
  );
}
