import { describe, it, expect, beforeEach } from 'vitest';
import {
  toDashboardTicketStatus,
  toKanbanTicketStatus,
  toDashboardTicketType,
  toKanbanTicketType,
  toDashboardPodCode,
  toKanbanPodId,
  toDashboardTicket,
  toKanbanTicket,
  seedKanbanProjectsFromDashboard,
  getUnifiedDashboardTickets,
  getSafeLocalStorageItem,
  matchProjectSlug,
} from '@/features/tickets/lib/ticketAdapter';
import { TICKETS } from '@/mocks/dashboard-data';
import type { Ticket as KanbanTicket } from '@/types/ticket';

describe('ticketAdapter status mappings', () => {
  it('converts Kanban snake_case statuses to Dashboard kebab-case statuses', () => {
    expect(toDashboardTicketStatus('backlog')).toBe('backlog');
    expect(toDashboardTicketStatus('todo')).toBe('todo');
    expect(toDashboardTicketStatus('in_progress')).toBe('in-progress');
    expect(toDashboardTicketStatus('pr_open_review')).toBe('pr-review');
    expect(toDashboardTicketStatus('pod_lead_approved')).toBe('pod-lead-approved');
    expect(toDashboardTicketStatus('ready_for_integration')).toBe('ready-for-integration');
    expect(toDashboardTicketStatus('integration_verified')).toBe('integration-verified');
    expect(toDashboardTicketStatus('done')).toBe('done');
  });

  it('converts Dashboard kebab-case statuses to Kanban snake_case statuses', () => {
    expect(toKanbanTicketStatus('backlog')).toBe('backlog');
    expect(toKanbanTicketStatus('todo')).toBe('todo');
    expect(toKanbanTicketStatus('in-progress')).toBe('in_progress');
    expect(toKanbanTicketStatus('pr-review')).toBe('pr_open_review');
    expect(toKanbanTicketStatus('pod-lead-approved')).toBe('pod_lead_approved');
    expect(toKanbanTicketStatus('ready-for-integration')).toBe('ready_for_integration');
    expect(toKanbanTicketStatus('integration-verified')).toBe('integration_verified');
    expect(toKanbanTicketStatus('done')).toBe('done');
  });
});

describe('ticketAdapter type mappings', () => {
  it('converts Kanban ticket types to Dashboard types', () => {
    expect(toDashboardTicketType('story_domain_task')).toBe('story');
    expect(toDashboardTicketType('integration_ticket')).toBe('integration');
    expect(toDashboardTicketType('bug_regression')).toBe('bug');
    expect(toDashboardTicketType('blocker_flag')).toBe('blocker');
    expect(toDashboardTicketType('epic')).toBe('epic');
  });

  it('converts Dashboard ticket types to Kanban types', () => {
    expect(toKanbanTicketType('story')).toBe('story_domain_task');
    expect(toKanbanTicketType('integration')).toBe('integration_ticket');
    expect(toKanbanTicketType('bug')).toBe('bug_regression');
    expect(toKanbanTicketType('blocker')).toBe('blocker_flag');
    expect(toKanbanTicketType('epic')).toBe('epic');
  });
});

describe('ticketAdapter pod mappings', () => {
  it('maps pod IDs to Dashboard PodCode', () => {
    expect(toDashboardPodCode('pod-fe')).toBe('FE');
    expect(toDashboardPodCode('fe')).toBe('FE');
    expect(toDashboardPodCode('pod-be')).toBe('BE');
    expect(toDashboardPodCode('be')).toBe('BE');
    expect(toDashboardPodCode('pod-int')).toBe('INT');
    expect(toDashboardPodCode('int')).toBe('INT');
    expect(toDashboardPodCode('pod-qa')).toBe('QA');
    expect(toDashboardPodCode('qa')).toBe('QA');
  });

  it('maps Dashboard PodCode to Kanban podId', () => {
    expect(toKanbanPodId('FE')).toBe('pod-fe');
    expect(toKanbanPodId('BE')).toBe('pod-be');
    expect(toKanbanPodId('INT')).toBe('pod-int');
    expect(toKanbanPodId('QA')).toBe('pod-qa');
  });
});

