/**
 * Dashboard data access. Currently backed by mock data with simulated latency.
 * Replace each function body with a fetch to the confirmed backend endpoint;
 * components only depend on the return types.
 *
 * Dev helpers — append to the URL to preview states:
 *   ?mock=error          every dashboard request fails
 *   ?mock=error:alerts   only the blocker alerts request fails
 *   ?mock=empty          the user has no projects, tickets or blockers
 *   ?mock=slow           3s latency to inspect loading skeletons
 */
import {
  DashboardSummary,
  ProjectAnalytics,
  ProjectSummary,
  Role,
  Ticket,
} from '@/types/dashboard';
import {
  MOCK_USER,
  OVERALL_PROGRESS,
  PROJECT_RECORDS,
  TICKETS,
  projectStatusCounts,
} from '@/mocks/dashboard-data';
import { can } from './permissions';

export class ApiError extends Error {
  constructor(message: string, public status = 500) {
    super(message);
    this.name = 'ApiError';
  }
}

type Resource = 'summary' | 'tickets' | 'alerts' | 'analytics';

function mockMode(): string {
  if (typeof window === 'undefined') return '';
  return new URLSearchParams(window.location.search).get('mock') ?? '';
}

async function simulate(resource: Resource) {
  const mode = mockMode();
  await new Promise((r) => setTimeout(r, mode === 'slow' ? 3000 : 450 + Math.random() * 300));
  if (mode === 'error' || mode === `error:${resource}`) {
    throw new ApiError(`Could not load ${resource}. The server did not respond.`, 503);
  }
  return { empty: mode === 'empty' };
}

const visibleProjects = (role: Role, userId: string) =>
  PROJECT_RECORDS.filter((p) => can(role, 'projects:view-all') || p.memberIds.includes(userId));

const isOpen = (t: Ticket) => t.status !== 'done';

export async function fetchDashboardSummary(role: Role): Promise<DashboardSummary> {
  const { empty } = await simulate('summary');
  const user = { ...MOCK_USER, role };
  const projects = empty ? [] : visibleProjects(role, user.id);
  const slugs = new Set(projects.map((p) => p.slug));
  const mine = empty ? [] : TICKETS.filter((t) => t.assignee?.id === user.id);

  const summaries: ProjectSummary[] = projects.map((p) => ({
    slug: p.slug,
    name: p.name,
    status: p.status,
    progress: p.progress,
    lead: p.lead,
    myTicketCount: mine.filter((t) => t.projectSlug === p.slug && isOpen(t)).length,
  }));

  return {
    user,
    overallProgress: empty
      ? 0
      : can(role, 'projects:view-all')
      ? OVERALL_PROGRESS.workspace
      : OVERALL_PROGRESS.member,
    stats: {
      projects: summaries.length,
      assignedTickets: mine.filter(isOpen).length,
      openBlockers: TICKETS.filter(
        (t) => !empty && t.type === 'blocker' && isOpen(t) && slugs.has(t.projectSlug)
      ).length,
      awaitingReview: can(role, 'tickets:view-review-queue')
        ? TICKETS.filter(
            (t) => !empty && t.status === 'pr-review' && slugs.has(t.projectSlug) && t.pod === user.pod
          ).length
        : undefined,
    },
    projects: summaries,
  };
}

export async function fetchMyTickets(role: Role): Promise<Ticket[]> {
  const { empty } = await simulate('tickets');
  void role;
  if (empty) return [];
  return TICKETS.filter((t) => t.assignee?.id === MOCK_USER.id && t.type !== 'blocker').sort(
    (a, b) => b.updatedAt.localeCompare(a.updatedAt)
  );
}

/** Open, manually created Blocker Flag tickets. No automatic escalation (out of MVP scope). */
export async function fetchOpenBlockers(role: Role): Promise<Ticket[]> {
  const { empty } = await simulate('alerts');
  if (empty) return [];
  const slugs = new Set(visibleProjects(role, MOCK_USER.id).map((p) => p.slug));
  return TICKETS.filter((t) => t.type === 'blocker' && isOpen(t) && slugs.has(t.projectSlug)).sort(
    (a, b) => b.updatedAt.localeCompare(a.updatedAt)
  );
}

export async function fetchProjectAnalytics(slug: string, role: Role): Promise<ProjectAnalytics> {
  const { empty } = await simulate('analytics');
  const record = visibleProjects(role, MOCK_USER.id).find((p) => p.slug === slug);
  if (empty || !record) throw new ApiError('Project not found or you do not have access to it.', 404);
  const { memberIds: _members, ...rest } = record;
  void _members;
  return {
    ...rest,
    statusCounts: projectStatusCounts(record),
    myTicketCount: TICKETS.filter(
      (t) => t.projectSlug === slug && t.assignee?.id === MOCK_USER.id && isOpen(t)
    ).length,
  };
}

export async function fetchProjectTickets(slug: string, role: Role): Promise<Ticket[]> {
  await simulate('analytics');
  void role;
  return TICKETS.filter((t) => t.projectSlug === slug);
}
