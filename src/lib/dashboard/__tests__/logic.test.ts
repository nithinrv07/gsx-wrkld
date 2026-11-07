import { describe, expect, it } from 'vitest';
import { can } from '../permissions';
import { countByPhase } from '../meta';
import { dashboardRoutes } from '../routes';
import { counts } from '@/test/fixtures';

describe('can (role-aware UI rules)', () => {
  it('only lets project leads and super admins create projects', () => {
    expect(can('contributor', 'projects:create')).toBe(false);
    expect(can('pod-lead', 'projects:create')).toBe(false);
    expect(can('project-lead', 'projects:create')).toBe(true);
    expect(can('super-admin', 'projects:create')).toBe(true);
  });

  it('hides the review queue from contributors', () => {
    expect(can('contributor', 'tickets:view-review-queue')).toBe(false);
    expect(can('pod-lead', 'tickets:view-review-queue')).toBe(true);
  });

  it('limits workspace-wide project visibility to super admins', () => {
    expect(can('project-lead', 'projects:view-all')).toBe(false);
    expect(can('super-admin', 'projects:view-all')).toBe(true);
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
  it('builds ticket and analytics links', () => {
    expect(dashboardRoutes.ticket({ projectSlug: 'wrkld-platform', key: 'WRK-104' })).toBe(
      '/projects/wrkld-platform?ticket=WRK-104'
    );
    expect(dashboardRoutes.analytics('ai-analytics', 'QA')).toBe('/analytics?project=ai-analytics&pod=QA');
    expect(dashboardRoutes.analytics()).toBe('/analytics');
  });
});
