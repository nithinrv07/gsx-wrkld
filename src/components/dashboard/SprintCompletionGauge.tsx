'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowUpRight, Users2, ShieldCheck, Zap } from 'lucide-react';
import { Card } from '@/components/ui';

interface SprintCompletionGaugeProps {
  progress: number;
}

interface PodCapacity {
  code: string;
  name: string;
  lead: string;
  percentage: number;
  status: 'Optimal' | 'On Track' | 'Heavy Load' | 'Normal';
  color: string;
}

const POD_CAPACITIES: PodCapacity[] = [
  { code: 'FE', name: 'Frontend Pod', lead: 'Nithyasri R', percentage: 85, status: 'On Track', color: 'bg-blue-600' },
  { code: 'BE', name: 'Backend Pod', lead: 'Arun K', percentage: 72, status: 'Optimal', color: 'bg-emerald-600' },
  { code: 'INT', name: 'Integration Pod', lead: 'Divya R', percentage: 94, status: 'Heavy Load', color: 'bg-amber-500' },
  { code: 'QA', name: 'Quality Assurance', lead: 'Edwin A', percentage: 60, status: 'Normal', color: 'bg-indigo-600' },
];

export const SprintCompletionGauge: React.FC<SprintCompletionGaugeProps> = ({ progress = 78 }) => {
  const radius = 48;
  const strokeWidth = 10;
  const normalizedRadius = radius - strokeWidth / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <Card className="flex flex-col p-5 bg-white border border-slate-200/80 rounded-2xl shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <h3 className="text-base font-semibold tracking-tight text-slate-900">
            Sprint Progress & Pod Workload
          </h3>
          <p className="text-xs text-slate-500">Real-time sprint completion & pod capacity</p>
        </div>
        <Link
          href="/analytics"
          className="text-xs font-medium text-[#5851d8] hover:underline flex items-center gap-0.5"
        >
          Analytics <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center my-4">
        {/* Circular Progress Gauge */}
        <div className="md:col-span-2 flex flex-col items-center justify-center p-2">
          <div className="relative w-36 h-36 flex items-center justify-center">
            <svg height={radius * 2 * 1.5} width={radius * 2 * 1.5} className="rotate-[-90deg]">
              <defs>
                <linearGradient id="gaugeGradient" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#2563EB" />
                  <stop offset="100%" stopColor="#818CF8" />
                </linearGradient>
              </defs>
              {/* Background Track */}
              <circle
                stroke="#F1F5F9"
                fill="transparent"
                strokeWidth={strokeWidth}
                r={normalizedRadius * 1.4}
                cx={radius * 1.5}
                cy={radius * 1.5}
              />
              {/* Active Value Arc */}
              <circle
                stroke="url(#gaugeGradient)"
                fill="transparent"
                strokeWidth={strokeWidth}
                strokeDasharray={`${circumference * 1.4} ${circumference * 1.4}`}
                style={{ strokeDashoffset: strokeDashoffset * 1.4 }}
                strokeLinecap="round"
                r={normalizedRadius * 1.4}
                cx={radius * 1.5}
                cy={radius * 1.5}
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-3xl font-extrabold tracking-tight text-slate-900">{progress}%</span>
              <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400">Completed</span>
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 text-xs mt-2">
            <span className="flex items-center gap-1.5 text-slate-700">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600" /> Done ({progress}%)
            </span>
            <span className="flex items-center gap-1.5 text-slate-500">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-200" /> Pending ({100 - progress}%)
            </span>
          </div>
        </div>

        {/* Pod-wise Capacity Breakdown */}
        <div className="md:col-span-3 space-y-3 pl-0 md:pl-3 md:border-l border-slate-100">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            <span className="flex items-center gap-1.5">
              <Users2 className="w-3.5 h-3.5 text-slate-400" /> Pod Workload
            </span>
            <span>Capacity</span>
          </div>

          {POD_CAPACITIES.map((pod) => (
            <div key={pod.code} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-slate-800 flex items-center gap-1.5">
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-bold">
                    {pod.code}
                  </span>
                  <span>{pod.name}</span>
                </span>
                <span className="font-semibold text-slate-900">{pod.percentage}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden flex">
                <div
                  className={`h-full ${pod.color} rounded-full transition-all duration-700`}
                  style={{ width: `${pod.percentage}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-400">
                <span>Lead: {pod.lead}</span>
                <span
                  className={
                    pod.status === 'Heavy Load'
                      ? 'text-amber-600 font-medium'
                      : pod.status === 'Optimal'
                      ? 'text-emerald-600 font-medium'
                      : 'text-slate-500'
                  }
                >
                  {pod.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Pill */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
          <ShieldCheck className="w-3.5 h-3.5" /> 4 active pods within healthy sprint velocity thresholds
        </span>
        <span className="inline-flex items-center gap-1 text-[#5851d8] font-medium bg-indigo-50 px-2 py-0.5 rounded-md">
          <Zap className="w-3 h-3" /> Sprint 2 Target: 100%
        </span>
      </div>
    </Card>
  );
};
