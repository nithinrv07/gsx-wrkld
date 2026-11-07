import test, { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { SLUG_REGEX, slugify } from '../components/projects/CreateProjectModal';
import {
  checkCanCreateProject,
  checkCanEditProject,
  checkCanCreateSprint,
  isSuperAdmin,
} from '../lib/auth/rbac';
import { mockStorageAdapter } from '../services/api/mockAdapter';

describe('Module 3: Project & Sprint Management Unit Tests', () => {
  describe('RBAC Rules & Permissions', () => {
    it('only allows Super Admin to create projects', () => {
      assert.equal(checkCanCreateProject({ role: 'Super Admin' }), true);
      assert.equal(checkCanCreateProject({ role: 'super admin' }), true);
      assert.equal(checkCanCreateProject({ role: 'Frontend Lead' }), false);
      assert.equal(checkCanCreateProject({ role: 'Pod Lead' }), false);
      assert.equal(checkCanCreateProject({ role: 'Engineer' }), false);
      assert.equal(checkCanCreateProject(null), false);
      assert.equal(checkCanCreateProject(undefined), false);
    });

    it('identifies Super Admin correctly', () => {
      assert.equal(isSuperAdmin('Super Admin'), true);
      assert.equal(isSuperAdmin('super admin'), true);
      assert.equal(isSuperAdmin('Frontend Lead'), false);
      assert.equal(isSuperAdmin(undefined), false);
    });

    it('evaluates project editing permissions accurately', () => {
      // Super Admin can edit any project
      assert.equal(
        checkCanEditProject({ role: 'Super Admin', email: 'admin@wrkld.io' }, 'lead@wrkld.io'),
        true
      );
      // Project lead can edit their own project
      assert.equal(
        checkCanEditProject({ role: 'Frontend Lead', email: 'shwetha@wrkld.io' }, 'shwetha@wrkld.io'),
        true
      );
      // Frontend Lead / Pod Lead can edit projects in their domain
      assert.equal(
        checkCanEditProject({ role: 'Frontend Lead', email: 'shwetha@wrkld.io' }, 'other@wrkld.io'),
        true
      );
      assert.equal(
        checkCanEditProject({ role: 'Pod Lead', email: 'arun@wrkld.io' }, 'other@wrkld.io'),
        true
      );
      // Engineer / Viewer cannot edit
      assert.equal(
        checkCanEditProject({ role: 'Engineer', email: 'dev@wrkld.io' }, 'other@wrkld.io'),
        false
      );
      assert.equal(
        checkCanEditProject({ role: 'Viewer', email: 'view@wrkld.io' }, 'other@wrkld.io'),
        false
      );
    });

    it('evaluates sprint creation permissions', () => {
      assert.equal(checkCanCreateSprint({ role: 'Super Admin' }), true);
      assert.equal(checkCanCreateSprint({ role: 'Frontend Lead' }), true);
      assert.equal(checkCanCreateSprint({ role: 'Pod Lead' }), true);
      assert.equal(checkCanCreateSprint({ role: 'Engineer' }), false);
      assert.equal(checkCanCreateSprint({ role: 'Viewer' }), false);
    });
  });

  describe('Project Slug Utilities & Validation', () => {
    it('correctly slugifies user project names', () => {
      assert.equal(slugify('Wrkld Core Platform'), 'wrkld-core-platform');
      assert.equal(slugify('  Real-time Kanban Sync! '), 'real-time-kanban-sync');
      assert.equal(slugify('Mobile PWA v2.0'), 'mobile-pwa-v20');
      assert.equal(slugify('Design   System -- Modern'), 'design-system-modern');
    });

    it('validates slug format with SLUG_REGEX', () => {
      assert.equal(SLUG_REGEX.test('wrkld-core'), true);
      assert.equal(SLUG_REGEX.test('kanban-sync-v2'), true);
      assert.equal(SLUG_REGEX.test('project123'), true);
      assert.equal(SLUG_REGEX.test('invalid slug with spaces'), false);
      assert.equal(SLUG_REGEX.test('UPPERCASE-SLUG'), false);
      assert.equal(SLUG_REGEX.test('-leading-dash'), false);
      assert.equal(SLUG_REGEX.test('trailing-dash-'), false);
      assert.equal(SLUG_REGEX.test('double--dash'), false);
      assert.equal(SLUG_REGEX.test('special@character'), false);
    });
  });

  describe('Mock Adapter Data Layer: Projects & Sprints CRUD', () => {
    test('fetches all initial projects', async () => {
      const projects = await mockStorageAdapter.getProjects();
      assert.ok(projects.length >= 6);
      const core = projects.find((p) => p.slug === 'wrkld-core');
      assert.ok(core);
      assert.equal(core.name, 'Wrkld Core Platform');
      assert.equal(core.projectLead.name, 'Shwetha V');
    });

    test('fetches project by id and slug', async () => {
      const bySlug = await mockStorageAdapter.getProjectBySlug('wrkld-core');
      assert.ok(bySlug);
      assert.equal(bySlug.id, 'prj-101');

      const byId = await mockStorageAdapter.getProjectById('prj-101');
      assert.ok(byId);
      assert.equal(byId.slug, 'wrkld-core');
    });

    test('searches projects by query string', async () => {
      const results = await mockStorageAdapter.getProjects({ search: 'kanban' });
      assert.ok(results.length >= 1);
      assert.ok(results.some((p) => p.slug === 'kanban-sync'));

      const leadSearch = await mockStorageAdapter.getProjects({ search: 'Shwetha' });
      assert.ok(leadSearch.length >= 1);
      assert.ok(leadSearch.some((p) => p.projectLead.name === 'Shwetha V'));
    });

    test('filters projects by status', async () => {
      const active = await mockStorageAdapter.getProjects({ status: 'active' });
      assert.ok(active.length >= 1);
      assert.ok(active.every((p) => p.status === 'active'));

      const planning = await mockStorageAdapter.getProjects({ status: 'planning' });
      assert.ok(planning.length >= 1);
      assert.ok(planning.every((p) => p.status === 'planning'));
    });

    test('checks slug uniqueness properly', async () => {
      const isCoreUnique = await mockStorageAdapter.isSlugUnique('wrkld-core');
      assert.equal(isCoreUnique, false, 'wrkld-core already exists so should not be unique');

      const isBrandNewUnique = await mockStorageAdapter.isSlugUnique('brand-new-project-slug-1234');
      assert.equal(isBrandNewUnique, true, 'brand new slug should be unique');
    });

    test('creates a new project and retrieves it by slug', async () => {
      const uniqueSlug = `test-prj-${Date.now()}`;
      const created = await mockStorageAdapter.createProject({
        name: 'Automated Test Project',
        slug: uniqueSlug,
        description: 'Created during test run',
        targetDate: '2026-12-31',
        status: 'planning',
        projectLead: {
          name: 'Shwetha V',
          email: 'shwetha@wrkld.io',
        },
      });

      assert.equal(created.slug, uniqueSlug);
      assert.equal(created.name, 'Automated Test Project');

      const fetched = await mockStorageAdapter.getProjectBySlug(uniqueSlug);
      assert.equal(fetched.name, 'Automated Test Project');
      assert.equal(fetched.status, 'planning');
    });

    test('updates an existing project by slug or by id', async () => {
      const updated = await mockStorageAdapter.updateProject('wrkld-core', {
        name: 'Wrkld Core Platform Updated',
        status: 'on-track',
      });

      assert.equal(updated.name, 'Wrkld Core Platform Updated');
      assert.equal(updated.status, 'on-track');

      const fetched = await mockStorageAdapter.getProjectBySlug('wrkld-core');
      assert.equal(fetched.name, 'Wrkld Core Platform Updated');

      // Update by ID
      const updatedById = await mockStorageAdapter.updateProject('prj-101', {
        description: 'Updated via project ID',
      });
      assert.equal(updatedById.description, 'Updated via project ID');
    });

    test('fetches sprints for a project by slug and id', async () => {
      const sprintsBySlug = await mockStorageAdapter.getSprintsByProject('wrkld-core');
      assert.ok(sprintsBySlug.length >= 3);
      assert.ok(sprintsBySlug.some((s) => s.name.includes('Sprint 1')));
      assert.ok(sprintsBySlug.some((s) => s.name.includes('Sprint 2')));

      const sprintsById = await mockStorageAdapter.getSprintsByProject('prj-101');
      assert.ok(sprintsById.length >= 3);
    });

    test('creates a sprint with valid date range', async () => {
      const created = await mockStorageAdapter.createSprint('wrkld-core', {
        name: 'Sprint 99 — Automated Test Sprint',
        startDate: '2026-11-01',
        endDate: '2026-11-15',
        status: 'planning',
        goal: 'Verify sprint creation via mock adapter',
      });

      assert.ok(created.id);
      assert.equal(created.name, 'Sprint 99 — Automated Test Sprint');
      assert.equal(created.projectId, 'wrkld-core');

      const sprints = await mockStorageAdapter.getSprintsByProject('wrkld-core');
      assert.ok(sprints.some((s) => s.id === created.id));
    });

    test('rejects sprint creation when endDate is before or equal to startDate', async () => {
      await assert.rejects(
        async () => {
          await mockStorageAdapter.createSprint('wrkld-core', {
            name: 'Invalid Sprint',
            startDate: '2026-11-15',
            endDate: '2026-11-01', // Before start
            status: 'planning',
          });
        },
        {
          message: 'End date must be strictly after the start date.',
        }
      );

      await assert.rejects(
        async () => {
          await mockStorageAdapter.createSprint('wrkld-core', {
            name: 'Equal Date Sprint',
            startDate: '2026-11-15',
            endDate: '2026-11-15', // Same day
            status: 'planning',
          });
        },
        {
          message: 'End date must be strictly after the start date.',
        }
      );
    });
  });
});
