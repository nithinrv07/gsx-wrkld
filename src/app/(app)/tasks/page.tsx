'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { Search, ArrowRight, LayoutGrid } from 'lucide-react';
import { PageHeader, Card, Button, PodBadge } from '@/components/ui';
import { getUnifiedDashboardTickets } from '@/features/tickets/lib/ticketAdapter';
import { TicketStatusBadge, TicketTypeTag } from '@/components/dashboard/primitives';
import { dashboardRoutes } from '@/lib/dashboard/routes';
import { TicketStatus } from '@/types/dashboard';

export default function TasksPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const tickets = useMemo(() => getUnifiedDashboardTickets(), []);

  const filteredTickets = useMemo(() => {
    const q = search.trim().toLowerCase();
    return tickets.filter((t) => {
      const matchesSearch =
        !q || t.key.toLowerCase().includes(q) || t.title.toLowerCase().includes(q);
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'open' ? t.status !== 'done' : t.status === statusFilter);
      return matchesSearch && matchesStatus;
    });
  }, [tickets, search, statusFilter]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tasks & Work Items"
        description="Cross-pod work items, stories, and blocker flags across active projects."
        breadcrumbs={[
          { label: 'Home', href: '/dashboard' },
          { label: 'Tasks' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Link href="/projects/wrkld/pods/pod-fe">
              <Button variant="primary" size="sm" leftIcon={<LayoutGrid className="w-4 h-4" />}>
                Open Kanban Board
              </Button>
            </Link>
          </div>
        }
      />

      <Card className="p-4 space-y-4">
        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="Search by ticket ID or title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#5851d8] focus:ring-2 focus:ring-[#5851d8]/15 outline-none transition-all"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#5851d8]/20"
            >
              <option value="all">All Statuses</option>
              <option value="open">All Open</option>
              <option value="in-progress">In Progress</option>
              <option value="todo">Todo</option>
              <option value="pr-review">PR Review</option>
              <option value="pod-lead-approved">Pod Lead Approved</option>
              <option value="ready-for-integration">Ready for Integration</option>
              <option value="done">Done</option>
            </select>
          </div>
        </div>

        {/* Tickets List */}
        <div className="divide-y divide-slate-100">
          {filteredTickets.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm">
              No tasks match your filter criteria.
            </div>
          ) : (
            filteredTickets.map((t) => {
              const ticketHref = dashboardRoutes.ticket({
                projectSlug: t.projectSlug,
                pod: t.pod,
                key: t.key,
              });

              return (
                <div
                  key={t.key}
                  className="py-3 px-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 rounded-xl transition-colors"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-[#5851d8]">{t.key}</span>
                      <TicketTypeTag type={t.type} />
                      <PodBadge pod={t.pod} />
                      <TicketStatusBadge status={t.status as TicketStatus} />
                    </div>
                    <p className="text-sm font-semibold text-slate-900 truncate">{t.title}</p>
                    <p className="text-xs text-slate-500">
                      Project: {t.projectName} · Assignee: {t.assignee?.name || 'Unassigned'}
                    </p>
                  </div>

                  <Link
                    href={ticketHref}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5851d8] hover:text-[#4a43c4] hover:underline self-end sm:self-center shrink-0"
                  >
                    <span>Open in Board</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              );
            })
          )}
        </div>
      </Card>
    </div>
  );
}
