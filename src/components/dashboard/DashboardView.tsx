'use client';

import React from 'react';
import { useIsFetching } from '@tanstack/react-query';
import {
  dashboardKeys,
  useCurrentRole,
  useDashboardSummary,
  useMyTickets,
  useOpenBlockers,
  useRefreshDashboard,
} from '@/lib/dashboard/queries';
import { useReadAlerts } from '@/lib/dashboard/local-store';
import { DashboardHeader } from './DashboardHeader';
import { DashboardStats } from './DashboardStats';
import { ProjectOverview } from './ProjectOverview';
import { MyTicketsPanel } from './MyTicketsPanel';
import { AlertsPanel } from './AlertsPanel';
import { DashboardEmptyState, DashboardError, DashboardSkeleton } from './DashboardStates';

const SHOW_ROLE_PREVIEW = process.env.NODE_ENV !== 'production';

export function DashboardView() {
  const [, setRole] = useCurrentRole();
  const summary = useDashboardSummary();
  const tickets = useMyTickets();
  const blockers = useOpenBlockers();
  const [readKeys, setReadKeys] = useReadAlerts();
  const refresh = useRefreshDashboard();
  const isFetching = useIsFetching({ queryKey: dashboardKeys.all }) > 0;

  if (summary.isPending) return <DashboardSkeleton />;
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
      <DashboardHeader
        user={data.user}
        onRefresh={refresh}
        isRefreshing={isFetching}
        updatedAt={summary.dataUpdatedAt}
        onPreviewRole={SHOW_ROLE_PREVIEW ? setRole : undefined}
      />

      {isEmpty ? (
        <DashboardEmptyState onRefresh={refresh} />
      ) : (
        <>
          <DashboardStats summary={data} />
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            <div className="space-y-6 xl:col-span-2">
              <ProjectOverview projects={data.projects} />
              <MyTicketsPanel
                tickets={tickets.data}
                isLoading={tickets.isPending}
                error={tickets.error}
                onRetry={() => tickets.refetch()}
                isRetrying={tickets.isFetching}
              />
            </div>
            <div className="xl:sticky xl:top-24 xl:self-start">
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
          </div>
        </>
      )}
    </div>
  );
}
