// Ticket lifecycle, status-to-label mapping and ticket types.
// Owned by the Task & Issue Developer (doc 5.2). The Frontend Lead's StatusBadge
// and the Dashboard's "My assigned tickets" panel read from this file.

import type { StatusType } from '@/types';
import type { TicketStatus, TicketType } from '@/types/ticket';

/**
 * Who may move a ticket into a status.
 * - `any`: every role.
 * - `pod_lead_sign_off`: needs the Pod Lead's sign-off (doc 7.6, RBAC 8.1).
 * - `open_question`: not defined by the doc (Open Question 6). Treated as Pod Lead and above until decided.
 */
export type StatusMoveRule = 'any' | 'pod_lead_sign_off' | 'open_question';

export interface TicketStatusDefinition {
  id: TicketStatus;
  label: string;
  moveRule: StatusMoveRule;
}

/** The eight lifecycle states, in board order (doc 7.6). */
export const TICKET_STATUSES: readonly TicketStatusDefinition[] = [
  { id: 'backlog', label: 'Backlog', moveRule: 'any' },
  { id: 'todo', label: 'Todo', moveRule: 'any' },
  { id: 'in_progress', label: 'In Progress', moveRule: 'any' },
  // Open Question 8: the blueprint also calls this "CODE REVIEW". Doc 7.6 wording is used.
  { id: 'pr_open_review', label: 'PR Open / Review', moveRule: 'any' },
  { id: 'pod_lead_approved', label: 'Pod Lead Approved', moveRule: 'pod_lead_sign_off' },
  { id: 'ready_for_integration', label: 'Ready for Integration', moveRule: 'pod_lead_sign_off' },
  { id: 'integration_verified', label: 'Integration Verified', moveRule: 'open_question' },
  { id: 'done', label: 'Done', moveRule: 'open_question' },
] as const;

export const TICKET_STATUS_IDS: readonly TicketStatus[] = TICKET_STATUSES.map((s) => s.id);

export const TICKET_STATUS_LABELS: Record<TicketStatus, string> = Object.fromEntries(
  TICKET_STATUSES.map((s) => [s.id, s.label])
) as Record<TicketStatus, string>;

/**
 * Maps each lifecycle state to the closest existing StatusBadge variant.
 * Always pass the label as children so the badge text is the lifecycle name:
 * <StatusBadge status={TICKET_STATUS_BADGE[s]}>{TICKET_STATUS_LABELS[s]}</StatusBadge>
 */
export const TICKET_STATUS_BADGE: Record<TicketStatus, StatusType> = {
  backlog: 'pending',
  todo: 'todo',
  in_progress: 'in-progress',
  pr_open_review: 'review',
  pod_lead_approved: 'active',
  ready_for_integration: 'on-track',
  integration_verified: 'completed',
  done: 'done',
};

export interface TicketTypeDefinition {
  id: TicketType;
  label: string;
}

/** The five ticket types, named as in the blueprint (doc 2.1). */
export const TICKET_TYPES: readonly TicketTypeDefinition[] = [
  { id: 'epic', label: 'Epic' },
  { id: 'story_domain_task', label: 'Story / Domain Task' },
  { id: 'integration_ticket', label: 'Integration Ticket' },
  { id: 'bug_regression', label: 'Bug / Regression' },
  { id: 'blocker_flag', label: 'Blocker Flag' },
] as const;

export const TICKET_TYPE_LABELS: Record<TicketType, string> = Object.fromEntries(
  TICKET_TYPES.map((t) => [t.id, t.label])
) as Record<TicketType, string>;

export function getStatusDefinition(status: TicketStatus): TicketStatusDefinition {
  return TICKET_STATUSES.find((s) => s.id === status) ?? TICKET_STATUSES[0];
}

export function isTicketStatus(value: string): value is TicketStatus {
  return (TICKET_STATUS_IDS as readonly string[]).includes(value);
}
