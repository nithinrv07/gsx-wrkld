// Module 4 (Task & Issue Management) unit tests.
// Same runner as Module 3: node:test via tsx.
// Run: npx tsx --test src/__tests__/module4.test.ts
// Covers doc 14.2 priority scenarios 2, 3 and 5 at unit level, plus the data layer.
// There is no shared sample data: each test creates the tickets it needs.

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { TICKET_STATUSES, TICKET_TYPES } from '../constants/ticket-lifecycle';
import { getTicketPermissions } from '../features/tickets/lib/ticketPermissions';
import {
  applyTicketFilters,
  linkableUpstreamTickets,
  nextTicketKey,
  validateTicketInput,
} from '../features/tickets/lib/ticketHelpers';
import { TicketsLocalStore, keyPrefixFor } from '../services/api/ticketsLocalStore';
import { ApiError } from '../services/api/ticketsSource';
import type { CreateTicketInput, Ticket } from '../types/ticket';
import type { UserContext } from '../lib/permissions/usePermissions';

const PROJECT = 'test-project';
const POD = 'pod-a';
const OTHER_POD = 'pod-b';

const contributor: UserContext = { globalRole: 'Contributor', userPodRoles: { [POD]: 'Contributor' } };
const podLead: UserContext = { globalRole: 'Pod Lead', userPodRoles: { [POD]: 'Pod Lead' } };
const podLeadElsewhere: UserContext = { globalRole: 'Pod Lead', userPodRoles: { [OTHER_POD]: 'Pod Lead' } };
const projectLead: UserContext = { globalRole: 'Project Lead', userPodRoles: {} };
const superAdmin: UserContext = { globalRole: 'Super Admin', userPodRoles: {} };

const input = (overrides: Partial<CreateTicketInput> = {}): CreateTicketInput => ({
  podId: POD, title: 'A ticket', description: '', type: 'story_domain_task', assigneeId: null, sprintId: null, ...overrides,
});

/** A fresh in-memory store with a few tickets created through the store itself. */
async function storeWithTickets() {
  const store = new TicketsLocalStore();
  const a = await store.createTicket(PROJECT, input({ title: 'Build the card', assigneeId: 'user-1', sprintId: 'sprint-1' }));
  const b = await store.createTicket(PROJECT, input({ title: 'Fix the drop', type: 'bug_regression', assigneeId: 'user-2' }));
  const upstream = await store.createTicket(PROJECT, input({ podId: OTHER_POD, title: 'Publish the endpoint' }));
  return { store, a, b, upstream };
}

describe('Lifecycle and types match the documentation', () => {
  it('has the eight lifecycle states in doc 7.6 order', () => {
    assert.deepEqual(
      TICKET_STATUSES.map((s) => s.label),
      ['Backlog', 'Todo', 'In Progress', 'PR Open / Review', 'Pod Lead Approved', 'Ready for Integration', 'Integration Verified', 'Done']
    );
  });

  it('has the five ticket types named as in the blueprint', () => {
    assert.deepEqual(
      TICKET_TYPES.map((t) => t.label),
      ['Epic', 'Story / Domain Task', 'Integration Ticket', 'Bug / Regression', 'Blocker Flag']
    );
  });
});

describe('Role rules (doc 8.1, scenario 2)', () => {
  it('stops a Contributor moving a ticket to Ready for Integration', () => {
    const p = getTicketPermissions(contributor, POD);
    assert.equal(p.canMoveTo('ready_for_integration'), false);
    assert.match(p.moveBlockedReason('ready_for_integration') ?? '', /Pod Lead/);
  });

  it('stops a Contributor approving (Pod Lead Approved)', () => {
    const p = getTicketPermissions(contributor, POD);
    assert.equal(p.canApprove, false);
    assert.equal(p.canMoveTo('pod_lead_approved'), false);
  });

  it('lets a Contributor move work from Backlog to PR Open / Review', () => {
    const p = getTicketPermissions(contributor, POD);
    for (const s of ['backlog', 'todo', 'in_progress', 'pr_open_review'] as const) assert.equal(p.canMoveTo(s), true, s);
  });

  it('lets the Pod Lead of this pod approve and move to Ready for Integration', () => {
    const p = getTicketPermissions(podLead, POD);
    assert.equal(p.canApprove, true);
    assert.equal(p.canMoveTo('ready_for_integration'), true);
  });

  it('does not let a Pod Lead of another pod approve here (pod scope)', () => {
    const p = getTicketPermissions(podLeadElsewhere, POD);
    assert.equal(p.canApprove, false);
    assert.equal(p.canMoveTo('ready_for_integration'), false);
  });

  it('lets Project Lead and Super Admin approve in any pod', () => {
    assert.equal(getTicketPermissions(projectLead, POD).canApprove, true);
    assert.equal(getTicketPermissions(superAdmin, POD).canApprove, true);
  });

  it('only lets leads create and assign tickets', () => {
    assert.equal(getTicketPermissions(contributor, POD).canCreate, false);
    assert.equal(getTicketPermissions(contributor, POD).canAssign, false);
    assert.equal(getTicketPermissions(podLead, POD).canCreate, true);
  });

  it('lets every role tag "Blocked by" (S1)', () => {
    assert.equal(getTicketPermissions(contributor, POD).canTagBlockedBy, true);
  });
});

