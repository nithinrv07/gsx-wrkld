'use client';

import React from 'react';
import { Calendar, Zap, Target } from 'lucide-react';
import { Sprint } from '@/types';
import { StatusBadge } from '@/components/ui';

export interface SprintItemProps {
  sprint: Sprint;
}

export const SprintItem: React.FC<SprintItemProps> = ({ sprint }) => {
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const durationDays = React.useMemo(() => {
    try {
      const start = new Date(sprint.startDate).getTime();
      const end = new Date(sprint.endDate).getTime();
      const days = Math.round((end - start) / (1000 * 60 * 60 * 24));
      return days > 0 ? `${days} days` : null;
    } catch {
      return null;
    }
  }, [sprint.startDate, sprint.endDate]);

  const isActive = sprint.status === 'active';

  return (
    <div
      className={`p-4 sm:p-5 rounded-2xl border transition-all duration-150 ${
        isActive
          ? 'bg-indigo-50/30 border-indigo-200/90 shadow-xs'
          : 'bg-white border-slate-200/80 hover:border-slate-300/80 shadow-2xs'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        {/* Left: Icon + Title + Goal */}
        <div className="flex items-start gap-3.5 min-w-0">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              isActive
                ? 'bg-gradient-to-tr from-[#5851d8] to-indigo-500 text-white shadow-xs'
                : 'bg-slate-100 text-slate-500'
            }`}
          >
            <Zap className="w-5 h-5" />
          </div>

          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-sm sm:text-base font-semibold text-slate-900 tracking-tight">
                {sprint.name}
              </h4>
              <StatusBadge status={sprint.status} size="sm" />
            </div>

            {sprint.goal && (
              <p className="text-xs text-slate-500 line-clamp-2 flex items-center gap-1.5 pt-0.5">
                <Target className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{sprint.goal}</span>
              </p>
            )}
          </div>
        </div>

        {/* Right: Date Range & Duration */}
        <div className="flex items-center sm:flex-col sm:items-end justify-between sm:justify-center gap-1 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-700">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>
              {formatDate(sprint.startDate)} &ndash; {formatDate(sprint.endDate)}
            </span>
          </div>
          {durationDays && (
            <span className="text-[11px] font-medium text-slate-400">
              Duration: {durationDays}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

