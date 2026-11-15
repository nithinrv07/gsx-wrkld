import {
  PodCode,
  ProjectStatus,
  Severity,
  StatusCounts,
  TicketStatus,
  TicketType,
} from '@/types/dashboard';
import { StatusType } from '@/types';

export const TICKET_STATUSES: TicketStatus[] = [
  'backlog',
  'todo',
  'in-progress',
  'pr-review',
  'pod-lead-approved',
  'ready-for-integration',
  'integration-verified',
  'done',
];

export type StatusPhase = 'not-started' | 'in-flight' | 'done';

export const TICKET_STATUS_META: Record<
  TicketStatus,
  { label: string; description: string; phase: StatusPhase; className: string; dot: string }
> = {
  backlog: {
    label: 'Backlog',
    description: 'Captured but not yet planned into a sprint.',
    phase: 'not-started',
    className: 'bg-slate-100 text-slate-600 border-slate-200',
    dot: 'bg-slate-400',
  },
  todo: {
    label: 'Todo',
    description: 'Planned for the current sprint, work not started.',
    phase: 'not-started',
    className: 'bg-slate-50 text-slate-700 border-slate-200',
    dot: 'bg-slate-500',
  },
  'in-progress': {
    label: 'In Progress',
    description: 'Actively being worked on.',
    phase: 'in-flight',
    className: 'bg-blue-50 text-blue-700 border-blue-200/70',
    dot: 'bg-blue-500',
  },
  'pr-review': {
    label: 'PR Open / Review',
    description: 'Pull request opened and awaiting code review.',
    phase: 'in-flight',
    className: 'bg-purple-50 text-purple-700 border-purple-200/70',
    dot: 'bg-purple-500',
  },
  'pod-lead-approved': {
    label: 'Pod Lead Approved',
    description: 'Reviewed and approved by the pod lead.',
    phase: 'in-flight',
    className: 'bg-indigo-50 text-indigo-700 border-indigo-200/70',
    dot: 'bg-indigo-500',
  },
  'ready-for-integration': {
    label: 'Ready for Integration',
    description: 'Approved work waiting to be integrated with other pods.',
    phase: 'in-flight',
    className: 'bg-amber-50 text-amber-700 border-amber-200/70',
    dot: 'bg-amber-500',
  },
  'integration-verified': {
    label: 'Integration Verified',
    description: 'Integrated and verified end-to-end.',
    phase: 'in-flight',
    className: 'bg-teal-50 text-teal-700 border-teal-200/70',
    dot: 'bg-teal-500',
  },
  done: {
    label: 'Done',
    description: 'Completed and closed.',
    phase: 'done',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200/70',
    dot: 'bg-emerald-500',
  },
};

export const TICKET_TYPE_META: Record<TicketType, { label: string; className: string }> = {
  epic: { label: 'Epic', className: 'bg-violet-50 text-violet-700' },
  story: { label: 'Story', className: 'bg-sky-50 text-sky-700' },
  integration: { label: 'Integration Ticket', className: 'bg-teal-50 text-teal-700' },
  bug: { label: 'Bug', className: 'bg-orange-50 text-orange-700' },
  blocker: { label: 'Blocker Flag', className: 'bg-rose-50 text-rose-700' },
};

export const POD_META: Record<PodCode, { name: string; short: string }> = {
  FE: { name: 'Frontend', short: 'FE' },
  BE: { name: 'Backend', short: 'BE' },
  INT: { name: 'Integration', short: 'INT' },
  QA: { name: 'Quality Assurance', short: 'QA' },
};

export const POD_CODES: PodCode[] = ['FE', 'BE', 'INT', 'QA'];

export const SEVERITY_META: Record<Severity, { label: string; className: string }> = {
  low: { label: 'Low', className: 'bg-slate-100 text-slate-600' },
  medium: { label: 'Medium', className: 'bg-amber-50 text-amber-700' },
  high: { label: 'High', className: 'bg-orange-50 text-orange-700' },
  critical: { label: 'Critical', className: 'bg-rose-100 text-rose-700' },
};

/** Maps project status onto the shared StatusBadge palette. */
export const PROJECT_STATUS_BADGE: Record<ProjectStatus, { status: StatusType; label: string }> = {
  planning: { status: 'planning', label: 'Planning' },
  active: { status: 'active', label: 'Active' },
  'in-progress': { status: 'in-progress', label: 'In Progress' },
  blocked: { status: 'blocked', label: 'On Hold' },
  completed: { status: 'completed', label: 'Completed' },
};

/** Ticket counts grouped into not started / in flight / done. Counts only — no percentages. */
export function countByPhase(counts: StatusCounts) {
  const out: Record<StatusPhase, number> = { 'not-started': 0, 'in-flight': 0, done: 0 };
  for (const s of TICKET_STATUSES) out[TICKET_STATUS_META[s].phase] += counts[s] ?? 0;
  return { ...out, total: out['not-started'] + out['in-flight'] + out.done };
}
