'use client';

import React from 'react';
import { Card, ProgressBar } from '@/components/ui';
import { StatusCounts } from '@/types/dashboard';
import { countByPhase } from '@/lib/dashboard/meta';
import { InfoTooltip } from '@/components/dashboard/primitives';

export interface RollUpProgressProps {
  title?: string;
  /** Completion percentage exactly as supplied by the backend. */
  progress: number;
  statusCounts: StatusCounts;
  caption?: React.ReactNode;
}

const PHASES = [
  { key: 'done', label: 'Completed', bar: 'bg-emerald-500', dot: 'bg-emerald-500' },
  { key: 'in-flight', label: 'In flight', bar: 'bg-[#5851d8]', dot: 'bg-[#5851d8]' },
  { key: 'not-started', label: 'Not started', bar: 'bg-slate-300', dot: 'bg-slate-300' },
] as const;

/**
 * Overall progress for a project (or a single pod when filtered).
 * The percentage is displayed as received; ticket counts are shown separately
 * to distinguish completed from pending work.
 */
export const RollUpProgress: React.FC<RollUpProgressProps> = ({
  title = 'Overall project progress',
  progress,
  statusCounts,
  caption,
}) => {
  const phases = countByPhase(statusCounts);
  const pending = phases.total - phases.done;

  return (
    <Card className="p-5 md:p-6">
      <div className="flex flex-col gap-6 md:flex-row md:items-center">
        <div className="md:w-56 md:shrink-0">
          <p className="flex items-center gap-1.5 text-sm font-medium text-slate-500">
            {title}
            <InfoTooltip text="Completion percentage reported by the backend. It is not calculated from ticket counts or pod percentages." />
          </p>
          <p className="mt-1 text-5xl font-bold tracking-tight text-slate-900">{progress}%</p>
          {caption && <div className="mt-1 text-xs text-slate-400">{caption}</div>}
        </div>

        <div className="flex-1 space-y-4">
          <ProgressBar value={progress} size="lg" variant={progress >= 100 ? 'emerald' : 'gradient'} />

          <div>
            <div className="mb-2 flex items-center justify-between text-xs text-slate-500">
              <span>
                <span className="font-semibold text-slate-800">{phases.done}</span> completed ·{' '}
                <span className="font-semibold text-slate-800">{pending}</span> pending
              </span>
              <span>{phases.total} tickets</span>
            </div>
            {phases.total > 0 ? (
              <div
                className="flex h-2.5 w-full overflow-hidden rounded-full bg-slate-100"
                role="img"
                aria-label={`${phases.done} completed, ${phases['in-flight']} in flight, ${phases['not-started']} not started`}
              >
                {PHASES.map(({ key, bar }) =>
                  phases[key] > 0 ? (
                    <div key={key} className={bar} style={{ flexGrow: phases[key] }} title={`${phases[key]} tickets`} />
                  ) : null
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-400">No tickets yet.</p>
            )}
            <ul className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
              {PHASES.map(({ key, label, dot }) => (
                <li key={key} className="flex items-center gap-1.5">
                  <span className={`h-2 w-2 rounded-full ${dot}`} />
                  {label} <span className="font-semibold text-slate-700">{phases[key]}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </Card>
  );
};
