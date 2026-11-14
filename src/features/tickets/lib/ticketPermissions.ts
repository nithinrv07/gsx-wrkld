// Role rules for tickets, built only on the shared permission table in
// lib/permissions (doc 8.2: one source of truth). If the team chooses a different
// permission system, this is the only file in Module 4 that needs to change.
// The frontend never enforces security: the backend must check every action (doc 8).

import { canPerform, type UserContext } from '@/lib/permissions/usePermissions';
import { getStatusDefinition, TICKET_STATUS_LABELS } from '@/constants/ticket-lifecycle';
import type { TicketStatus } from '@/types/ticket';

export interface TicketPermissions {
  /** Create and assign tasks within pod (RBAC 8.1). */
  canCreate: boolean;
  canAssign: boolean;
  /** Manage sprints, pod scope (RBAC 8.1): planning backlog tickets into sprints. */
  canPlanSprints: boolean;
  /** Approve pod deliverables and PRs (RBAC 8.1): the "Approve" action. */
  canApprove: boolean;
  /** Flag cross-pod blockers and dependencies (RBAC 8.1): "Blocked by" tagging, Stretch S1. */
  canTagBlockedBy: boolean;
  canMoveTo: (status: TicketStatus) => boolean;
  /** A short reason shown when a move is not allowed, or null when it is. */
  moveBlockedReason: (status: TicketStatus) => string | null;
}

export function getTicketPermissions(user: UserContext, podId: string): TicketPermissions {
  const can = (action: Parameters<typeof canPerform>[1]) => canPerform(user, action, podId);

  const canApprove = can('approve_pod_deliverable');
  const canMoveToReady = can('move_to_ready_for_integration');

  const canMoveTo = (status: TicketStatus): boolean => {
    if (status === 'pod_lead_approved') return canApprove;
    if (status === 'ready_for_integration') return canMoveToReady;
    const rule = getStatusDefinition(status).moveRule;
    // Open Question 6: who may set Integration Verified and Done is not defined.
    // Until it is, the same people who can approve pod deliverables may set them.
    if (rule === 'open_question') return canApprove;
    return true;
  };

  const moveBlockedReason = (status: TicketStatus): string | null => {
    if (canMoveTo(status)) return null;
    const label = TICKET_STATUS_LABELS[status];
    if (getStatusDefinition(status).moveRule === 'pod_lead_sign_off') {
      return `${label} needs the Pod Lead’s sign-off.`;
    }
    return `Your role can’t move tickets to ${label}.`;
  };

  return {
    canCreate: can('create_task'),
    canAssign: can('assign_task'),
    canPlanSprints: can('manage_sprints'),
    canApprove,
    canTagBlockedBy: can('flag_blocker'),
    canMoveTo,
    moveBlockedReason,
  };
}
