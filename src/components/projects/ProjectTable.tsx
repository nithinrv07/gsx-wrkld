'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, ChevronRight } from 'lucide-react';
import { Project } from '@/types';
import { DataTable, Column, StatusBadge } from '@/components/ui';

export interface ProjectTableProps {
  projects: Project[];
  isLoading?: boolean;
}

export const ProjectTable: React.FC<ProjectTableProps> = ({
  projects,
  isLoading = false,
}) => {
  const router = useRouter();

  const columns: Column<Project>[] = [
    {
      key: 'name',
      header: 'Project Name',
      render: (project) => (
        <div className="flex flex-col py-0.5">
          <span className="font-semibold text-slate-900 hover:text-[#5851d8] transition-colors">
            {project.name}
          </span>
          <span className="font-mono text-[11px] text-slate-400 font-medium">
            /{project.slug}
          </span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      width: '140px',
      render: (project) => <StatusBadge status={project.status} size="sm" />,
    },
    {
      key: 'projectLead',
      header: 'Project Lead',
      width: '200px',
      render: (project) => (
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#5851d8] to-purple-400 text-white flex items-center justify-center font-semibold text-[10px] shrink-0">
            {project.projectLead.initials}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-medium text-slate-800 truncate">
              {project.projectLead.name}
            </span>
            <span className="text-[10px] text-slate-400 truncate">
              {project.projectLead.email}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: 'targetDate',
      header: 'Target Date',
      width: '160px',
      render: (project) => {
        try {
          const date = new Date(project.targetDate);
          const formatted = date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          });
          return (
            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{formatted}</span>
            </div>
          );
        } catch {
          return <span className="text-xs text-slate-600">{project.targetDate}</span>;
        }
      },
    },
    {
      key: 'actions',
      header: '',
      width: '60px',
      align: 'right',
      render: () => (
        <div className="flex justify-end text-slate-400 hover:text-[#5851d8] transition-colors">
          <ChevronRight className="w-4 h-4" />
        </div>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={projects}
      keyExtractor={(item) => item.id}
      isLoading={isLoading}
      emptyMessage="No matching projects found."
      onRowClick={(project) => router.push(`/projects/${project.slug}`)}
    />
  );
};

