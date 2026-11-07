import { GlobalRole } from '@/types/auth-pod';

// UI-only rules written from the Blueprint RBAC matrix (Doc Section 8.1).
// The frontend never enforces security: the backend must check every action.

export type PermissionAction =
  | 'create_project'
  | 'archive_project'
  | 'assign_project_lead'
  | 'create_pod'
  | 'assign_pod_lead'
  | 'manage_pod_members'
  | 'manage_sprints'
  | 'create_task'
  | 'assign_task'
  | 'approve_pod_deliverable'
  | 'move_to_ready_for_integration'
  | 'flag_blocker';

export interface PermissionRule {
  /** Global roles allowed in every pod. */
  globalRoles: GlobalRole[];
  /** Also allowed for the Pod Lead of the pod in view ("pod scope" = own pod only). */
  podLeadAllowed?: boolean;
}

const ALL_ROLES: GlobalRole[] = ['Super Admin', 'Project Lead', 'Pod Lead', 'Contributor'];
const SUPER_ADMIN_ONLY: GlobalRole[] = ['Super Admin'];
const LEADS_ABOVE_POD: GlobalRole[] = ['Super Admin', 'Project Lead'];

export const RBAC_RULES: Record<PermissionAction, PermissionRule> = {
  create_project: { globalRoles: SUPER_ADMIN_ONLY },
  archive_project: { globalRoles: SUPER_ADMIN_ONLY },
  assign_project_lead: { globalRoles: SUPER_ADMIN_ONLY },
  create_pod: { globalRoles: LEADS_ABOVE_POD },
  assign_pod_lead: { globalRoles: LEADS_ABOVE_POD },
  manage_pod_members: { globalRoles: LEADS_ABOVE_POD, podLeadAllowed: true },
  manage_sprints: { globalRoles: LEADS_ABOVE_POD, podLeadAllowed: true },
  create_task: { globalRoles: LEADS_ABOVE_POD, podLeadAllowed: true },
  assign_task: { globalRoles: LEADS_ABOVE_POD, podLeadAllowed: true },
  approve_pod_deliverable: { globalRoles: LEADS_ABOVE_POD, podLeadAllowed: true },
  move_to_ready_for_integration: { globalRoles: LEADS_ABOVE_POD, podLeadAllowed: true },
  flag_blocker: { globalRoles: ALL_ROLES },
};