describe('ticket conversion and preservation', () => {
  it('preserves existing ticket IDs when converting between Kanban and Dashboard', () => {
    const dashboardTicket = TICKETS.find((t) => t.key === 'WRK-104')!;
    const kanbanTicket = toKanbanTicket(dashboardTicket);

    expect(kanbanTicket.key).toBe('WRK-104');
    expect(kanbanTicket.projectSlug).toBe('wrkld');
    expect(kanbanTicket.podId).toBe('pod-fe');
    expect(kanbanTicket.status).toBe('in_progress');
    expect(kanbanTicket.type).toBe('story_domain_task');

    const convertedBack = toDashboardTicket(kanbanTicket, dashboardTicket);
    expect(convertedBack.key).toBe('WRK-104');
    expect(convertedBack.status).toBe('in-progress');
    expect(convertedBack.type).toBe('story');
    expect(convertedBack.pod).toBe('FE');
    expect(convertedBack.projectName).toBe(dashboardTicket.projectName);
  });
});

describe('seedKanbanProjectsFromDashboard', () => {
  it('seeds initial projects and tickets from Dashboard mock records', () => {
    const seeded = seedKanbanProjectsFromDashboard();
    const wrkld = seeded.find((p) => p.projectSlug === 'wrkld');
    expect(wrkld).toBeDefined();
    expect(wrkld!.tickets.length).toBeGreaterThan(0);

    const wrk104 = wrkld!.tickets.find((t) => t.key === 'WRK-104');
    expect(wrk104).toBeDefined();
    expect(wrk104!.title).toBe('Implement login authentication');
    expect(wrk104!.status).toBe('in_progress');
  });
});

describe('getUnifiedDashboardTickets', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('returns baseline TICKETS when localStorage is empty', () => {
    const unified = getUnifiedDashboardTickets();
    expect(unified.length).toBe(TICKETS.length);
    expect(unified.find((t) => t.key === 'WRK-104')?.status).toBe('in-progress');
  });

  it('overrides mock records in place when modified in Kanban (no duplicates)', () => {
    const seeded = seedKanbanProjectsFromDashboard();
    const wrkld = seeded.find((p) => p.projectSlug === 'wrkld')!;
    const wrk104 = wrkld.tickets.find((t) => t.key === 'WRK-104')!;
    wrk104.status = 'done';
    wrk104.title = 'Implement login authentication (COMPLETED)';

    window.localStorage.setItem('wrkld_local_tickets', JSON.stringify(seeded));

    const unified = getUnifiedDashboardTickets();
    // Count of tickets matching WRK-104 must be exactly 1 (no duplicates!)
    const matches = unified.filter((t) => t.key === 'WRK-104');
    expect(matches).toHaveLength(1);
    expect(matches[0].status).toBe('done');
    expect(matches[0].title).toBe('Implement login authentication (COMPLETED)');
  });

  it('adds newly created Kanban tickets into Dashboard tickets', () => {
    const seeded = seedKanbanProjectsFromDashboard();
    const wrkld = seeded.find((p) => p.projectSlug === 'wrkld')!;
    const newBlocker: KanbanTicket = {
      key: 'WRK-999',
      projectSlug: 'wrkld',
      podId: 'pod-fe',
      title: 'Emergency staging gateway 502',
      description: 'Staging cluster down',
      type: 'blocker_flag',
      status: 'in_progress',
      assigneeId: 'usr-4',
      sprintId: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    wrkld.tickets.push(newBlocker);

    window.localStorage.setItem('wrkld_local_tickets', JSON.stringify(seeded));

    const unified = getUnifiedDashboardTickets();
    const added = unified.find((t) => t.key === 'WRK-999');
    expect(added).toBeDefined();
    expect(added!.type).toBe('blocker');
    expect(added!.status).toBe('in-progress');
    expect(added!.severity).toBe('high');
    expect(added!.pod).toBe('FE');
  });
});

describe('SSR safety and matchProjectSlug', () => {
  it('protects against SSR environments without window', () => {
    expect(getSafeLocalStorageItem('test_key')).toBeNull();
  });

  it('matches project slug aliases bidirectionally', () => {
    expect(matchProjectSlug('wrkld', 'wrkld-core')).toBe(true);
    expect(matchProjectSlug('wrkld-core', 'wrkld')).toBe(true);
    expect(matchProjectSlug('ai-analytics', 'ai-analytics')).toBe(true);
    expect(matchProjectSlug('wrkld', 'ai-analytics')).toBe(false);
  });
});
