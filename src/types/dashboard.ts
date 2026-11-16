/**
 * Data models for the Dashboard & Analytics module.
 *
 * Progress percentages are always supplied by the backend. The frontend never
 * derives an overall percentage from pod percentages (no weighting formula is
 * defined in the technical documentation).
 */

import type { GlobalRole } from './auth-pod';

/** Roles come from the shared auth module. */
export type Role = GlobalRole;

export type PodCode = 'FE' | 'BE' | 'INT' | 'QA';

/** The eight ticket lifecycle statuses, in workflow order. */
export type TicketStatus =
  | 'backlog'
  | 'todo'
  | 'in-progress'
  | 'pr-review'
  | 'pod-lead-approved'
  | 'ready-for-integration'
  | 'integration-verified'
  | 'done';

export type TicketType = 'epic' | 'story' | 'integration' | 'bug' | 'blocker';

export type Severity = 'low' | 'medium' | 'high' | 'critical';

export type ProjectStatus = 'planning' | 'active' | 'in-progress' | 'blocked' | 'completed';

export type StatusCounts = Record<TicketStatus, number>;

export interface Person {
  id: string;
  name: string;
  initials: string;
}

export interface CurrentUser extends Person {
  email: string;
  githubHandle?: string;
  role: Role;
  /** The pod the user leads or belongs to, if any. */
  pod?: PodCode;
}

/** Who is asking: passed to every dashboard request. */
export interface Viewer {
  id: string;
  role: Role;
  pod?: PodCode;
}

export interface Ticket {
  key: string; // e.g. WRK-104
  title: string;
  description: string;
  status: TicketStatus;
  type: TicketType;
  pod: PodCode;
  projectSlug: string;
  projectName: string;
  assignee?: Person;
  /** Only present on Blocker Flag tickets, when the backend supplies it. */
  severity?: Severity;
  updatedAt: string; // ISO timestamp
}

export interface PodProgress {
  pod: PodCode;
  lead?: Person;
  progress: number; // 0-100, from backend
  statusCounts: StatusCounts;
}

export interface ProjectSummary {
  slug: string;
  name: string;
  status: ProjectStatus;
  progress: number; // 0-100, from backend
  lead?: Person;
  myTicketCount: number;
}

export interface ProjectAnalytics extends ProjectSummary {
  statusCounts: StatusCounts;
  pods: PodProgress[];
}

export interface DashboardSummary {
  /** Overall progress across the user's projects, as reported by the backend. */
  overallProgress: number;
  stats: {
    projects: number;
    assignedTickets: number;
    openBlockers: number;
    /** Only returned for roles that review work (Pod Lead and above). */
    awaitingReview?: number;
  };
  projects: ProjectSummary[];
}
