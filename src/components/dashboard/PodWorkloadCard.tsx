'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui';
import { Ticket } from '@/types/dashboard';
import { dashboardRoutes } from '@/lib/dashboard/routes';

interface PodWorkloadCardProps {
  blockers?: Ticket[];
}

interface PodRow {
  name: string;
  lead: string;
  percentage: number;
}

const POD_ROWS: PodRow[] = [
  { name: 'Frontend Pod', lead: 'Nithyasri R', percentage: 85 },
  { name: 'Backend Pod', lead: 'Arun K', percentage: 72 },
  { name: 'Integration Pod', lead: 'Divya R', percentage: 94 },
  { name: 'QA Pod', lead: 'Edwin A', percentage: 60 },
];

export const PodWorkloadCard: React.FC<PodWorkloadCardProps> = ({ blockers }) => {
  const [filter] = useState('All Pods');

  return (
    <Card className="flex flex-col p-5 bg-white border border-slate-200/80 rounded-2xl shadow-xs justify-between">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
        <h3 className="text-base font-semibold tracking-tight text-slate-900">
          Pod Workload & Capacity
        </h3>

        {/* Filter dropdown matching screenshot */}
        <Link
          href="/pods"
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
        >
          <span>{filter}</span>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        </Link>
      </div>

      {/* Pod Workload Bars matching screenshot */}
      <div className="space-y-3.5">
        {POD_ROWS.map((pod) => (
          <div key={pod.name} className="flex items-center justify-between gap-3 text-xs">
            <span className="font-semibold text-slate-900 min-w-[95px]">{pod.name}</span>
            <span className="text-[11px] text-slate-400 min-w-[90px]">Lead: {pod.lead}</span>
            <div className="flex-1 flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full transition-all duration-500"
                  style={{ width: `${pod.percentage}%` }}
                />
              </div>
              <span className="text-[11px] font-bold text-slate-800 w-8 text-right">
                {pod.percentage}%
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Blocker alert preview (ensuring test assertions match blockers) */}
      {blockers && blockers.length > 0 && (
        <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-rose-600 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" /> Active Blockers ({blockers.length})
          </p>
          <div className="space-y-1">
            {blockers.map((b) => (
              <Link
                key={b.key}
                href={dashboardRoutes.ticket(b)}
                className="flex items-center justify-between text-[11px] text-slate-700 hover:text-rose-600 truncate py-0.5"
              >
                <span className="truncate">{b.title}</span>
                <span className="text-[9px] font-bold uppercase text-rose-600 bg-rose-50 px-1.5 py-0.2 rounded ml-2 shrink-0">
                  {b.severity}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};
