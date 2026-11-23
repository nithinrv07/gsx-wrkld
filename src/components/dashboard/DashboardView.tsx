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
import { MyTicketsPanel } from './MyTicketsPanel';
import { AlertsPanel } from './AlertsPanel';
import { ProjectOverview } from './ProjectOverview';
import { useReadAlerts } from '@/lib/dashboard/local-store';
import { DashboardEmptyState, DashboardError, DashboardSkeleton } from './DashboardStates';

export function DashboardView() {
  const router = useRouter();
  const { status, user } = useViewer();
  const summary = useDashboardSummary();
  const tickets = useMyTickets();
  const blockers = useOpenBlockers();
  const refresh = useRefreshDashboard();
  // Shared with the top bar's alert bell, so read/unread stays in sync.
  const [readKeys, setReadKeys] = useReadAlerts(user?.id ?? 'default');
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
          {/* 1. At a glance */}
          <DashboardStats summary={data} />

          {/* 2. What needs me: my tickets and open blockers */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <MyTicketsPanel
              tickets={tickets.data}
              isLoading={tickets.isPending}
              error={tickets.error}
              onRetry={() => tickets.refetch()}
              isRetrying={tickets.isFetching}
            />
            <AlertsPanel
              blockers={blockers.data}
              isLoading={blockers.isPending}
              error={blockers.error}
              onRetry={() => blockers.refetch()}
              isRetrying={blockers.isFetching}
              readKeys={readKeys}
              onReadKeysChange={setReadKeys}
            />
          </div>

          {/* 3. My projects */}
          <ProjectOverview projects={data.projects} />
        </>
      )}
    </div>
  );
}
