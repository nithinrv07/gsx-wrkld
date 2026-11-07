'use client';

import React, { useMemo, useState } from 'react';
import { Inbox, Search } from 'lucide-react';
import { Button, Card } from '@/components/ui';
import { Ticket, TicketStatus } from '@/types/dashboard';
import { TICKET_STATUSES, TICKET_STATUS_META } from '@/lib/dashboard/meta';
import { PanelEmpty, PanelError, PanelHeader, SkeletonBlock } from './primitives';
import { TicketCard } from './TicketCard';

export interface MyTicketsPanelProps {
  tickets?: Ticket[];
  isLoading?: boolean;
  error?: Error | null;
  onRetry: () => void;
  isRetrying?: boolean;
}

const controlCls =
  'h-9 rounded-xl border border-slate-200/90 bg-white px-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-[#5851d8]';

export const MyTicketsPanel: React.FC<MyTicketsPanelProps> = ({
  tickets,
  isLoading,
  error,
  onRetry,
  isRetrying,
}) => {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<TicketStatus | 'open' | 'all'>('open');
  const [project, setProject] = useState('all');

  const projectOptions = useMemo(
    () => Array.from(new Map((tickets ?? []).map((t) => [t.projectSlug, t.projectName])).entries()),
    [tickets]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (tickets ?? []).filter(
      (t) =>
        (status === 'all' || (status === 'open' ? t.status !== 'done' : t.status === status)) &&
        (project === 'all' || t.projectSlug === project) &&
        (!q || t.key.toLowerCase().includes(q) || t.title.toLowerCase().includes(q))
    );
  }, [tickets, query, status, project]);

  const openCount = (tickets ?? []).filter((t) => t.status !== 'done').length;
  const hasFilters = query !== '' || status !== 'open' || project !== 'all';
  const reset = () => {
    setQuery('');
    setStatus('open');
    setProject('all');
  };

  return (
    <Card id="my-tickets" className="scroll-mt-24">
      <PanelHeader
        title="My assigned tickets"
        subtitle="Your current work items"
        count={tickets ? `${openCount} ${openCount === 1 ? 'ticket' : 'tickets'}` : undefined}
      />

      {isLoading ? (
        <div className="space-y-3 px-5 pb-5" aria-busy="true" aria-label="Loading tickets">
          {[0, 1, 2].map((i) => (
            <SkeletonBlock key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      ) : error ? (
        <PanelError message={error.message} onRetry={onRetry} isRetrying={isRetrying} />
      ) : !tickets || tickets.length === 0 ? (
        <PanelEmpty
          icon={<Inbox className="h-5 w-5" />}
          title="No tickets assigned to you"
          description="When a ticket is assigned to you it will show up here. Enjoy the calm!"
        />
      ) : (
        <>
          <div className="flex flex-col gap-2 px-5 pb-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by ticket ID or title"
                aria-label="Search tickets"
                className={`${controlCls} w-full pl-9`}
              />
            </div>
            <select
              aria-label="Filter tickets by status"
              value={status}
              onChange={(e) => setStatus(e.target.value as TicketStatus | 'open' | 'all')}
              className={controlCls}
            >
              <option value="open">All open</option>
              <option value="all">All statuses</option>
              {TICKET_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {TICKET_STATUS_META[s].label}
                </option>
              ))}
            </select>
            {projectOptions.length > 1 && (
              <select
                aria-label="Filter tickets by project"
                value={project}
                onChange={(e) => setProject(e.target.value)}
                className={controlCls}
              >
                <option value="all">All projects</option>
                {projectOptions.map(([slug, name]) => (
                  <option key={slug} value={slug}>
                    {name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {filtered.length === 0 ? (
            <PanelEmpty
              icon={<Search className="h-5 w-5" />}
              title="No tickets match"
              description="Try a different ticket ID, title or status."
              action={
                hasFilters && (
                  <Button size="sm" variant="secondary" onClick={reset}>
                    Clear filters
                  </Button>
                )
              }
            />
          ) : (
            <ul className="space-y-3 px-5 pb-5">
              {filtered.map((t) => (
                <li key={t.key}>
                  <TicketCard ticket={t} />
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </Card>
  );
};
