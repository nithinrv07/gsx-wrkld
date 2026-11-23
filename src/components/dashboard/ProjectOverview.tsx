'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { FolderKanban, LayoutGrid, Table, ArrowUpRight, BarChart3 } from 'lucide-react';
import { Card, ProgressBar, StatusBadge } from '@/components/ui';
import { ProjectSummary } from '@/types/dashboard';
import { PROJECT_STATUS_BADGE } from '@/lib/dashboard/meta';
import { dashboardRoutes } from '@/lib/dashboard/routes';
import { PanelEmpty, PanelHeader, InitialsAvatar } from './primitives';
import { ProjectSummaryCard } from './ProjectSummaryCard';

type Filter = 'all' | 'open' | 'completed';
type ViewMode = 'table' | 'cards';

// Mock pod associations for preview table display
const PROJECT_PODS: Record<string, string[]> = {
  wrkld: ['FE', 'BE', 'INT'],
  'wrkld-core': ['FE', 'BE', 'INT'],
  'kanban-sync': ['FE', 'INT'],
  'analytics-engine': ['BE', 'QA'],
  'auth-service': ['BE'],
};

export const ProjectOverview: React.FC<{ projects: ProjectSummary[] }> = ({ projects }) => {
  const [filter, setFilter] = useState<Filter>('open');
  const [viewMode, setViewMode] = useState<ViewMode>('table');

  const shown = useMemo(
    () =>
      projects.filter((p) =>
        filter === 'all' ? true : filter === 'completed' ? p.status === 'completed' : p.status !== 'completed'
      ),
    [projects, filter]
  );

  return (
    <Card id="project-overview" className="scroll-mt-24 bg-white border border-slate-200/80 rounded-2xl shadow-xs">
      <PanelHeader
        title="Project overview"
        subtitle="Projects and delivery status"
        count={projects.length}
        actions={
          projects.length > 0 && (
            <div className="flex items-center gap-2">
              {/* Filter tabs */}
              <div role="group" aria-label="Filter projects" className="flex rounded-lg bg-slate-100 p-0.5 text-xs">
                {(['open', 'completed', 'all'] as Filter[]).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    aria-pressed={filter === f}
                    className={`cursor-pointer rounded-md px-2.5 py-1 capitalize transition-colors ${
                      filter === f ? 'bg-white font-semibold text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>

              {/* View Mode Toggle */}
              <div className="hidden sm:flex rounded-lg bg-slate-100 p-0.5 text-xs">
                <button
                  type="button"
                  onClick={() => setViewMode('table')}
                  title="Table view"
                  className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                    viewMode === 'table' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-400 hover:text-slate-700'
                  }`}
                >
                  <Table className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('cards')}
                  title="Card view"
                  className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                    viewMode === 'cards' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-400 hover:text-slate-700'
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )
        }
      />

      {projects.length === 0 ? (
        <PanelEmpty
          icon={<FolderKanban className="h-5 w-5" />}
          title="You're not on any projects yet"
          description="When a project lead adds you to a project, it will appear here with its status and progress."
        />
      ) : shown.length === 0 ? (
        <PanelEmpty
          icon={<FolderKanban className="h-5 w-5" />}
          title={`No ${filter} projects`}
          description="Try another filter to see the rest of your projects."
        />
      ) : viewMode === 'table' ? (
        /* Clean SaaS Table View matching Reference */
        <div className="overflow-x-auto px-5 pb-5">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <th className="pb-3 pl-2 font-medium">Project Name</th>
                <th className="pb-3 font-medium">Pods</th>
                <th className="pb-3 font-medium">Progress</th>
                <th className="pb-3 font-medium">Lead</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 pr-2 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {shown.map((p) => {
                const badge = PROJECT_STATUS_BADGE[p.status];
                const pods = PROJECT_PODS[p.slug] || ['FE', 'BE'];
                const variant =
                  p.status === 'completed' ? 'emerald' : p.status === 'blocked' ? 'rose' : 'brand';

                return (
                  <tr key={p.slug} className="hover:bg-slate-50/80 transition-colors group">
                    {/* Name */}
                    <td className="py-3.5 pl-2">
                      <Link
                        href={dashboardRoutes.project(p.slug)}
                        className="font-semibold text-slate-900 group-hover:text-[#5851d8] flex items-center gap-1.5 transition-colors"
                      >
                        <span>{p.name}</span>
                        <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                      <span className="text-[11px] text-slate-400 font-mono">/{p.slug}</span>
                    </td>

                    {/* Pods */}
                    <td className="py-3.5">
                      <div className="flex items-center gap-1">
                        {pods.map((pod) => (
                          <span
                            key={pod}
                            className="inline-block text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-bold"
                          >
                            {pod}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Progress */}
                    <td className="py-3.5 w-44">
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] font-medium text-slate-700">
                          <span>{p.progress}%</span>
                          <span className="text-slate-400">{p.myTicketCount} assigned</span>
                        </div>
                        <ProgressBar value={p.progress} size="sm" variant={variant} />
                      </div>
                    </td>

                    {/* Lead */}
                    <td className="py-3.5">
                      {p.lead ? (
                        <div className="flex items-center gap-2">
                          <InitialsAvatar initials={p.lead.initials} title={p.lead.name} />
                          <span className="text-slate-800 font-medium">{p.lead.name}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400">Unassigned</span>
                      )}
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5">
                      <StatusBadge status={badge.status} size="sm">
                        {badge.label}
                      </StatusBadge>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 pr-2 text-right">
                      <div className="flex items-center justify-end gap-2 text-xs">
                        <Link
                          href={dashboardRoutes.project(p.slug)}
                          className="p-1 rounded text-slate-400 hover:text-[#5851d8] hover:bg-indigo-50 transition-colors"
                          title="View progress"
                        >
                          <BarChart3 className="w-4 h-4" />
                        </Link>
                        <Link
                          href={dashboardRoutes.podBoard(p.slug, 'FE')}
                          className="p-1 rounded text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                          title="Pod boards"
                        >
                          <LayoutGrid className="w-4 h-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        /* Card Grid View */
        <div className="grid grid-cols-1 gap-4 px-5 pb-5 md:grid-cols-2">
          {shown.map((p) => (
            <ProjectSummaryCard key={p.slug} project={p} />
          ))}
        </div>
      )}
    </Card>
  );
};
