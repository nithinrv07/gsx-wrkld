'use client';

import React from 'react';
import { Pod } from '@/types/auth-pod';
import { UserCheck, Users } from 'lucide-react';

interface PodHeaderProps {
  pod: Pod;
}

const POD_TYPE_COLORS: Record<string, string> = {
  FE: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  BE: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  INT: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
  QA: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
};

export const PodHeader: React.FC<PodHeaderProps> = ({ pod }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-md space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span
            className={`px-3 py-1 rounded-md text-xs font-semibold border ${
              POD_TYPE_COLORS[pod.type] || 'bg-slate-800 text-slate-300'
            }`}
          >
            {pod.type} Pod
          </span>
          <h2 className="text-xl font-bold text-white tracking-tight">{pod.name}</h2>
        </div>

        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2 text-slate-400">
            <UserCheck className="w-4 h-4 text-indigo-400" />
            <span>Lead:</span>
            <span className="text-slate-200 font-medium">
              {pod.leadName || 'Unassigned'}
            </span>
          </div>

          <div className="flex items-center gap-2 text-slate-400">
            <Users className="w-4 h-4 text-slate-400" />
            <span>Members:</span>
            <span className="text-slate-200 font-medium">{pod.memberCount}</span>
          </div>
        </div>
      </div>
    </div>
  );
};