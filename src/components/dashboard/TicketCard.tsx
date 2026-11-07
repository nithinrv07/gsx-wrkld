import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { PodBadge } from '@/components/ui';
import { Ticket } from '@/types/dashboard';
import { dashboardRoutes } from '@/lib/dashboard/routes';
import { TicketStatusBadge, TicketTypeTag } from './primitives';

export const TicketCard: React.FC<{ ticket: Ticket }> = ({ ticket }) => (
  <Link
    href={dashboardRoutes.ticket(ticket)}
    className="group flex items-start gap-4 rounded-xl border border-slate-200/80 bg-white p-4 transition-all hover:border-indigo-200 hover:shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300"
  >
    <div className="min-w-0 flex-1 space-y-1.5">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-mono text-xs font-semibold text-[#5851d8]">{ticket.key}</span>
        <TicketStatusBadge status={ticket.status} />
        <TicketTypeTag type={ticket.type} />
      </div>
      <p className="font-medium text-slate-900 group-hover:text-[#5851d8]">{ticket.title}</p>
      <p className="line-clamp-2 text-xs leading-relaxed text-slate-500">{ticket.description}</p>
      <div className="flex flex-wrap items-center gap-2 pt-0.5 text-xs text-slate-500">
        <PodBadge pod={ticket.pod} display="name" />
        <span aria-hidden="true">·</span>
        <span>{ticket.projectName}</span>
      </div>
    </div>
    <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-[#5851d8]" />
  </Link>
);
