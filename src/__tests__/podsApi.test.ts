// Pods data layer (M9): listing, project scoping and pod creation rules.

import { beforeEach, describe, expect, it } from 'vitest';
import { podsApi, POD_STORAGE_KEY, podIdFor } from '../services/api/podsApi';
import { createPodSchema } from '../features/pods/CreatePodModal';
import { PROJECT_RECORDS, TICKETS } from '../mocks/dashboard-data';
import { INITIAL_PROJECTS as PROJECT_FIXTURES } from '../services/fixtures/projects';
import { matchProjectSlug } from '../features/tickets/lib/ticketAdapter';

beforeEach(() => {
  window.localStorage.removeItem(POD_STORAGE_KEY);
});

describe('podsApi.listPods', () => {
  it('returns the built-in pods for the main project under either slug', async () => {
    const a = await podsApi.listPods('wrkld-core');
    const b = await podsApi.listPods('wrkld');
    expect(a.map((p) => p.type).sort()).toEqual(['BE', 'FE', 'INT', 'QA']);
    expect(b).toEqual(a);
  });

  it('returns no pods for a project that has none yet', async () => {
    expect(await podsApi.listPods('kanban-sync')).toEqual([]);
  });
});

describe('podsApi.createPod', () => {
  it('creates a pod with its lead as the first member and persists it', async () => {
    const pod = await podsApi.createPod('kanban-sync', { name: '  Sync Frontend  ', type: 'FE', leadId: 'usr-4' });

    expect(pod).toMatchObject({
      id: 'pod-fe',
      projectSlug: 'kanban-sync',
      name: 'Sync Frontend',
      type: 'FE',
      leadId: 'usr-4',
      leadName: 'Megha I',
      memberCount: 1,
    });
    expect(pod.members[0]).toMatchObject({ userId: 'usr-4', roleInPod: 'Pod Lead' });

    expect(await podsApi.listPods('kanban-sync')).toHaveLength(1);
    expect(JSON.parse(window.localStorage.getItem(POD_STORAGE_KEY) ?? '[]')).toHaveLength(1);
  });

  it('creates a pod with no lead and no members', async () => {
    const pod = await podsApi.createPod('kanban-sync', { name: 'QA Pod', type: 'QA', leadId: null });
    expect(pod).toMatchObject({ leadId: null, memberCount: 0, members: [] });
    expect(pod.leadName).toBeUndefined();
  });

  it('rejects a second pod of the same type in a project', async () => {
    await podsApi.createPod('kanban-sync', { name: 'Backend Pod', type: 'BE', leadId: null });
    await expect(
      podsApi.createPod('kanban-sync', { name: 'Backend Pod 2', type: 'BE', leadId: null })
    ).rejects.toThrow('already has a Backend pod');
  });

  it('rejects a type the main project already has from the built-in pods', async () => {
    await expect(
      podsApi.createPod('wrkld-core', { name: 'Another FE', type: 'FE', leadId: null })
    ).rejects.toThrow('already has a Frontend pod');
  });

  it('rejects an unknown lead and a too-short name', async () => {
    await expect(
      podsApi.createPod('kanban-sync', { name: 'Integration', type: 'INT', leadId: 'usr-999' })
    ).rejects.toThrow('Pod Lead was not found');
    await expect(
      podsApi.createPod('kanban-sync', { name: 'ab', type: 'INT', leadId: null })
    ).rejects.toThrow('at least 3 characters');
  });
});

describe('podsApi.getPod is scoped to the project', () => {
  it('does not confuse pod-fe in two different projects', async () => {
    await podsApi.createPod('kanban-sync', { name: 'Sync Frontend', type: 'FE', leadId: null });

    const created = await podsApi.getPod('kanban-sync', 'pod-fe');
    const builtIn = await podsApi.getPod('wrkld-core', 'pod-fe');

    expect(created?.name).toBe('Sync Frontend');
    expect(builtIn?.name).toBe('Frontend Pod');
    expect(await podsApi.getPod('no-such-project', 'pod-fe')).toBeNull();
  });

  it('accepts the pod type as the id too', async () => {
    expect((await podsApi.getPod('wrkld-core', 'fe'))?.id).toBe(podIdFor('FE'));
  });
});

describe('createPodSchema', () => {
  it('requires a name of at least 3 characters and a valid type', () => {
    expect(createPodSchema.safeParse({ name: 'FE Pod', type: 'FE', leadId: '' }).success).toBe(true);
    expect(createPodSchema.safeParse({ name: '  ', type: 'FE', leadId: '' }).success).toBe(false);
    expect(createPodSchema.safeParse({ name: 'ab', type: 'FE', leadId: '' }).success).toBe(false);
    expect(createPodSchema.safeParse({ name: 'Pod', type: 'XX', leadId: '' }).success).toBe(false);
  });
});

// One set of sample projects: whatever the dashboard shows must exist on the
// Projects page and have pod boards, so no dashboard link leads to "not found".
describe('sample data: dashboard, Projects page and pods agree', () => {
  it('every dashboard project exists on the Projects page', () => {
    for (const r of PROJECT_RECORDS) {
      expect(PROJECT_FIXTURES.some((p) => matchProjectSlug(p.slug, r.slug)), r.slug).toBe(true);
    }
  });

  it('every dashboard pod has a pod page with the same lead', async () => {
    for (const r of PROJECT_RECORDS) {
      for (const p of r.pods) {
        const pod = await podsApi.getPod(r.slug, podIdFor(p.pod));
        expect(pod, `${r.slug}/${p.pod}`).not.toBeNull();
        expect(pod?.leadName ?? undefined).toBe(p.lead?.name);
      }
    }
  });

  it('every dashboard ticket opens an existing pod board', async () => {
    for (const t of TICKETS) {
      expect(await podsApi.getPod(t.projectSlug, podIdFor(t.pod)), `${t.key}`).not.toBeNull();
    }
  });
});
