import React from 'react';
import Link from 'next/link';
import { ArrowUpRight, BarChart3, LayoutGrid, Ticket } from 'lucide-react';
import { Card, ProgressBar, StatusBadge } from '@/components/ui';
import { ProjectSummary } from '@/types/dashboard';
import { PROJECT_STATUS_BADGE } from '@/lib/dashboard/meta';
import { dashboardRoutes } from '@/lib/dashboard/routes';
import { InitialsAvatar } from './primitives';

const accent: Record<ProjectSummary['status'], string> = {
  planning: 'border-l-sky-400',
  active: 'border-l-[#5851d8]',
  'in-progress': 'border-l-blue-500',
  blocked: 'border-l-rose-500',
  completed: 'border-l-emerald-500',
};

export const ProjectSummaryCard: React.FC<{ project: ProjectSummary }> = ({ project }) => {
  const badge = PROJECT_STATUS_BADGE[project.status];
  const variant =
    project.status === 'completed' ? 'emerald' : project.status === 'blocked' ? 'rose' : 'brand';

  return (
    <Card hoverable className={`flex h-full flex-col border-l-4 ${accent[project.status]}`}>
      <div className="flex flex-1 flex-col gap-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <Link
            href={dashboardRoutes.analytics(project.slug)}
            className="group min-w-0 focus:outline-none focus-visible:underline"
          >
            <h3 className="flex items-center gap-1 truncate font-semibold text-slate-900 group-hover:text-[#5851d8]">
              {project.name}
              <ArrowUpRight className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
            </h3>
          </Link>
          <StatusBadge status={badge.status} size="sm">
            {badge.label}
          </StatusBadge>
        </div>

        <ProgressBar value={project.progress} showValue label="Overall completion" size="sm" variant={variant} />

        <div className="mt-auto flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
          {project.lead ? (
            <span className="flex items-center gap-2">
              <InitialsAvatar initials={project.lead.initials} title={project.lead.name} />
              <span>
                <span className="block text-[10px] uppercase tracking-wide text-slate-400">Project lead</span>
                {project.lead.name}
              </span>
            </span>
          ) : (
            <span className="text-slate-400">No lead assigned</span>
          )}
          <span className="inline-flex items-center gap-1.5" title="Open tickets assigned to you">
            <Ticket className="h-3.5 w-3.5" /> {project.myTicketCount} assigned to you
          </span>
        </div>
      </div>
      <div className="flex items-center justify-between border-t border-slate-100 px-5 py-2.5 text-xs">
        <Link
          href={dashboardRoutes.analytics(project.slug)}
          className="inline-flex items-center gap-1 font-medium text-[#5851d8] hover:underline"
        >
          <BarChart3 className="h-3.5 w-3.5" /> View progress
        </Link>
        <Link
          href={dashboardRoutes.podBoard(project.slug, 'FE')}
          className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-800"
        >
          <LayoutGrid className="h-3.5 w-3.5" /> Pod boards
        </Link>
      </div>
    </Card>
  );
};
