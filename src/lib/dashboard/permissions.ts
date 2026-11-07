import { Role } from '@/types/dashboard';

/**
 * Role-aware UI rules for the dashboard. This only decides what the UI shows;
 * the backend remains responsible for enforcing access.
 */
const RULES = {
  /** See every project in the workspace, not only the ones you belong to. */
  'projects:view-all': ['super-admin'],
  /** Show the "New project" action. */
  'projects:create': ['project-lead', 'super-admin'],
  /** Show the "Awaiting review" figure (work waiting on a lead). */
  'tickets:view-review-queue': ['pod-lead', 'project-lead', 'super-admin'],
  /** See the lead assigned to each pod in progress analytics. */
  'analytics:view-pod-leads': ['pod-lead', 'project-lead', 'super-admin'],
} as const satisfies Record<string, readonly Role[]>;

export type Permission = keyof typeof RULES;

export function can(role: Role, permission: Permission): boolean {
  return (RULES[permission] as readonly Role[]).includes(role);
}
