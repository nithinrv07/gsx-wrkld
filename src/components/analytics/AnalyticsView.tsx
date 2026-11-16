'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useIsFetching } from '@tanstack/react-query';
import { BarChart2, LayoutGrid, RotateCw } from 'lucide-react';
import { Button, EmptyState, PageHeader, StatusBadge } from '@/components/ui';
import { PodCode, TicketStatus } from '@/types/dashboard';
import { POD_CODES, POD_META, PROJECT_STATUS_BADGE } from '@/lib/dashboard/meta';
import { dashboardRoutes } from '@/lib/dashboard/routes';
import { dashboardKeys, useDashboardSummary, useRefreshDashboard } from '@/lib/dashboard/queries';
import { useViewer } from '@/lib/dashboard/viewer';
import { DashboardError } from '@/components/dashboard/DashboardStates';
import { ProjectProgressSection, ProjectProgressSkeleton } from './ProjectProgressSection';
import { ProjectTicketsTable } from './ProjectTicketsTable';

const selectCls =
  'h-10 rounded-xl border border-slate-200/90 bg-white px-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-[#5851d8] cursor-pointer';

export function AnalyticsView() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const { status: sessionStatus } = useViewer();
  const summary = useDashboardSummary();
  const refresh = useRefreshDashboard();
  const isFetching = useIsFetching({ queryKey: dashboardKeys.all }) > 0;
  const [status, setStatus] = useState<TicketStatus | undefined>();

  useEffect(() => {
    if (sessionStatus === 'signed-out') router.replace(dashboardRoutes.signIn);
  }, [sessionStatus, router]);

  const projects = summary.data?.projects ?? [];
  const requested = params.get('project');
  const project =
    projects.find((p) => p.slug === requested) ??
    projects.find((p) => p.status !== 'completed') ??
    projects[0];
  const podParam = params.get('pod') as PodCode | null;
  const pod = podParam && POD_CODES.includes(podParam) ? podParam : undefined;

  const setFilter = (next: { project?: string; pod?: PodCode | '' }) => {
    const q = new URLSearchParams(params.toString());
    if (next.project !== undefined) q.set('project', next.project);
    if (next.pod !== undefined) {
      if (next.pod) q.set('pod', next.pod);
      else q.delete('pod');
    }
    setStatus(undefined);
    router.replace(`${pathname}?${q.toString()}`, { scroll: false });
  };

  const header = (
    <PageHeader
      title="Project progress analytics"
      description="Overall and pod-wise progress with ticket counts across the lifecycle."
      breadcrumbs={[{ label: 'Dashboard', href: dashboardRoutes.dashboard }, { label: 'Analytics' }]}
      badge={
        project && (
          <StatusBadge status={PROJECT_STATUS_BADGE[project.status].status}>
            {PROJECT_STATUS_BADGE[project.status].label}
          </StatusBadge>
        )
      }
      actions={
        <Button variant="secondary" onClick={refresh} isLoading={isFetching} leftIcon={<RotateCw className="h-4 w-4" />}>
          Refresh
        </Button>
      }
    />
  );

  if (summary.isPending)
    return (
      <div className="space-y-6">
        {header}
        <ProjectProgressSkeleton />
      </div>
    );
  if (summary.isError)
    return (
      <div className="space-y-6">
        {header}
        <DashboardError message={summary.error.message} onRetry={() => summary.refetch()} isRetrying={summary.isFetching} />
      </div>
    );
  if (!project)
    return (
      <div className="space-y-6">
        {header}
        <EmptyState
          icon={BarChart2}
          title="No projects to analyse"
          description="Progress analytics appear once you're added to a project."
          action={
            <Link href={dashboardRoutes.dashboard}>
              <Button size="sm" variant="secondary">
                Back to dashboard
              </Button>
            </Link>
          }
        />
      </div>
    );

  return (
    <div className="space-y-6">
      {header}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <select
          aria-label="Select project"
          className={`${selectCls} sm:min-w-56`}
          value={project.slug}
          onChange={(e) => setFilter({ project: e.target.value, pod: '' })}
        >
          {projects.map((p) => (
            <option key={p.slug} value={p.slug}>
              {p.name}
            </option>
          ))}
        </select>
        <select
          aria-label="Filter by pod"
          className={selectCls}
          value={pod ?? ''}
          onChange={(e) => setFilter({ pod: e.target.value as PodCode | '' })}
        >
          <option value="">All pods</option>
          {POD_CODES.map((c) => (
            <option key={c} value={c}>
              {POD_META[c].name} ({c})
            </option>
          ))}
        </select>
        <Link
          href={dashboardRoutes.podBoard(project.slug, pod ?? 'FE')}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[#5851d8] hover:underline sm:ml-auto"
        >
          <LayoutGrid className="h-3.5 w-3.5" />
          {pod ? `Open ${POD_META[pod].name} pod board` : 'Open pod boards'}
        </Link>
      </div>

      <ProjectProgressSection
        slug={project.slug}
        pod={pod}
        hrefForPod={(p) => dashboardRoutes.analytics(project.slug, p === pod ? undefined : p)}
        selectedStatus={status}
        onSelectStatus={setStatus}
      />

      <ProjectTicketsTable slug={project.slug} pod={pod} status={status} onStatusChange={setStatus} />
    </div>
  );
}
