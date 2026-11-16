'use client';

import React from 'react';
import { Card } from '@/components/ui';
import { StatusCounts, TicketStatus } from '@/types/dashboard';
import { TICKET_STATUSES, TICKET_STATUS_META } from '@/lib/dashboard/meta';
import { PanelHeader } from '@/components/dashboard/primitives';

export interface TicketStatusBreakdownProps {
  statusCounts: StatusCounts;
  subtitle?: string;
  /** Makes each status selectable (e.g. to filter a ticket list). */
  selected?: TicketStatus;
  onSelect?: (status: TicketStatus | undefined) => void;
}

/** Ticket counts for all eight lifecycle statuses, in workflow order. */
export const TicketStatusBreakdown: React.FC<TicketStatusBreakdownProps> = ({
  statusCounts,
  subtitle = 'Tickets in each lifecycle status',
  selected,
  onSelect,
}) => (
  <Card>
    <PanelHeader title="Ticket status breakdown" subtitle={subtitle} />
    <ol className="grid grid-cols-2 gap-3 px-5 pb-5 sm:grid-cols-4">
      {TICKET_STATUSES.map((s, i) => {
        const meta = TICKET_STATUS_META[s];
        const count = statusCounts[s] ?? 0;
        const isSelected = selected === s;
        const body = (
          <>
            <span className="flex min-h-[2rem] items-start gap-1.5 text-[11px] font-medium leading-tight text-slate-500">
              <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${meta.dot}`} />
              <span>
                {i + 1}. {meta.label}
              </span>
            </span>
            <span className={`mt-1 block text-2xl font-bold ${count === 0 ? 'text-slate-300' : 'text-slate-900'}`}>
              {count}
            </span>
          </>
        );
        const base = `block w-full rounded-xl border p-3 text-left transition-colors ${
          meta.phase === 'done' ? 'border-emerald-200/70 bg-emerald-50/40' : 'border-slate-200/80 bg-white'
        } ${isSelected ? 'ring-2 ring-[#5851d8]' : ''}`;
        return (
          <li key={s} title={meta.description}>
            {onSelect ? (
              <button
                type="button"
                aria-pressed={isSelected}
                onClick={() => onSelect(isSelected ? undefined : s)}
                className={`${base} cursor-pointer hover:border-indigo-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300`}
              >
                {body}
              </button>
            ) : (
              <div className={base}>{body}</div>
            )}
          </li>
        );
      })}
    </ol>
  </Card>
);