describe('Helpers', () => {
  it('filters by assignee, type and sprint', async () => {
    const { store } = await storeWithTickets();
    const tickets = (await store.listProjectTickets(PROJECT)).filter((t) => t.podId === POD);
    assert.deepEqual(applyTicketFilters(tickets, { assignee: 'user-1', type: 'all', sprint: 'all' }).map((t) => t.title), ['Build the card']);
    assert.deepEqual(applyTicketFilters(tickets, { assignee: 'all', type: 'bug_regression', sprint: 'all' }).map((t) => t.title), ['Fix the drop']);
    assert.deepEqual(applyTicketFilters(tickets, { assignee: 'all', type: 'all', sprint: 'none' }).map((t) => t.title), ['Fix the drop']);
  });

  it('creates the next key from the project prefix', () => {
    assert.equal(nextTicketKey('WRK', ['WRK-99', 'WRK-120', 'WRK-7']), 'WRK-121');
    assert.equal(nextTicketKey('CMP', []), 'CMP-1');
    assert.equal(keyPrefixFor('wrkld'), 'WRK');
  });

  it('requires a title (scenario 5)', () => {
    assert.ok(validateTicketInput({ title: '   ' }).title);
    assert.deepEqual(validateTicketInput({ title: 'Fix login' }), {});
  });

  it('only offers upstream tickets from other pods that are not Done (S1)', async () => {
    const { store, a, upstream } = await storeWithTickets();
    const all: Ticket[] = await store.listProjectTickets(PROJECT);
    const options = linkableUpstreamTickets(a, all, []);
    assert.deepEqual(options.map((t) => t.key), [upstream.key]);
    await store.moveTicket(PROJECT, upstream.key, 'done');
    assert.deepEqual(linkableUpstreamTickets(a, await store.listProjectTickets(PROJECT), []), []);
  });
});

describe('Local store (no sample data)', () => {
  it('starts empty for every project', async () => {
    const store = new TicketsLocalStore();
    assert.deepEqual(await store.listProjectTickets('wrkld'), []);
    assert.deepEqual(await store.listDependencies('wrkld'), []);
    assert.deepEqual(await store.listSprints(), []);
  });

  it('creates tickets in Backlog with keys from the project slug', async () => {
    const { a, b } = await storeWithTickets();
    assert.equal(a.status, 'backlog');
    assert.equal(a.key, 'TES-1');
    assert.equal(b.key, 'TES-2');
  });

  it('moves a ticket (scenario 3)', async () => {
    const { store, a } = await storeWithTickets();
    await store.moveTicket(PROJECT, a.key, 'in_progress');
    assert.equal((await store.listProjectTickets(PROJECT)).find((t) => t.key === a.key)?.status, 'in_progress');
  });

  it('refuses a move with 403 and leaves the ticket where it was (scenario 3 rollback)', async () => {
    const { store, a } = await storeWithTickets();
    store.failNextWrite(403);
    await assert.rejects(store.moveTicket(PROJECT, a.key, 'ready_for_integration'), (e: unknown) => e instanceof ApiError && e.status === 403);
    assert.equal((await store.listProjectTickets(PROJECT)).find((t) => t.key === a.key)?.status, 'backlog');
  });

  it('rejects a ticket with no title', async () => {
    const store = new TicketsLocalStore();
    await assert.rejects(store.createTicket(PROJECT, input({ title: ' ' })), (e: unknown) => e instanceof ApiError && e.status === 422);
  });

  it('adds and removes a "Blocked by" link', async () => {
    const { store, a, upstream } = await storeWithTickets();
    await store.addDependency(PROJECT, { ticketKey: a.key, blockedByKey: upstream.key });
    assert.equal((await store.listDependencies(PROJECT)).length, 1);
    await store.removeDependency(PROJECT, { ticketKey: a.key, blockedByKey: upstream.key });
    assert.equal((await store.listDependencies(PROJECT)).length, 0);
  });

  it('keeps projects separate (reuse)', async () => {
    const { store } = await storeWithTickets();
    assert.deepEqual(await store.listProjectTickets('another-project'), []);
  });

  it('two open tabs never overwrite each other (regression)', async () => {
    const mem: Record<string, string> = {};
    const g = globalThis as unknown as { window?: unknown };
    const previous = g.window;
    g.window = { localStorage: { getItem: (k: string) => mem[k] ?? null, setItem: (k: string, v: string) => { mem[k] = v; } } };
    try {
      const tabA = new TicketsLocalStore({ storageKey: 'k' });
      const tabB = new TicketsLocalStore({ storageKey: 'k' });
      await tabA.listProjectTickets(PROJECT);
      await tabB.listProjectTickets(PROJECT);
      const a = await tabA.createTicket(PROJECT, input({ title: 'from A' }));
      const b = await tabB.createTicket(PROJECT, input({ title: 'from B' }));
      assert.notEqual(a.key, b.key, 'keys must be unique');
      const saved = await new TicketsLocalStore({ storageKey: 'k' }).listProjectTickets(PROJECT);
      assert.deepEqual(saved.map((t) => t.title).sort(), ['from A', 'from B']);

      mem['bad'] = '{"unexpected": true}';
      assert.deepEqual(await new TicketsLocalStore({ storageKey: 'bad' }).listProjectTickets(PROJECT), []);
    } finally {
      g.window = previous;
    }
  });

  it('refuses circular "Blocked by" links (regression)', async () => {
    const { store, a, upstream } = await storeWithTickets();
    await store.addDependency(PROJECT, { ticketKey: a.key, blockedByKey: upstream.key });
    await assert.rejects(
      store.addDependency(PROJECT, { ticketKey: upstream.key, blockedByKey: a.key }),
      (e: unknown) => e instanceof ApiError && e.status === 422
    );
    const all = await store.listProjectTickets(PROJECT);
    const deps = await store.listDependencies(PROJECT);
    assert.deepEqual(linkableUpstreamTickets(upstream, all, deps).map((t) => t.key).includes(a.key), false);
  });
});
