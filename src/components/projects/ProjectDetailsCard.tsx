'use client';

import React from 'react';
import { Calendar, Hash, FileText } from 'lucide-react';
import { Project } from '@/types';
import { Card, CardHeader, CardTitle, CardContent, StatusBadge } from '@/components/ui';

export interface ProjectDetailsCardProps {
  project: Project;
}

export const ProjectDetailsCard: React.FC<ProjectDetailsCardProps> = ({ project }) => {
  const formattedTargetDate = React.useMemo(() => {
    try {
      const date = new Date(project.targetDate);
      return date.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return project.targetDate;
    }
  }, [project.targetDate]);

  const daysRemaining = React.useMemo(() => {
    try {
      const target = new Date(project.targetDate).getTime();
      const now = new Date().getTime();
      const diffDays = Math.ceil((target - now) / (1000 * 60 * 60 * 24));
      if (diffDays < 0) return `${Math.abs(diffDays)} days overdue`;
      if (diffDays === 0) return 'Due today';
      return `${diffDays} days remaining`;
    } catch {
      return null;
    }
  }, [project.targetDate]);

  return (
    <Card className="border-slate-200/90 shadow-xs">
      <CardHeader className="pb-3 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-bold text-slate-900">
            Project Overview & Metadata
          </CardTitle>
          <StatusBadge status={project.status} size="sm" />
        </div>
      </CardHeader>
      <CardContent className="p-5 sm:p-6 space-y-6">
        {/* Description */}
        {project.description && (
          <div className="space-y-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" /> Scope & Objectives
            </span>
            <p className="text-sm text-slate-600 leading-relaxed bg-slate-50/70 p-3.5 rounded-xl border border-slate-100">
              {project.description}
            </p>
          </div>
        )}

        {/* Metadata Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Project Lead */}
          <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#5851d8] to-purple-400 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
              {project.projectLead.initials}
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
                Project Lead
              </span>
              <p className="text-sm font-semibold text-slate-900 truncate">
                {project.projectLead.name}
              </p>
              <p className="text-xs text-slate-500 truncate">
                {project.projectLead.email}
              </p>
            </div>
          </div>

          {/* Target Milestone Date */}
          <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
                Target Completion
              </span>
              <p className="text-sm font-semibold text-slate-900 truncate">
                {formattedTargetDate}
              </p>
              {daysRemaining && (
                <p className="text-xs text-slate-500 font-medium">
                  {daysRemaining}
                </p>
              )}
            </div>
          </div>

          {/* Slug & Routing */}
          <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-[#5851d8] flex items-center justify-center shrink-0">
              <Hash className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
                Route Identifier
              </span>
              <p className="text-sm font-mono font-semibold text-slate-800 truncate">
                /{project.slug}
              </p>
              <p className="text-xs text-slate-400 truncate">
                ID: {project.id}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
