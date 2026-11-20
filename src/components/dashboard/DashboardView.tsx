'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useIsFetching } from '@tanstack/react-query';
import {
  dashboardKeys,
  useDashboardSummary,
  useMyTickets,
  useOpenBlockers,
  useRefreshDashboard,
} from '@/lib/dashboard/queries';
import { dashboardRoutes } from '@/lib/dashboard/routes';
import { useViewer } from '@/lib/dashboard/viewer';
import { DashboardHeader } from './DashboardHeader';
import { DashboardStats } from './DashboardStats';
import { SprintPerformanceChart } from './SprintPerformanceChart';
import { ActiveProjectsCard } from './ActiveProjectsCard';
import { PendingReviewsCard } from './PendingReviewsCard';
import { SprintCompletionCard } from './SprintCompletionCard';
import { PodWorkloadCard } from './PodWorkloadCard';
import { DashboardEmptyState, DashboardError, DashboardSkeleton } from './DashboardStates';

export function DashboardView() {
  const router = useRouter();
  const { status, user } = useViewer();
  const summary = useDashboardSummary();
  const tickets = useMyTickets();
  const blockers = useOpenBlockers();
  const refresh = useRefreshDashboard();
  const isFetching = useIsFetching({ queryKey: dashboardKeys.all }) > 0;

  // Same convention as the Pod pages: no session, go to sign-in.
  useEffect(() => {
    if (status === 'signed-out') router.replace(dashboardRoutes.signIn);
  }, [status, router]);

  if (!user || summary.isPending) return <DashboardSkeleton />;
  if (summary.isError)
    return (
      <DashboardError
        message={summary.error.message}
        onRetry={() => summary.refetch()}
        isRetrying={summary.isFetching}
      />
    );

  const data = summary.data;
  const isEmpty = data.projects.length === 0 && data.stats.assignedTickets === 0;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <DashboardHeader
        user={user}
        onRefresh={refresh}
        isRefreshing={isFetching}
        updatedAt={summary.dataUpdatedAt}
      />

      {isEmpty ? (
        <DashboardEmptyState onRefresh={refresh} />
      ) : (
        <>
          {/* Top 4 KPI Metric Cards in 1 Row */}
          <DashboardStats summary={data} />

          {/* Middle Row: Sprint Velocity Area Chart & Active Projects Table */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <SprintPerformanceChart />
            <ActiveProjectsCard projects={data.projects} />
          </div>

          {/* Bottom Row: 3 Cards matching design reference */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <PendingReviewsCard tickets={tickets.data} />
            <SprintCompletionCard progress={data.overallProgress} />
            <PodWorkloadCard blockers={blockers.data} />
          </div>
        </>
      )}
    </div>
  );
}
