// Pure helpers for Module 4. No React, no data source: easy to unit test.

import type {
  CreateTicketInput,
  Ticket,
  TicketDependency,
  TicketFilters,
  TicketStatus,
} from '@/types/ticket';

export function applyTicketFilters(tickets: readonly Ticket[], filters: TicketFilters): Ticket[] {
  return tickets.filter((t) => {
    if (filters.assignee !== 'all' && (t.assigneeId ?? 'none') !== filters.assignee) return false;
    if (filters.type !== 'all' && t.type !== filters.type) return false;
    if (filters.sprint !== 'all' && (t.sprintId ?? 'none') !== filters.sprint) return false;
    return true;
  });
}

export function hasActiveFilters(filters: TicketFilters): boolean {
  return filters.assignee !== 'all' || filters.type !== 'all' || filters.sprint !== 'all';
}

export function groupTicketsByStatus(
  tickets: readonly Ticket[],
  statuses: readonly TicketStatus[]
): Record<TicketStatus, Ticket[]> {
  const groups = Object.fromEntries(statuses.map((s) => [s, [] as Ticket[]])) as Record<TicketStatus, Ticket[]>;
  for (const t of tickets) {
    if (groups[t.status]) groups[t.status].push(t);
  }
  return groups;
}

/** Next key for a project, for example WRK-122. The real backend should assign keys. */
export function nextTicketKey(prefix: string, existingKeys: readonly string[]): string {
  const max = existingKeys.reduce((highest, key) => {
    const match = /-(\d+)$/.exec(key);
    return match ? Math.max(highest, parseInt(match[1], 10)) : highest;
  }, 0);
  return `${prefix}-${max + 1}`;
}

export const TICKET_TITLE_MAX_LENGTH = 200;

export interface TicketValidationErrors {
  title?: string;
}

export function validateTicketInput(input: Pick<CreateTicketInput, 'title'>): TicketValidationErrors {
  const title = input.title.trim();
  if (!title) return { title: 'Add a title so the pod knows what this ticket is for.' };
  if (title.length > TICKET_TITLE_MAX_LENGTH) {
    return { title: `Keep the title under ${TICKET_TITLE_MAX_LENGTH} characters.` };
  }
  return {};
}

/** Keys of upstream tickets this ticket is blocked by. */
export function blockedByKeys(ticketKey: string, dependencies: readonly TicketDependency[]): string[] {
  return dependencies.filter((d) => d.ticketKey === ticketKey).map((d) => d.blockedByKey);
}

/**
 * Tickets that can be linked as "Blocked by": upstream tickets from another pod
 * in the same project, not already linked and not Done (Stretch S1).
 */
export function linkableUpstreamTickets(
  ticket: Ticket,
  projectTickets: readonly Ticket[],
  dependencies: readonly TicketDependency[]
): Ticket[] {
  const linked = new Set(blockedByKeys(ticket.key, dependencies));
  // Tickets already blocked by this one would make a circular link.
  const blockedByThis = new Set(dependencies.filter((d) => d.blockedByKey === ticket.key).map((d) => d.ticketKey));
  return projectTickets.filter(
    (t) =>
      t.podId !== ticket.podId && t.status !== 'done' && !linked.has(t.key) && !blockedByThis.has(t.key) && t.key !== ticket.key
  );
}

export function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase() || '?';
}
