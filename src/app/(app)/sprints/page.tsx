'use client';

import React from 'react';
import Link from 'next/link';
import { Calendar, FolderKanban, ArrowRight, Target } from 'lucide-react';
import { PageHeader, Card, Button, StatusBadge } from '@/components/ui';
import { INITIAL_SPRINTS } from '@/services/fixtures/sprints';

export default function SprintsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Sprints Overview"
        description="Sprint cycles, iteration timelines, and delivery goals across active projects."
        badge={<StatusBadge status="active">Active Sprint Cycle</StatusBadge>}
        breadcrumbs={[
          { label: 'Home', href: '/dashboard' },
          { label: 'Sprints' },
        ]}
        actions={
          <Link href="/projects/wrkld">
            <Button variant="primary" size="sm" leftIcon={<FolderKanban className="w-4 h-4" />}>
              Open Project Sprints
            </Button>
          </Link>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {INITIAL_SPRINTS.map((sprint) => {
          const projectSlug = sprint.projectId === 'wrkld-core' ? 'wrkld' : sprint.projectId;
          const projectName =
            sprint.projectId === 'wrkld-core'
              ? 'Wrkld Platform'
              : sprint.projectId === 'kanban-sync'
              ? 'Kanban Sync'
              : sprint.projectId;

          return (
            <Card
              key={sprint.id}
              className="p-6 flex flex-col justify-between hover:shadow-md transition-shadow space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[11px] font-mono font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    {projectName}
                  </span>
                  <StatusBadge status={sprint.status === 'in-progress' ? 'active' : sprint.status}>
                    {sprint.status}
                  </StatusBadge>
                </div>

                <h3 className="text-base font-bold text-slate-900 leading-snug">{sprint.name}</h3>

                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>
                    {sprint.startDate} to {sprint.endDate}
                  </span>
                </div>

                {sprint.goal && (
                  <div className="flex items-start gap-2 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <Target className="w-3.5 h-3.5 text-[#5851d8] shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{sprint.goal}</span>
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] font-mono text-slate-400">{sprint.id}</span>
                <Link
                  href={`/projects/${projectSlug}`}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#5851d8] hover:text-[#4a43c4] hover:underline"
                >
                  <span>View in Project</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
