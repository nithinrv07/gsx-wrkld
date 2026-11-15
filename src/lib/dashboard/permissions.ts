import { Role } from '@/types/dashboard';
import { canPerform } from '@/lib/permissions/usePermissions';
import type { PermissionAction } from '@/lib/permissions/rules';

/**
 * Dashboard-specific visibility rules. Actions defined in the shared RBAC
 * matrix (src/lib/permissions/rules.ts) are delegated to it so there is a
 * single source of truth. UI only — the backend enforces access.
 */
const VIEW_RULES = {
  /** See every project in the workspace, not only the ones you belong to. */
  'projects:view-all': ['Super Admin'],
  /** Show the "Awaiting review" figure (work waiting on a lead). */
  'tickets:view-review-queue': ['Super Admin', 'Project Lead', 'Pod Lead'],
  /** See the lead assigned to each pod in progress analytics. */
  'analytics:view-pod-leads': ['Super Admin', 'Project Lead', 'Pod Lead'],
} as const satisfies Record<string, readonly Role[]>;

export type Permission = keyof typeof VIEW_RULES | PermissionAction;

export function can(role: Role, permission: Permission): boolean {
  if (permission in VIEW_RULES) {
    return (VIEW_RULES[permission as keyof typeof VIEW_RULES] as readonly Role[]).includes(role);
  }
  return canPerform({ globalRole: role }, permission as PermissionAction);
}
