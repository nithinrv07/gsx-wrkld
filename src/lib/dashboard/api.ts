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
import { DashboardSummary, ProjectAnalytics, ProjectSummary, StatusCounts, Ticket, Viewer } from '@/types/dashboard';
import { OVERALL_PROGRESS, PROJECT_RECORDS, projectStatusCounts } from '@/mocks/dashboard-data';
import { can } from './permissions';
import { mockStorageAdapter } from '@/services/api/mockAdapter';
import { getUnifiedDashboardTickets, matchProjectSlug } from '@/features/tickets/lib/ticketAdapter';

export { matchProjectSlug };

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
  const allTickets = getUnifiedDashboardTickets();
  const projects = empty ? [] : visibleProjects(viewer);
  const slugs = new Set(projects.map((p) => p.slug));
  const mine = empty ? [] : allTickets.filter(isMine(viewer));
  const inScope = (t: Ticket) => !empty && slugs.has(t.projectSlug);

  const summaries: ProjectSummary[] = projects.map((p) => ({
    slug: p.slug,
    name: p.name,
    status: p.status,
    progress: p.progress,
    lead: p.lead,
    myTicketCount: mine.filter((t) => matchProjectSlug(t.projectSlug, p.slug) && isOpen(t)).length,
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
      openBlockers: allTickets.filter((t) => inScope(t) && t.type === 'blocker' && isOpen(t)).length,
      // Pod Leads see their own pod's review queue; Project Leads and above see all pods.
      awaitingReview: can(viewer.role, 'tickets:view-review-queue')
        ? allTickets.filter(
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
  const allTickets = getUnifiedDashboardTickets();
  return allTickets.filter(isMine(viewer)).sort((a, b) =>
    b.updatedAt.localeCompare(a.updatedAt)
  );
}

/** Open, manually created Blocker Flag tickets. No automatic escalation (out of MVP scope). */
export async function fetchOpenBlockers(viewer: Viewer): Promise<Ticket[]> {
  const { empty } = await simulate('alerts');
  if (empty) return [];
  const allTickets = getUnifiedDashboardTickets();
  const slugs = new Set(visibleProjects(viewer).map((p) => p.slug));
  return allTickets.filter((t) => t.type === 'blocker' && isOpen(t) && slugs.has(t.projectSlug)).sort((a, b) =>
    b.updatedAt.localeCompare(a.updatedAt)
  );
}

function toDashboardProjectStatus(status: string): import('@/types/dashboard').ProjectStatus {
  if (status === 'on-track') return 'active';
  if (status === 'completed' || status === 'blocked' || status === 'in-progress' || status === 'planning') {
    return status;
  }
  return 'active';
}

export async function fetchProjectAnalytics(slug: string, viewer: Viewer): Promise<ProjectAnalytics> {
  const { empty } = await simulate('analytics');
  const allTickets = getUnifiedDashboardTickets();
  let record = visibleProjects(viewer).find((p) => matchProjectSlug(p.slug, slug));
  if (!record && !empty) {
    try {
      const proj = await mockStorageAdapter.getProjectBySlug(slug);
      if (proj) {
        record = {
          slug: proj.slug,
          name: proj.name,
          status: toDashboardProjectStatus(proj.status),
          progress: 0,
          lead: { id: 'lead', name: proj.projectLead.name, initials: proj.projectLead.initials },
          memberIds: [viewer.id],
          pods: [
            { pod: 'FE', progress: 0, statusCounts: { backlog: 0, todo: 0, 'in-progress': 0, 'pr-review': 0, 'pod-lead-approved': 0, 'ready-for-integration': 0, 'integration-verified': 0, done: 0 } },
            { pod: 'BE', progress: 0, statusCounts: { backlog: 0, todo: 0, 'in-progress': 0, 'pr-review': 0, 'pod-lead-approved': 0, 'ready-for-integration': 0, 'integration-verified': 0, done: 0 } },
            { pod: 'INT', progress: 0, statusCounts: { backlog: 0, todo: 0, 'in-progress': 0, 'pr-review': 0, 'pod-lead-approved': 0, 'ready-for-integration': 0, 'integration-verified': 0, done: 0 } },
            { pod: 'QA', progress: 0, statusCounts: { backlog: 0, todo: 0, 'in-progress': 0, 'pr-review': 0, 'pod-lead-approved': 0, 'ready-for-integration': 0, 'integration-verified': 0, done: 0 } },
          ],
        };
      }
    } catch {
      // Not found in storage adapter either
    }
  }
  if (empty || !record) throw new ApiError('Project not found or you do not have access to it.', 404);
  const { memberIds: _members, ...rest } = record;
  void _members;

  const projectTickets = allTickets.filter((t) => matchProjectSlug(t.projectSlug, slug));
  const updatedPods = rest.pods.map((p) => {
    const podTickets = projectTickets.filter((t) => t.pod === p.pod);
    if (podTickets.length === 0) return p;
    const podCounts: StatusCounts = {
      backlog: 0,
      todo: 0,
      'in-progress': 0,
      'pr-review': 0,
      'pod-lead-approved': 0,
      'ready-for-integration': 0,
      'integration-verified': 0,
      done: 0,
    };
    for (const t of podTickets) {
      if (podCounts[t.status] !== undefined) podCounts[t.status]++;
    }
    return {
      ...p,
      statusCounts: podCounts,
    };
  });

  const computedStatusCounts: StatusCounts = projectTickets.length > 0
    ? updatedPods.reduce((acc, p) => {
        (Object.keys(acc) as (keyof StatusCounts)[]).forEach((k) => (acc[k] += p.statusCounts[k]));
        return acc;
      }, {
        backlog: 0,
        todo: 0,
        'in-progress': 0,
        'pr-review': 0,
        'pod-lead-approved': 0,
        'ready-for-integration': 0,
        'integration-verified': 0,
        done: 0,
      })
    : projectStatusCounts(record);

  return {
    ...rest,
    pods: updatedPods,
    statusCounts: computedStatusCounts,
    myTicketCount: allTickets.filter((t) => matchProjectSlug(t.projectSlug, slug) && isMine(viewer)(t) && isOpen(t)).length,
  };
}

export async function fetchProjectTickets(slug: string, viewer: Viewer): Promise<Ticket[]> {
  await simulate('analytics');
  if (!visibleProjects(viewer).some((p) => matchProjectSlug(p.slug, slug))) return [];
  const allTickets = getUnifiedDashboardTickets();
  return allTickets.filter((t) => matchProjectSlug(t.projectSlug, slug));
}
