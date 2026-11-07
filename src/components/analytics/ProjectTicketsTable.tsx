'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { Card, Column, DataTable, PodBadge } from '@/components/ui';
import { PodCode, Ticket, TicketStatus } from '@/types/dashboard';
import { TICKET_STATUSES, TICKET_STATUS_META } from '@/lib/dashboard/meta';
import { dashboardRoutes } from '@/lib/dashboard/routes';
import { useProjectTickets } from '@/lib/dashboard/queries';
import { PanelError, PanelHeader, TicketStatusBadge, TicketTypeTag } from '@/components/dashboard/primitives';

const columns: Column<Ticket>[] = [
  {
    key: 'key',
    header: 'Ticket',
    render: (t) => (
      <div className="min-w-[14rem]">
        <span className="font-mono text-xs font-semibold text-[#5851d8]">{t.key}</span>
        <p className="font-medium text-slate-900">{t.title}</p>
      </div>
    ),
  },
  { key: 'type', header: 'Type', render: (t) => <TicketTypeTag type={t.type} /> },
  { key: 'pod', header: 'Pod', render: (t) => <PodBadge pod={t.pod} /> },
  { key: 'status', header: 'Status', render: (t) => <TicketStatusBadge status={t.status} /> },
  {
    key: 'assignee',
    header: 'Assignee',
    render: (t) => <span className="whitespace-nowrap text-slate-600">{t.assignee?.name ?? 'Unassigned'}</span>,
  },
];

export interface ProjectTicketsTableProps {
  slug: string;
  pod?: PodCode;
  status?: TicketStatus;
  onStatusChange: (status: TicketStatus | undefined) => void;
}

export const ProjectTicketsTable: React.FC<ProjectTicketsTableProps> = ({ slug, pod, status, onStatusChange }) => {
  const router = useRouter();
  const query = useProjectTickets(slug);
  const [search, setSearch] = useState('');

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (query.data ?? []).filter(
      (t) =>
        (!pod || t.pod === pod) &&
        (!status || t.status === status) &&
        (!q || t.key.toLowerCase().includes(q) || t.title.toLowerCase().includes(q))
    );
  }, [query.data, pod, status, search]);

  return (
    <Card>
      <PanelHeader
        title="Tickets"
        subtitle="Search and filter this project's tickets"
        count={query.data ? rows.length : undefined}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Ticket ID or title"
                aria-label="Search project tickets"
                className="h-8 w-44 rounded-lg border border-slate-200/90 pl-8 pr-2 text-xs focus:border-[#5851d8] focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
            </div>
            <select
              aria-label="Filter project tickets by status"
              value={status ?? ''}
              onChange={(e) => onStatusChange((e.target.value || undefined) as TicketStatus | undefined)}
              className="h-8 rounded-lg border border-slate-200/90 bg-white px-2 text-xs focus:border-[#5851d8] focus:outline-none focus:ring-2 focus:ring-indigo-200"
            >
              <option value="">All statuses</option>
              {TICKET_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {TICKET_STATUS_META[s].label}
                </option>
              ))}
            </select>
            {status && (
              <button
                onClick={() => onStatusChange(undefined)}
                className="inline-flex cursor-pointer items-center gap-1 text-xs text-slate-500 hover:text-slate-800"
              >
                <X className="h-3 w-3" /> Clear
              </button>
            )}
          </div>
        }
      />
      {query.isError ? (
        <PanelError message={query.error.message} onRetry={() => query.refetch()} isRetrying={query.isFetching} />
      ) : (
        <div className="px-5 pb-5">
          <DataTable
            columns={columns}
            data={rows}
            isLoading={query.isPending}
            keyExtractor={(t) => t.key}
            onRowClick={(t) => router.push(dashboardRoutes.ticket(t))}
            emptyMessage="No tickets match these filters."
            className="shadow-none"
          />
        </div>
      )}
    </Card>
  );
};
