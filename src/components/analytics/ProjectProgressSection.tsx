'use client';

import React from 'react';
import { PodCode, TicketStatus } from '@/types/dashboard';
import { POD_META } from '@/lib/dashboard/meta';
import { can } from '@/lib/dashboard/permissions';
import { useCurrentRole, useProjectAnalytics } from '@/lib/dashboard/queries';
import { DashboardProviders } from '@/components/dashboard/DashboardProviders';
import { PanelError, SkeletonBlock } from '@/components/dashboard/primitives';
import { Card } from '@/components/ui';
import { RollUpProgress } from './RollUpProgress';
import { PodProgressBars } from './PodProgressBars';
import { TicketStatusBreakdown } from './TicketStatusBreakdown';

export interface ProjectProgressSectionProps {
  slug: string;
  /** Focus on a single pod: roll-up and breakdown switch to that pod's figures. */
  pod?: PodCode;
  hrefForPod?: (pod: PodCode) => string;
  selectedStatus?: TicketStatus;
  onSelectStatus?: (status: TicketStatus | undefined) => void;
}

export const ProjectProgressSkeleton: React.FC = () => (
  <div className="space-y-6" aria-busy="true" aria-label="Loading progress">
    <SkeletonBlock className="h-40 rounded-2xl" />
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
      <SkeletonBlock className="h-80 rounded-2xl" />
      <SkeletonBlock className="h-80 rounded-2xl" />
    </div>
  </div>
);

/**
 * Overall progress, pod-wise progress and status breakdown for one project.
 * Used on /analytics and intended for the Progress section of /projects/[slug].
 * Must be rendered inside a TanStack QueryClientProvider — use
 * `StandaloneProjectProgress` where none exists.
 */
export const ProjectProgressSection: React.FC<ProjectProgressSectionProps> = ({
  slug,
  pod,
  hrefForPod,
  selectedStatus,
  onSelectStatus,
}) => {
  const [role] = useCurrentRole();
  const query = useProjectAnalytics(slug);

  if (query.isPending) return <ProjectProgressSkeleton />;
  if (query.isError)
    return (
      <Card className="pt-5">
        <PanelError message={query.error.message} onRetry={() => query.refetch()} isRetrying={query.isFetching} />
      </Card>
    );

  const project = query.data;
  const focus = pod ? project.pods.find((p) => p.pod === pod) : undefined;

  return (
    <div className="space-y-6">
      <RollUpProgress
        title={focus ? `${POD_META[focus.pod].name} pod progress` : 'Overall project progress'}
        progress={focus ? focus.progress : project.progress}
        statusCounts={focus ? focus.statusCounts : project.statusCounts}
        caption={focus ? `${project.name} · filtered to one pod` : project.name}
      />
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <PodProgressBars
          pods={project.pods}
          showLeads={can(role, 'analytics:view-pod-leads')}
          selectedPod={pod}
          hrefForPod={hrefForPod}
        />
        <TicketStatusBreakdown
          statusCounts={focus ? focus.statusCounts : project.statusCounts}
          subtitle={focus ? `${POD_META[focus.pod].name} pod tickets by status` : 'All tickets in this project'}
          selected={selectedStatus}
          onSelect={onSelectStatus}
        />
      </div>
    </div>
  );
};

/** Drop-in version that brings its own query provider (e.g. for the Projects page). */
export const StandaloneProjectProgress: React.FC<ProjectProgressSectionProps> = (props) => (
  <DashboardProviders>
    <ProjectProgressSection {...props} />
  </DashboardProviders>
);
