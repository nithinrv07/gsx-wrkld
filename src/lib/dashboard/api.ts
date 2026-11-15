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
import { DashboardSummary, ProjectAnalytics, ProjectSummary, Ticket, Viewer } from '@/types/dashboard';
import { OVERALL_PROGRESS, PROJECT_RECORDS, TICKETS, projectStatusCounts } from '@/mocks/dashboard-data';
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

const visibleProjects = (viewer: Viewer) =>
  PROJECT_RECORDS.filter((p) => can(viewer.role, 'projects:view-all') || p.memberIds.includes(viewer.id));

const isOpen = (t: Ticket) => t.status !== 'done';
const isMine = (viewer: Viewer) => (t: Ticket) => t.assignee?.id === viewer.id;

export async function fetchDashboardSummary(viewer: Viewer): Promise<DashboardSummary> {
  const { empty } = await simulate('summary');
  const projects = empty ? [] : visibleProjects(viewer);
  const slugs = new Set(projects.map((p) => p.slug));
  const mine = empty ? [] : TICKETS.filter(isMine(viewer));
  const inScope = (t: Ticket) => !empty && slugs.has(t.projectSlug);

  const summaries: ProjectSummary[] = projects.map((p) => ({
    slug: p.slug,
    name: p.name,
    status: p.status,
    progress: p.progress,
    lead: p.lead,
    myTicketCount: mine.filter((t) => t.projectSlug === p.slug && isOpen(t)).length,
  }));

  return {
    overallProgress: empty
      ? 0
      : can(viewer.role, 'projects:view-all')
      ? OVERALL_PROGRESS.workspace
      : OVERALL_PROGRESS.member,
    stats: {
      projects: summaries.length,
      assignedTickets: mine.filter(isOpen).length,
      openBlockers: TICKETS.filter((t) => inScope(t) && t.type === 'blocker' && isOpen(t)).length,
      // Pod Leads see their own pod's review queue; Project Leads and above see all pods.
      awaitingReview: can(viewer.role, 'tickets:view-review-queue')
        ? TICKETS.filter(
            (t) =>
              inScope(t) &&
              t.status === 'pr-review' &&
              (viewer.role !== 'Pod Lead' || t.pod === viewer.pod)
          ).length
        : undefined,
    },
    projects: summaries,
  };
}

export async function fetchMyTickets(viewer: Viewer): Promise<Ticket[]> {
  const { empty } = await simulate('tickets');
  if (empty) return [];
  return TICKETS.filter(isMine(viewer)).sort((a, b) =>
    b.updatedAt.localeCompare(a.updatedAt)
  );
}

/** Open, manually created Blocker Flag tickets. No automatic escalation (out of MVP scope). */
export async function fetchOpenBlockers(viewer: Viewer): Promise<Ticket[]> {
  const { empty } = await simulate('alerts');
  if (empty) return [];
  const slugs = new Set(visibleProjects(viewer).map((p) => p.slug));
  return TICKETS.filter((t) => t.type === 'blocker' && isOpen(t) && slugs.has(t.projectSlug)).sort((a, b) =>
    b.updatedAt.localeCompare(a.updatedAt)
  );
}

export async function fetchProjectAnalytics(slug: string, viewer: Viewer): Promise<ProjectAnalytics> {
  const { empty } = await simulate('analytics');
  const record = visibleProjects(viewer).find((p) => p.slug === slug);
  if (empty || !record) throw new ApiError('Project not found or you do not have access to it.', 404);
  const { memberIds: _members, ...rest } = record;
  void _members;
  return {
    ...rest,
    statusCounts: projectStatusCounts(record),
    myTicketCount: TICKETS.filter((t) => t.projectSlug === slug && isMine(viewer)(t) && isOpen(t)).length,
  };
}

export async function fetchProjectTickets(slug: string, viewer: Viewer): Promise<Ticket[]> {
  await simulate('analytics');
  if (!visibleProjects(viewer).some((p) => p.slug === slug)) return [];
  return TICKETS.filter((t) => t.projectSlug === slug);
}
