'use client';

import React, { useMemo, useState } from 'react';
import { FolderKanban } from 'lucide-react';
import { Card } from '@/components/ui';
import { ProjectSummary } from '@/types/dashboard';
import { PanelEmpty, PanelHeader } from './primitives';
import { ProjectSummaryCard } from './ProjectSummaryCard';

type Filter = 'all' | 'open' | 'completed';

export const ProjectOverview: React.FC<{ projects: ProjectSummary[] }> = ({ projects }) => {
  const [filter, setFilter] = useState<Filter>('open');

  const shown = useMemo(
    () =>
      projects.filter((p) =>
        filter === 'all' ? true : filter === 'completed' ? p.status === 'completed' : p.status !== 'completed'
      ),
    [projects, filter]
  );

  return (
    <Card id="project-overview" className="scroll-mt-24">
      <PanelHeader
        title="Project overview"
        subtitle="Projects you belong to"
        count={projects.length}
        actions={
          projects.length > 0 && (
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
      ) : (
        <div className="grid grid-cols-1 gap-4 px-5 pb-5 md:grid-cols-2">
          {shown.map((p) => (
            <ProjectSummaryCard key={p.slug} project={p} />
          ))}
        </div>
      )}
    </Card>
  );
};
