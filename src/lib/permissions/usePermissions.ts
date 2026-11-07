import { GlobalRole, PodRole } from '@/types/auth-pod';
import { PermissionAction, RBAC_RULES } from './rules';

export interface UserContext {
  globalRole: GlobalRole;
  /** The user's role in each pod, keyed by pod id. Needed for pod-scoped checks. */
  userPodRoles?: Record<string, PodRole>;
}

function isPodLead(roles: Record<string, PodRole> | undefined, podId?: string): boolean {
  if (!roles) return false;
  if (podId) return roles[podId] === 'Pod Lead';
  // No pod given: allow if the user leads at least one pod.
  return Object.values(roles).includes('Pod Lead');
}

/** Pure version, easy to unit test. */
export function canPerform(user: UserContext, action: PermissionAction, podId?: string): boolean {
  const rule = RBAC_RULES[action];
  if (rule.globalRoles.includes(user.globalRole)) return true;
  return rule.podLeadAllowed === true && isPodLead(user.userPodRoles, podId);
}

export function usePermissions(currentUser: UserContext) {
  const can = (action: PermissionAction, podId?: string): boolean =>
    canPerform(currentUser, action, podId);

  return { can, globalRole: currentUser.globalRole };
}