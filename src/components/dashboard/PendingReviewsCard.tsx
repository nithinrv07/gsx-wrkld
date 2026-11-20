'use client';

import React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui';
import { PodCode, Ticket } from '@/types/dashboard';
import { dashboardRoutes } from '@/lib/dashboard/routes';

interface PendingReviewsCardProps {
  tickets?: Ticket[];
}

interface TicketRow {
  title: string;
  key?: string;
  status: 'In Review' | 'In Progress' | 'Blocked';
  statusClass: string;
  slug?: string;
  pod?: string;
}

const DEFAULT_ROWS: TicketRow[] = [
  {
    title: 'Fix authentication token refresh',
    key: 'WRK-108',
    status: 'In Review',
    statusClass: 'bg-amber-50 text-amber-700 border border-amber-200/80',
    slug: 'wrkld',
    pod: 'FE',
  },
  {
    title: 'WebSocket sync reconnect retry loop',
    key: 'WRK-112',
    status: 'In Progress',
    statusClass: 'bg-blue-50 text-blue-700 border border-blue-200/80',
    slug: 'wrkld',
    pod: 'INT',
  },
  {
    title: 'API gateway rate limiter exception',
    key: 'WRK-131',
    status: 'Blocked',
    statusClass: 'bg-rose-50 text-rose-700 border border-rose-200/80',
    slug: 'wrkld',
    pod: 'BE',
  },
];

export const PendingReviewsCard: React.FC<PendingReviewsCardProps> = ({ tickets }) => {
  const rows = React.useMemo(() => {
    if (tickets && tickets.length > 0) {
      return tickets.map((t) => {
        const status =
          t.status === 'pr-review' || t.status === 'pod-lead-approved'
            ? 'In Review'
            : t.type === 'blocker'
            ? 'Blocked'
            : 'In Progress';
        const statusClass =
          status === 'In Review'
            ? 'bg-amber-50 text-amber-700 border border-amber-200/80'
            : status === 'Blocked'
            ? 'bg-rose-50 text-rose-700 border border-rose-200/80'
            : 'bg-blue-50 text-blue-700 border border-blue-200/80';
        return {
          title: t.title,
          key: t.key,
          status,
          statusClass,
          slug: t.projectSlug,
          pod: t.pod,
        };
      });
    }
    return DEFAULT_ROWS;
  }, [tickets]);

  return (
    <Card className="flex flex-col p-5 bg-white border border-slate-200/80 rounded-2xl shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
        <h3 className="text-base font-semibold tracking-tight text-slate-900">
          Pending Reviews & Tickets
        </h3>

        {/* Avatar Stack matching screenshot */}
        <div className="flex items-center -space-x-1.5">
          <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-[10px] font-bold ring-2 ring-white">
            N
          </div>
          <div className="w-6 h-6 rounded-full bg-purple-500 text-white flex items-center justify-center text-[10px] font-bold ring-2 ring-white">
            S
          </div>
          <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold ring-2 ring-white">
            M
          </div>
          <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-[9px] font-bold ring-2 ring-white">
            +8
          </div>
        </div>
      </div>

      {/* Ticket Rows */}
      <div className="space-y-3">
        {rows.slice(0, 5).map((row) => {
          const href =
            row.slug && row.pod && row.key
              ? dashboardRoutes.ticket({ projectSlug: row.slug, pod: row.pod as PodCode, key: row.key })
              : '#';

          return (
            <Link
              key={row.title}
              href={href}
              className="flex items-center justify-between gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors group"
            >
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                  {row.title}
                </p>
                {row.key && <span className="text-[10px] text-slate-400 font-mono">{row.key}</span>}
              </div>
              <span
                className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full shrink-0 ${row.statusClass}`}
              >
                {row.status}
              </span>
            </Link>
          );
        })}
      </div>
    </Card>
  );
};
