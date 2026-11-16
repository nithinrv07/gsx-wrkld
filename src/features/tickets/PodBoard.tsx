'use client';

// PodBoard: the Board tab of the pod page (/projects/[slug]/pods/[pod], doc 7.6).
// Everything about the project, pod and people comes in through props or the data
// source, so the same board works for any project and any pod.

import React, { useCallback, useMemo, useState } from 'react';
import { AlertCircle, ClipboardList, Plus } from 'lucide-react';
import { Button, EmptyState } from '@/components/ui';
import type { UserContext } from '@/lib/permissions/usePermissions';
import type { PodMember } from '@/types/auth-pod';
import { TICKET_STATUS_LABELS } from '@/constants/ticket-lifecycle';
import { EMPTY_TICKET_FILTERS, type CreateTicketInput, type TicketFilters, type TicketStatus, type UpdateTicketInput } from '@/types/ticket';
import { ticketsApi } from '@/services/api/ticketsApi';
import { TicketsQueryBoundary } from './TicketsQueryBoundary';
import {
  useAddDependency,
  useCreateTicket,
  useMoveTicket,
  useProjectTickets,
  useRemoveDependency,
  useTicketDependencies,
  useTicketSprints,
  useUpdateTicket,
} from './hooks/useTickets';
import { getTicketPermissions } from './lib/ticketPermissions';
import { applyTicketFilters, blockedByKeys, hasActiveFilters, linkableUpstreamTickets } from './lib/ticketHelpers';
import { describeTicketError, isUnauthorized } from './lib/describeError';
import { KanbanBoard } from './components/KanbanBoard';
import { BoardFilters, type BoardView } from './components/BoardFilters';
import { BacklogTable } from './components/BacklogTable';
import { TicketForm } from './components/TicketForm';
import { TicketDetailPanel } from './components/TicketDetailPanel';
import { BoardNotice, type Notice } from './components/BoardNotice';

export interface PodBoardProps {
  projectSlug: string;
  podId: string;
  podName: string;
  podLeadName: string | null;
  /** Pod members from the Pod & Team module. Assignees are chosen from these. */
  members: PodMember[];
  /** The signed-in user's role context from lib/permissions. */
  currentUser: UserContext;
  /** Optional pod types by pod id (FE, BE, INT, QA), shown next to upstream tickets (S1). Pass real pod data only. */
  podTypes?: Record<string, string>;
}

export function PodBoard(props: PodBoardProps) {
  return (
    <TicketsQueryBoundary>
      <PodBoardInner {...props} />
    </TicketsQueryBoundary>
  );
}

