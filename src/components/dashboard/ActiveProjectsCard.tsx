'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, ArrowUpRight } from 'lucide-react';
import { Card } from '@/components/ui';
import { ProjectSummary } from '@/types/dashboard';
import { dashboardRoutes } from '@/lib/dashboard/routes';

interface ActiveProjectsCardProps {
  projects?: ProjectSummary[];
}

interface ProjectDisplayRow {
  name: string;
  slug: string;
  pods: string[];
  progress: number;
  targetDate: string;
  priority: 'High' | 'Critical' | 'Normal';
  priorityClass: string;
}

const DEFAULT_ROWS: ProjectDisplayRow[] = [
  {
    name: 'Wrkld Core Platform',
    slug: 'wrkld-core',
    pods: ['FE', 'BE'],
    progress: 78,
    targetDate: '15 Dec 2026',
    priority: 'High',
    priorityClass: 'bg-blue-600 text-white',
  },
  {
    name: 'Real-time Kanban Sync',
    slug: 'kanban-sync',
    pods: ['FE', 'INT'],
    progress: 45,
    targetDate: '22 Dec 2026',
    priority: 'Critical',
    priorityClass: 'bg-rose-100 text-rose-600 border border-rose-200',
  },
  {
    name: 'Analytics & Telemetry',
    slug: 'wrkld',
    pods: ['BE', 'QA'],
    progress: 90,
    targetDate: '10 Dec 2026',
    priority: 'Normal',
    priorityClass: 'bg-blue-100 text-blue-700 border border-blue-200',
  },
];

export const ActiveProjectsCard: React.FC<ActiveProjectsCardProps> = ({ projects }) => {
  const [sprintFilter] = useState('Current Sprint');

  // Merge projects from props with the visual layout
  const rows = React.useMemo(() => {
    if (!projects || projects.length === 0) return DEFAULT_ROWS;
    return projects.slice(0, 3).map((p, idx) => {
      const fallback = DEFAULT_ROWS[idx] || DEFAULT_ROWS[0];
      return {
        name: p.name || fallback.name,
        slug: p.slug || fallback.slug,
        pods: fallback.pods,
        progress: p.progress ?? fallback.progress,
        targetDate: fallback.targetDate,
        priority: fallback.priority,
        priorityClass: fallback.priorityClass,
      };
    });
  }, [projects]);

  return (
    <Card className="flex flex-col p-5 bg-white border border-slate-200/80 rounded-2xl shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
        <h3 className="text-base font-semibold tracking-tight text-slate-900">
          Active Projects
        </h3>

        {/* Sprint Filter Dropdown matching screenshot */}
        <div className="relative">
          <Link
            href="/sprints"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
          >
            <span>{sprintFilter}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </Link>
        </div>
      </div>

      {/* Table matching screenshot */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-[11px] font-semibold text-slate-400 border-b border-slate-100">
              <th className="pb-2.5 font-medium">Project Name</th>
              <th className="pb-2.5 font-medium">Pods</th>
              <th className="pb-2.5 font-medium">Progress</th>
              <th className="pb-2.5 font-medium">Target Date</th>
              <th className="pb-2.5 text-right font-medium pr-1">Priority</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {rows.map((row) => (
              <tr key={row.name} className="hover:bg-slate-50/70 transition-colors group">
                {/* Project Name */}
                <td className="py-3 pr-2">
                  <Link
                    href={dashboardRoutes.analytics(row.slug)}
                    className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors flex items-center gap-1"
                  >
                    <span>{row.name}</span>
                    <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </td>

                {/* Pods Pills */}
                <td className="py-3">
                  <div className="flex items-center gap-1">
                    {row.pods.map((pod) => (
                      <span
                        key={pod}
                        className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 border border-blue-100"
                      >
                        {pod}
                      </span>
                    ))}
                  </div>
                </td>

                {/* Progress Bar with Percentage */}
                <td className="py-3 w-32">
                  <div className="space-y-1">
                    <span className="text-[11px] font-semibold text-slate-800">{row.progress}%</span>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 rounded-full"
                        style={{ width: `${row.progress}%` }}
                      />
                    </div>
                  </div>
                </td>

                {/* Target Date */}
                <td className="py-3 text-slate-600 font-medium">
                  {row.targetDate}
                </td>

                {/* Priority Badge */}
                <td className="py-3 text-right pr-1">
                  <span
                    className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full ${row.priorityClass}`}
                  >
                    {row.priority}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
