'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { Card, PodBadge, ProgressBar } from '@/components/ui';
import { PodCode, PodProgress } from '@/types/dashboard';
import { POD_META, countByPhase } from '@/lib/dashboard/meta';
import { InfoTooltip, InitialsAvatar, PanelHeader } from '@/components/dashboard/primitives';

export interface PodProgressBarsProps {
  pods: PodProgress[];
  showLeads?: boolean;
  /** Highlights one pod (e.g. when a pod filter is active). */
  selectedPod?: PodCode;
  /** Where each pod row links to. Omit to render rows as plain content. */
  hrefForPod?: (pod: PodCode) => string;
}

export const PodProgressBars: React.FC<PodProgressBarsProps> = ({
  pods,
  showLeads = true,
  selectedPod,
  hrefForPod,
}) => (
  <Card>
    <PanelHeader
      title="Pod-wise progress"
      subtitle="Completion reported for each pod"
      actions={<InfoTooltip text="Each pod's percentage comes from the backend. Counts show tickets completed vs still pending in that pod." />}
    />
    <ul className="divide-y divide-slate-100 px-5 pb-3">
      {pods.map((p) => {
        const phases = countByPhase(p.statusCounts);
        const row = (
          <div className="flex items-center gap-4 py-3.5">
            <div className="flex w-36 shrink-0 items-center gap-2.5 sm:w-48">
              <PodBadge pod={p.pod} />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-slate-900">{POD_META[p.pod].name}</p>
                {showLeads && (
                  <p className="flex items-center gap-1 truncate text-[11px] text-slate-400">
                    {p.lead ? (
                      <>
                        <InitialsAvatar initials={p.lead.initials} size="sm" title={p.lead.name} />
                        <span className="truncate">{p.lead.name}</span>
                      </>
                    ) : (
                      'No pod lead'
                    )}
                  </p>
                )}
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <ProgressBar
                value={p.progress}
                size="md"
                variant={p.progress >= 100 ? 'emerald' : p.progress < 25 ? 'amber' : 'brand'}
              />
              <p className="mt-1.5 text-[11px] text-slate-500">
                <span className="font-semibold text-emerald-600">{phases.done} done</span> ·{' '}
                {phases['in-flight']} in flight · {phases['not-started']} not started
              </p>
            </div>
            <span className="w-12 shrink-0 text-right text-sm font-semibold text-slate-900">{p.progress}%</span>
            {hrefForPod && <ChevronRight className="h-4 w-4 shrink-0 text-slate-300" />}
          </div>
        );
        const highlighted = selectedPod === p.pod;
        return (
          <li key={p.pod} className={highlighted ? '-mx-5 bg-indigo-50/50 px-5' : ''}>
            {hrefForPod ? (
              <Link
                href={hrefForPod(p.pod)}
                aria-current={highlighted ? 'true' : undefined}
                aria-label={`${POD_META[p.pod].name} pod, ${p.progress}% complete`}
                className="block rounded-lg transition-colors hover:bg-slate-50/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300"
              >
                {row}
              </Link>
            ) : (
              row
            )}
          </li>
        );
      })}
    </ul>
  </Card>
);
