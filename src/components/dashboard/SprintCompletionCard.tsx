'use client';

import React from 'react';
import { Card } from '@/components/ui';

interface SprintCompletionCardProps {
  progress?: number;
}

export const SprintCompletionCard: React.FC<SprintCompletionCardProps> = ({ progress = 78 }) => {
  const radius = 46;
  const strokeWidth = 9;
  const normalizedRadius = radius - strokeWidth / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <Card className="flex flex-col p-5 bg-white border border-slate-200/80 rounded-2xl shadow-xs justify-between">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <h3 className="text-base font-semibold tracking-tight text-slate-900">
          Sprint Completion
        </h3>
      </div>

      {/* Donut Gauge matching screenshot */}
      <div className="flex flex-col items-center justify-center my-4">
        <div className="relative w-36 h-36 flex items-center justify-center">
          <svg height={radius * 2 * 1.45} width={radius * 2 * 1.45} className="rotate-[-90deg]">
            <defs>
              <linearGradient id="completionGradient" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#2563EB" />
                <stop offset="100%" stopColor="#6366F1" />
              </linearGradient>
            </defs>
            {/* Background circle */}
            <circle
              stroke="#F1F5F9"
              fill="transparent"
              strokeWidth={strokeWidth}
              r={normalizedRadius * 1.35}
              cx={radius * 1.45}
              cy={radius * 1.45}
            />
            {/* Value stroke */}
            <circle
              stroke="url(#completionGradient)"
              fill="transparent"
              strokeWidth={strokeWidth}
              strokeDasharray={`${circumference * 1.35} ${circumference * 1.35}`}
              style={{ strokeDashoffset: strokeDashoffset * 1.35 }}
              strokeLinecap="round"
              r={normalizedRadius * 1.35}
              cx={radius * 1.45}
              cy={radius * 1.45}
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-3xl font-extrabold tracking-tight text-slate-900">{progress}%</span>
          </div>
        </div>

        {/* Legend matching screenshot */}
        <div className="flex flex-col gap-1.5 text-xs mt-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
            <span className="text-slate-600 font-medium">Completed:</span>
            <span className="text-slate-900 font-bold">{progress}%</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-200" />
            <span className="text-slate-500 font-medium">Remaining:</span>
            <span className="text-slate-700 font-bold">{100 - progress}%</span>
          </div>
        </div>
      </div>
    </Card>
  );
};
