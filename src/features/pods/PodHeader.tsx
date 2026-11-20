'use client';

import React from 'react';
import { Pod } from '@/types/auth-pod';
import { UserCheck, Users } from 'lucide-react';

interface PodHeaderProps {
  pod: Pod;
}

const POD_TYPE_COLORS: Record<string, string> = {
  FE: 'bg-blue-50 text-blue-700 border-blue-200',
  BE: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  INT: 'bg-purple-50 text-purple-700 border-purple-200',
  QA: 'bg-amber-50 text-amber-700 border-amber-200',
};

export const PodHeader: React.FC<PodHeaderProps> = ({ pod }) => {
  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span
            className={`px-3 py-1 rounded-lg text-xs font-semibold border ${
              POD_TYPE_COLORS[pod.type] || 'bg-slate-100 text-slate-700 border-slate-200'
            }`}
          >
            {pod.type} Pod
          </span>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">{pod.name}</h2>
        </div>

        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2 text-slate-500">
            <UserCheck className="w-4 h-4 text-[#5851d8]" />
            <span>Lead:</span>
            <span className="text-slate-900 font-semibold">
              {pod.leadName || 'Unassigned'}
            </span>
          </div>

          <div className="flex items-center gap-2 text-slate-500">
            <Users className="w-4 h-4 text-slate-400" />
            <span>Members:</span>
            <span className="text-slate-900 font-semibold">{pod.memberCount}</span>
          </div>
        </div>
      </div>
    </div>
  );
};