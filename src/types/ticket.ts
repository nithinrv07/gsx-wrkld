// Ticket model for Module 4 (Task & Issue Management).
// Names follow the Wrkld Frontend Technical Documentation: ticket lifecycle (7.6),
// ticket types (2.1) and the blueprint tables `tickets` and `ticket_dependencies` (11.1).
// Column names are not defined by the blueprint yet (Open Question 1), so these
// camelCase fields follow the team's existing types and must be confirmed with the backend.

/** The eight lifecycle states, in order (doc 7.6). */
export type TicketStatus =
  | 'backlog'
  | 'todo'
  | 'in_progress'
  | 'pr_open_review'
  | 'pod_lead_approved'
  | 'ready_for_integration'
  | 'integration_verified'
  | 'done';

/** The five ticket types (doc 2.1). */
export type TicketType =
  | 'epic'
  | 'story_domain_task'
  | 'integration_ticket'
  | 'bug_regression'
  | 'blocker_flag';

export interface Ticket {
  /** Human key, for example WRK-104 (doc 7.6). */
  key: string;
  projectSlug: string;
  podId: string;
  title: string;
  description: string;
  type: TicketType;
  status: TicketStatus;
  /** A user id, or null when unassigned. */
  assigneeId: string | null;
  /** A sprint id, or null when the ticket is not planned into a sprint. */
  sprintId: string | null;
  createdAt: string;
  updatedAt: string;
}

/** A "Blocked by" link to an upstream ticket from another pod (Stretch S1). */
export interface TicketDependency {
  ticketKey: string;
  blockedByKey: string;
}

/** The sprint fields the board needs. Sprints are owned by Module 3 (Project & Sprint). */
export interface TicketSprintOption {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
}

export interface CreateTicketInput {
  podId: string;
  title: string;
  description: string;
  type: TicketType;
  assigneeId: string | null;
  sprintId: string | null;
}

export interface UpdateTicketInput {
  title?: string;
  description?: string;
  assigneeId?: string | null;
  sprintId?: string | null;
}

/** Board filters (doc 7.6): by assignee, type and sprint. */
export interface TicketFilters {
  /** 'all', 'none' (unassigned) or a user id. */
  assignee: string;
  /** 'all' or a ticket type. */
  type: TicketType | 'all';
  /** 'all', 'none' (no sprint) or a sprint id. */
  sprint: string;
}

export const EMPTY_TICKET_FILTERS: TicketFilters = { assignee: 'all', type: 'all', sprint: 'all' };
