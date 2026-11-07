'use client';

import React from 'react';
import Link from 'next/link';
import { Calendar, ArrowUpRight, FolderKanban } from 'lucide-react';
import { Project } from '@/types';
import { Card, CardContent, StatusBadge } from '@/components/ui';

export interface ProjectCardProps {
  project: Project;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  // Format target date
  const formattedDate = React.useMemo(() => {
    try {
      const date = new Date(project.targetDate);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return project.targetDate;
    }
  }, [project.targetDate]);

  return (
    <Link href={`/projects/${project.slug}`} className="block group h-full">
      <Card
        hoverable
        className="h-full flex flex-col justify-between transition-all duration-200 border-slate-200/90 group-hover:border-indigo-200"
      >
        <CardContent className="p-5 flex-1 flex flex-col justify-between space-y-4">
          {/* Top Row: Icon + Status */}
          <div className="flex items-start justify-between gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50/80 border border-indigo-100 flex items-center justify-center text-[#5851d8] group-hover:scale-105 transition-transform shrink-0">
              <FolderKanban className="w-5 h-5" />
            </div>
            <StatusBadge status={project.status} size="sm" />
          </div>

          {/* Project Title & Slug */}
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center gap-1.5 justify-between">
              <h3 className="text-base font-semibold text-slate-900 group-hover:text-[#5851d8] transition-colors tracking-tight line-clamp-1">
                {project.name}
              </h3>
              <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-[#5851d8] transition-colors shrink-0" />
            </div>
            <p className="font-mono text-xs text-slate-400 font-medium">
              /{project.slug}
            </p>
            {project.description && (
              <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed pt-1">
                {project.description}
              </p>
            )}
          </div>

          {/* Meta Footer: Lead & Target Date */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 gap-2">
            {/* Project Lead */}
            <div className="flex items-center gap-2 min-w-0" title={`Lead: ${project.projectLead.name}`}>
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#5851d8] to-purple-400 text-white flex items-center justify-center font-semibold text-[10px] shrink-0">
                {project.projectLead.initials}
              </div>
              <span className="font-medium text-slate-700 truncate">
                {project.projectLead.name}
              </span>
            </div>

            {/* Target Date */}
            <div className="flex items-center gap-1 text-slate-400 shrink-0 font-medium text-[11px]">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{formattedDate}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};
