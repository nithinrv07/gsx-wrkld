// Pod & Team RBAC rules (Blueprint Section 8.1).
// The expected matrix is written out here on purpose, not derived from RBAC_RULES,
// so an accidental change to rules.ts fails this test instead of passing silently.

import { describe, expect, it } from 'vitest';
import { canPerform, type UserContext } from '../usePermissions';
import { RBAC_RULES, type PermissionAction } from '../rules';
import type { GlobalRole } from '@/types/auth-pod';

const ROLES: GlobalRole[] = ['Super Admin', 'Project Lead', 'Pod Lead', 'Contributor'];

/** Which global roles may perform each action in ANY pod (no pod-lead membership needed). */
const EXPECTED_GLOBAL: Record<PermissionAction, GlobalRole[]> = {
  create_project: ['Super Admin'],
  archive_project: ['Super Admin'],
  assign_project_lead: ['Super Admin'],
  create_pod: ['Super Admin', 'Project Lead'],
  assign_pod_lead: ['Super Admin', 'Project Lead'],
  manage_pod_members: ['Super Admin', 'Project Lead'],
  manage_sprints: ['Super Admin', 'Project Lead'],
  create_task: ['Super Admin', 'Project Lead'],
  assign_task: ['Super Admin', 'Project Lead'],
  approve_pod_deliverable: ['Super Admin', 'Project Lead'],
  move_to_ready_for_integration: ['Super Admin', 'Project Lead'],
  flag_blocker: ['Super Admin', 'Project Lead', 'Pod Lead', 'Contributor'],
};

/** Actions the Pod Lead of a pod may also perform, but only inside that pod ("own pod"). */
const POD_SCOPED: PermissionAction[] = [
  'manage_pod_members',
  'manage_sprints',
  'create_task',
  'assign_task',
  'approve_pod_deliverable',
  'move_to_ready_for_integration',
];

const ACTIONS = Object.keys(EXPECTED_GLOBAL) as PermissionAction[];

describe('RBAC_RULES', () => {
  it('covers exactly the actions in the Blueprint matrix', () => {
    expect(Object.keys(RBAC_RULES).sort()).toEqual([...ACTIONS].sort());
  });
});

describe('canPerform: global roles with no pod membership', () => {
  for (const action of ACTIONS) {
    for (const role of ROLES) {
      const allowed = EXPECTED_GLOBAL[action].includes(role);
      it(`${role} ${allowed ? 'can' : 'cannot'} ${action}`, () => {
        expect(canPerform({ globalRole: role }, action, 'pod-fe')).toBe(allowed);
      });
    }
  }
});

describe('canPerform: Pod Lead of their own pod', () => {
  const lead: UserContext = { globalRole: 'Pod Lead', userPodRoles: { 'pod-fe': 'Pod Lead' } };

  for (const action of POD_SCOPED) {
    it(`can ${action} in the pod they lead`, () => {
      expect(canPerform(lead, action, 'pod-fe')).toBe(true);
    });
    it(`cannot ${action} in another pod`, () => {
      expect(canPerform(lead, action, 'pod-be')).toBe(false);
    });
  }

  it('cannot create or lead pods, or manage projects, even in their own pod', () => {
    for (const action of ['create_pod', 'assign_pod_lead', 'create_project', 'archive_project', 'assign_project_lead'] as const) {
      expect(canPerform(lead, action, 'pod-fe')).toBe(false);
    }
  });

  it('is allowed pod-scoped actions with no pod given when they lead at least one pod', () => {
    expect(canPerform(lead, 'create_task')).toBe(true);
  });
});

describe('canPerform: pod membership decides pod-scoped rights', () => {
  it('a Contributor made Pod Lead of a pod gets that pod\'s rights', () => {
    const user: UserContext = { globalRole: 'Contributor', userPodRoles: { 'pod-int': 'Pod Lead' } };
    expect(canPerform(user, 'approve_pod_deliverable', 'pod-int')).toBe(true);
    expect(canPerform(user, 'approve_pod_deliverable', 'pod-fe')).toBe(false);
  });

  it('a global Pod Lead who is only a Contributor in this pod gets no pod-scoped rights', () => {
    const user: UserContext = { globalRole: 'Pod Lead', userPodRoles: { 'pod-fe': 'Contributor' } };
    for (const action of POD_SCOPED) {
      expect(canPerform(user, action, 'pod-fe')).toBe(false);
    }
  });

  it('a global Pod Lead who leads no pod gets no pod-scoped rights', () => {
    expect(canPerform({ globalRole: 'Pod Lead' }, 'create_task')).toBe(false);
    expect(canPerform({ globalRole: 'Pod Lead', userPodRoles: {} }, 'create_task', 'pod-fe')).toBe(false);
  });
});
