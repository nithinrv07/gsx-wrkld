import { describe, expect, it } from 'vitest';
import { can } from '../permissions';
import { countByPhase } from '../meta';
import { dashboardRoutes } from '../routes';
import { counts } from '@/test/fixtures';

describe('can (role-aware UI rules)', () => {
  it('follows the shared RBAC matrix: only Super Admins create projects', () => {
    expect(can('Contributor', 'create_project')).toBe(false);
    expect(can('Pod Lead', 'create_project')).toBe(false);
    expect(can('Project Lead', 'create_project')).toBe(false);
    expect(can('Super Admin', 'create_project')).toBe(true);
  });

  it('lets every role flag a blocker (shared rule)', () => {
    expect(can('Contributor', 'flag_blocker')).toBe(true);
  });

  it('hides the review queue from contributors', () => {
    expect(can('Contributor', 'tickets:view-review-queue')).toBe(false);
    expect(can('Pod Lead', 'tickets:view-review-queue')).toBe(true);
  });

  it('limits workspace-wide project visibility to super admins', () => {
    expect(can('Project Lead', 'projects:view-all')).toBe(false);
    expect(can('Super Admin', 'projects:view-all')).toBe(true);
  });
});

describe('countByPhase', () => {
  it('groups the eight statuses into not started / in flight / done', () => {
    const result = countByPhase(
      counts({ backlog: 2, todo: 1, 'in-progress': 3, 'pr-review': 1, 'integration-verified': 1, done: 5 })
    );
    expect(result).toEqual({ 'not-started': 3, 'in-flight': 5, done: 5, total: 13 });
  });
});

describe('dashboardRoutes', () => {
  it('builds ticket, pod board and project links', () => {
    expect(dashboardRoutes.ticket({ projectSlug: 'wrkld', pod: 'FE', key: 'WRK-104' })).toBe(
      '/projects/wrkld/pods/pod-fe?ticket=WRK-104'
    );
    expect(dashboardRoutes.podBoard('wrkld', 'INT')).toBe('/projects/wrkld/pods/pod-int');
    expect(dashboardRoutes.project('ai-analytics')).toBe('/projects/ai-analytics');
  });
});
