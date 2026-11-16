import React from 'react';
import Link from 'next/link';
import { Check, OctagonAlert } from 'lucide-react';
import { PodBadge } from '@/components/ui';
import { Ticket } from '@/types/dashboard';
import { dashboardRoutes } from '@/lib/dashboard/routes';
import { SeverityTag, TicketStatusBadge } from './primitives';

export interface AlertCardProps {
  blocker: Ticket;
  isRead: boolean;
  onToggleRead: (key: string) => void;
}

export const AlertCard: React.FC<AlertCardProps> = ({ blocker, isRead, onToggleRead }) => (
  <div
    className={`group relative flex gap-3 rounded-xl border p-3.5 transition-colors ${
      isRead ? 'border-slate-200/80 bg-white' : 'border-rose-200/80 bg-rose-50/40'
    }`}
  >
    <span
      className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
        isRead ? 'bg-slate-100 text-slate-400' : 'bg-rose-100 text-rose-600'
      }`}
      aria-hidden="true"
    >
      <OctagonAlert className="h-4 w-4" />
    </span>
    <div className="min-w-0 flex-1 space-y-1.5">
      <div className="flex flex-wrap items-center gap-1.5">
        <Link
          href={dashboardRoutes.ticket(blocker)}
          className="font-mono text-xs font-semibold text-rose-700 hover:underline after:absolute after:inset-0 after:content-['']"
        >
          {blocker.key}
          <span className="sr-only">: {blocker.title}</span>
        </Link>
        {blocker.severity && <SeverityTag severity={blocker.severity} />}
        {!isRead && <span className="h-1.5 w-1.5 rounded-full bg-rose-500" aria-label="Unread" />}
      </div>
      <p className={`text-sm leading-snug ${isRead ? 'text-slate-600' : 'font-medium text-slate-900'}`}>
        {blocker.title}
      </p>
      <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
        <span>{blocker.projectName}</span>
        <PodBadge pod={blocker.pod} />
        <TicketStatusBadge status={blocker.status} />
      </div>
    </div>
    <button
      type="button"
      onClick={() => onToggleRead(blocker.key)}
      className="relative z-10 h-7 shrink-0 self-start rounded-lg px-2 text-[11px] font-medium text-slate-400 opacity-100 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
      aria-label={isRead ? `Mark ${blocker.key} as unread` : `Mark ${blocker.key} as read`}
    >
      {isRead ? 'Unread' : <Check className="h-4 w-4" />}
    </button>
  </div>
);