function PodBoardInner({ projectSlug, podId, podName, podLeadName, members, currentUser, podTypes = {} }: PodBoardProps) {
  const ticketsQuery = useProjectTickets(projectSlug);
  const depsQuery = useTicketDependencies(projectSlug);
  const sprintsQuery = useTicketSprints(projectSlug);
  const createTicket = useCreateTicket(projectSlug);
  const updateTicket = useUpdateTicket(projectSlug);
  const moveTicket = useMoveTicket(projectSlug);
  const addDependency = useAddDependency(projectSlug);
  const removeDependency = useRemoveDependency(projectSlug);

  const [view, setView] = useState<BoardView>('kanban');
  const [filters, setFilters] = useState<TicketFilters>(EMPTY_TICKET_FILTERS);
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);
  const dismissNotice = useCallback(() => setNotice(null), []);
  const say = (tone: Notice['tone'], title: string, text: string) => setNotice({ id: Date.now(), tone, title, text });

  const permissions = useMemo(() => getTicketPermissions(currentUser, podId), [currentUser, podId]);
  const projectTickets = useMemo(() => ticketsQuery.data ?? [], [ticketsQuery.data]);
  const dependencies = useMemo(() => depsQuery.data ?? [], [depsQuery.data]);
  const sprints = useMemo(() => sprintsQuery.data ?? [], [sprintsQuery.data]);
  const podTickets = useMemo(() => projectTickets.filter((t) => t.podId === podId), [projectTickets, podId]);
  const visible = useMemo(() => applyTicketFilters(podTickets, filters), [podTickets, filters]);
  const backlogAll = podTickets.filter((t) => t.status === 'backlog');
  const backlogVisible = visible.filter((t) => t.status === 'backlog');

  const memberOptions = useMemo(() => members.map((m) => ({ userId: m.userId, name: m.name })), [members]);
  const assigneeName = useCallback(
    (assigneeId: string | null) => (assigneeId ? members.find((m) => m.userId === assigneeId)?.name ?? 'Former member' : 'Unassigned'),
    [members]
  );
  const podTypeOf = (id: string) => podTypes[id] ?? '';

  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const activeSprint = sprints.find((s) => s.startDate <= today && today <= s.endDate) ?? null;

  const move = (key: string, status: TicketStatus) => {
    const ticket = podTickets.find((t) => t.key === key);
    if (!ticket || ticket.status === status) return;
    const from = TICKET_STATUS_LABELS[ticket.status];
    const reason = permissions.moveBlockedReason(status);
    if (reason) {
      say('refused', 'Move refused', `${reason} ${key} went back to ${from}.`);
      return;
    }
    const approving = status === 'pod_lead_approved' && ticket.status === 'pr_open_review';
    moveTicket.mutate(
      { ticketKey: key, status },
      {
        onSuccess: () =>
          approving
            ? say('ok', 'Approved', `${key} moved to Pod Lead Approved.`)
            : say('ok', 'Moved', `${key} moved to ${TICKET_STATUS_LABELS[status]}.`),
        onError: (error) => say('refused', 'Move refused', `${describeTicketError(error)} ${key} went back to ${from}.`),
      }
    );
  };

  // --- loading, error and empty states (doc 7.7) ---
  if (ticketsQuery.isPending || depsQuery.isPending || sprintsQuery.isPending) {
    return (
      <div aria-busy="true" aria-label="Loading tickets" className="flex gap-3 overflow-hidden">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="flex w-64 flex-none flex-col gap-2 rounded-xl bg-slate-100 px-2 py-3">
            <div className="h-3.5 w-2/5 rounded-md bg-slate-200" />
            <div className="h-20 rounded-[10px] border border-slate-200 bg-white" />
            <div className="h-20 rounded-[10px] border border-slate-200 bg-white" />
          </div>
        ))}
      </div>
    );
  }

  const loadError = ticketsQuery.error ?? depsQuery.error ?? sprintsQuery.error;
  if (loadError) {
    return (
      <div role="alert" className="flex max-w-lg flex-col items-start gap-2 rounded-xl border border-rose-200 bg-white p-4">
        <span className="flex items-center gap-2 text-[15px] font-semibold text-rose-900">
          <AlertCircle className="h-4 w-4" aria-hidden="true" /> Tickets didn&apos;t load
        </span>
        <span className="text-[13px] leading-relaxed text-slate-600">{describeTicketError(loadError)}</span>
        {isUnauthorized(loadError) ? (
          <a href="/sign-in" className="text-[13px] font-medium text-[#5851d8] underline">Go to sign-in</a>
        ) : (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              void ticketsQuery.refetch();
              void depsQuery.refetch();
              void sprintsQuery.refetch();
            }}
          >
            Try again
          </Button>
        )}
      </div>
    );
  }

  const openTicket = openKey ? projectTickets.find((t) => t.key === openKey) ?? null : null;
  const openBlockers = openTicket
    ? blockedByKeys(openTicket.key, dependencies)
        .map((k) => projectTickets.find((t) => t.key === k))
        .filter((t): t is NonNullable<typeof t> => Boolean(t))
    : [];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {ticketsApi.kind === 'local' ? (
          <p className="rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-900">
            Not connected to a server yet. Tickets are saved in this browser only.
          </p>
        ) : (
          <span />
        )}
        <div className="flex flex-wrap items-center gap-3">
          {permissions.canCreate && (
            <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => setCreating(true)}>
              New ticket
            </Button>
          )}
        </div>
      </div>

      <BoardFilters
        view={view}
        onViewChange={setView}
        backlogCount={backlogAll.length}
        filters={filters}
        onFiltersChange={setFilters}
        members={memberOptions}
        sprints={sprints}
        filtersActive={hasActiveFilters(filters)}
        countText={
          view === 'list'
            ? `${backlogVisible.length} of ${backlogAll.length} tickets in Backlog`
            : `${visible.length} of ${podTickets.length} tickets`
        }
      />

      {podTickets.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title={`${podName} has no tickets yet`}
          description={permissions.canCreate ? 'Create the first ticket. It starts in Backlog.' : 'Tickets appear here once a lead creates them.'}
          action={
            permissions.canCreate ? (
              <Button size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={() => setCreating(true)}>New ticket</Button>
            ) : undefined
          }
        />
      ) : visible.length === 0 ? (
        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
          No tickets match these filters.
          <button type="button" onClick={() => setFilters(EMPTY_TICKET_FILTERS)} className="text-[#5851d8] underline">Clear filters</button>
        </div>
      ) : view === 'kanban' ? (
        <KanbanBoard
          tickets={visible}
          permissions={permissions}
          assigneeName={assigneeName}
          openKey={openKey}
          onOpen={setOpenKey}
          onMove={move}
          onApprove={(key) => move(key, 'pod_lead_approved')}
        />
      ) : backlogVisible.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white px-5 py-7">
          <p className="text-[15px] font-semibold text-slate-900">Nothing in Backlog</p>
          <p className="mt-1 text-[13px] text-slate-600">New tickets start here. Clear the filters if you expected to see some.</p>
        </div>
      ) : (
        <BacklogTable
          tickets={backlogVisible}
          sprints={sprints}
          permissions={permissions}
          assigneeName={assigneeName}
          onOpen={setOpenKey}
          onMoveToTodo={(key) => move(key, 'todo')}
          onPlanSprint={(key, sprintId) =>
            updateTicket.mutate(
              { key, input: { sprintId } },
              {
                onSuccess: () => say('ok', 'Sprint updated', sprintId ? `${key} is planned for ${sprints.find((s) => s.id === sprintId)?.name ?? 'the sprint'}.` : `${key} has no sprint.`),
                onError: (error) => say('refused', 'Sprint not updated', describeTicketError(error)),
              }
            )
          }
        />
      )}

      {openTicket && (
        <TicketDetailPanel
          key={openTicket.key}
          ticket={openTicket}
          permissions={permissions}
          members={memberOptions}
          sprints={sprints}
          assigneeName={assigneeName(openTicket.assigneeId)}
          podLeadName={podLeadName}
          saving={updateTicket.isPending}
          serverError={updateTicket.error ? describeTicketError(updateTicket.error) : null}
          blockers={openBlockers}
          linkable={linkableUpstreamTickets(openTicket, projectTickets, dependencies)}
          podTypeOf={podTypeOf}
          linkBusy={addDependency.isPending || removeDependency.isPending}
          onSave={(input: UpdateTicketInput) =>
            updateTicket.mutate(
              { key: openTicket.key, input },
              {
                onSuccess: () => {
                  setOpenKey(null);
                  say('ok', 'Changes saved', `${openTicket.key} is up to date.`);
                },
              }
            )
          }
          onMove={(status) => move(openTicket.key, status)}
          onApprove={() => move(openTicket.key, 'pod_lead_approved')}
          onLink={(blockedByKey) =>
            addDependency.mutate(
              { ticketKey: openTicket.key, blockedByKey },
              {
                onSuccess: () => say('ok', 'Ticket linked', `${openTicket.key} is blocked by ${blockedByKey}.`),
                onError: (error) => say('refused', 'Link not added', describeTicketError(error)),
              }
            )
          }
          onUnlink={(blockedByKey) =>
            removeDependency.mutate(
              { ticketKey: openTicket.key, blockedByKey },
              {
                onSuccess: () => say('ok', 'Link removed', `${openTicket.key} is no longer blocked by ${blockedByKey}.`),
                onError: (error) => say('refused', 'Link not removed', describeTicketError(error)),
              }
            )
          }
          onClose={() => {
            updateTicket.reset();
            setOpenKey(null);
          }}
        />
      )}

      {creating && permissions.canCreate && (
        <TicketForm
          podId={podId}
          podName={podName}
          members={memberOptions}
          sprints={sprints}
          defaultSprintId={activeSprint?.id ?? null}
          submitting={createTicket.isPending}
          serverError={createTicket.error ? describeTicketError(createTicket.error) : null}
          onSubmit={(input: CreateTicketInput) =>
            createTicket.mutate(input, {
              onSuccess: (created) => {
                setCreating(false);
                createTicket.reset();
                say('ok', 'Ticket created', `${created.key} is in Backlog.`);
              },
            })
          }
          onClose={() => {
            createTicket.reset();
            setCreating(false);
          }}
        />
      )}

      <BoardNotice notice={notice} onDismiss={dismissNotice} />
    </div>
  );
}
