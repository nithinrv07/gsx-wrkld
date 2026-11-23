import type {
  Ticket as KanbanTicket,
  TicketDependency,
  TicketStatus as KanbanTicketStatus,
  TicketType as KanbanTicketType,
} from '@/types/ticket';
import type {
  Ticket as DashboardTicket,
  TicketStatus as DashboardTicketStatus,
  TicketType as DashboardTicketType,
  PodCode,
  Person,
} from '@/types/dashboard';
import { PEOPLE, PROJECT_RECORDS, TICKETS } from '@/mocks/dashboard-data';
import { MOCK_USERS } from '@/lib/mocks/pod-auth.mock';

export interface ProjectTickets {
  projectSlug: string;
  ticketKeyPrefix: string;
  tickets: KanbanTicket[];
  dependencies: TicketDependency[];
}

export function matchProjectSlug(a: string, b: string): boolean {
  const normA = a.trim().toLowerCase();
  const normB = b.trim().toLowerCase();
  if (normA === normB) return true;
  return (
    (normA === 'wrkld' && normB === 'wrkld-core') ||
    (normA === 'wrkld-core' && normB === 'wrkld')
  );
}

/** Status mapping: Kanban (snake_case) to Dashboard (kebab-case) */
export function toDashboardTicketStatus(status: KanbanTicketStatus): DashboardTicketStatus {
  switch (status) {
    case 'in_progress':
      return 'in-progress';
    case 'pr_open_review':
      return 'pr-review';
    case 'pod_lead_approved':
      return 'pod-lead-approved';
    case 'ready_for_integration':
      return 'ready-for-integration';
    case 'integration_verified':
      return 'integration-verified';
    case 'backlog':
    case 'todo':
    case 'done':
      return status;
    default:
      return 'backlog';
  }
}

/** Status mapping: Dashboard (kebab-case) to Kanban (snake_case) */
export function toKanbanTicketStatus(status: DashboardTicketStatus): KanbanTicketStatus {
  switch (status) {
    case 'in-progress':
      return 'in_progress';
    case 'pr-review':
      return 'pr_open_review';
    case 'pod-lead-approved':
      return 'pod_lead_approved';
    case 'ready-for-integration':
      return 'ready_for_integration';
    case 'integration-verified':
      return 'integration_verified';
    case 'backlog':
    case 'todo':
    case 'done':
      return status;
    default:
      return 'backlog';
  }
}

/** Type mapping: Kanban to Dashboard */
export function toDashboardTicketType(type: KanbanTicketType): DashboardTicketType {
  switch (type) {
    case 'story_domain_task':
      return 'story';
    case 'integration_ticket':
      return 'integration';
    case 'bug_regression':
      return 'bug';
    case 'blocker_flag':
      return 'blocker';
    case 'epic':
      return 'epic';
    default:
      return 'story';
  }
}

/** Type mapping: Dashboard to Kanban */
export function toKanbanTicketType(type: DashboardTicketType): KanbanTicketType {
  switch (type) {
    case 'story':
      return 'story_domain_task';
    case 'integration':
      return 'integration_ticket';
    case 'bug':
      return 'bug_regression';
    case 'blocker':
      return 'blocker_flag';
    case 'epic':
      return 'epic';
    default:
      return 'story_domain_task';
  }
}

/** Pod mapping: podId string to Dashboard PodCode */
export function toDashboardPodCode(podId: string): PodCode {
  const norm = podId.toLowerCase().replace(/^pod-/, '');
  if (norm === 'be' || norm.includes('backend')) return 'BE';
  if (norm === 'int' || norm.includes('integration')) return 'INT';
  if (norm === 'qa' || norm.includes('quality')) return 'QA';
  return 'FE';
}

/** Pod mapping: Dashboard PodCode to Kanban podId */
export function toKanbanPodId(pod: PodCode): string {
  return `pod-${pod.toLowerCase()}`;
}

export function findPersonById(id: string | null | undefined): Person | undefined {
  if (!id) return undefined;
  const personMatch = Object.values(PEOPLE).find((p) => p.id === id);
  if (personMatch) return personMatch;
  const mockUser = MOCK_USERS.find((u) => u.id === id);
  if (mockUser) {
    return {
      id: mockUser.id,
      name: mockUser.name,
      initials: mockUser.name
        .split(' ')
        .map((p) => p[0])
        .join('')
        .slice(0, 2)
        .toUpperCase(),
    };
  }
  return {
    id,
    name: id,
    initials: id.slice(0, 2).toUpperCase(),
  };
}

export function findProjectName(slug: string): string {
  const match = PROJECT_RECORDS.find((p) => matchProjectSlug(p.slug, slug));
  if (match) return match.name;
  return slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/** Convert a Kanban Ticket to a Dashboard Ticket */
export function toDashboardTicket(
  kt: KanbanTicket,
  existing?: DashboardTicket
): DashboardTicket {
  const projectName = existing?.projectName ?? findProjectName(kt.projectSlug);
  const pod = toDashboardPodCode(kt.podId);
  const status = toDashboardTicketStatus(kt.status);
  const type = toDashboardTicketType(kt.type);
  const assignee = kt.assigneeId
    ? (existing?.assignee?.id === kt.assigneeId ? existing.assignee : findPersonById(kt.assigneeId))
    : undefined;
  const severity = existing?.severity ?? (type === 'blocker' ? 'high' : undefined);

  return {
    key: kt.key,
    title: kt.title,
    description: kt.description,
    status,
    type,
    pod,
    projectSlug: kt.projectSlug,
    projectName,
    assignee,
    severity,
    updatedAt: kt.updatedAt,
  };
}

/** Convert a Dashboard Ticket to a Kanban Ticket */
export function toKanbanTicket(dt: DashboardTicket): KanbanTicket {
  return {
    key: dt.key,
    projectSlug: dt.projectSlug,
    podId: toKanbanPodId(dt.pod),
    title: dt.title,
    description: dt.description,
    type: toKanbanTicketType(dt.type),
    status: toKanbanTicketStatus(dt.status),
    assigneeId: dt.assignee?.id ?? null,
    sprintId: null,
    createdAt: dt.updatedAt,
    updatedAt: dt.updatedAt,
  };
}

export function isProjectTickets(value: unknown): value is ProjectTickets {
  if (!value || typeof value !== 'object') return false;
  const v = value as Partial<ProjectTickets>;
  return (
    typeof v.projectSlug === 'string' &&
    typeof v.ticketKeyPrefix === 'string' &&
    Array.isArray(v.tickets) &&
    Array.isArray(v.dependencies)
  );
}

export const KNOWN_PREFIXES: Record<string, string> = {
  wrkld: 'WRK',
  'wrkld-core': 'WRK',
  'telemetry-engine': 'TEL',
  'mobile-pwa': 'MOB',
  'design-system-v2': 'DSV',
  'auth-security': 'SSO',
};

export function seedKanbanProjectsFromDashboard(): ProjectTickets[] {
  const projectMap = new Map<string, ProjectTickets>();

  for (const pr of PROJECT_RECORDS) {
    const slug = pr.slug;
    projectMap.set(slug, {
      projectSlug: slug,
      ticketKeyPrefix: KNOWN_PREFIXES[slug] ?? (slug.replace(/[^a-z]/gi, '').slice(0, 3).toUpperCase() || 'TKT'),
      tickets: [],
      dependencies: [],
    });
  }

  for (const dt of TICKETS) {
    const kt = toKanbanTicket(dt);
    let proj = projectMap.get(dt.projectSlug);
    if (!proj) {
      proj = {
        projectSlug: dt.projectSlug,
        ticketKeyPrefix:
          KNOWN_PREFIXES[dt.projectSlug] ??
          (dt.projectSlug.replace(/[^a-z]/gi, '').slice(0, 3).toUpperCase() || 'TKT'),
        tickets: [],
        dependencies: [],
      };
      projectMap.set(dt.projectSlug, proj);
    }
    proj.tickets.push(kt);
  }

  return Array.from(projectMap.values());
}

/** Safely reads from localStorage without crashing on SSR or disabled storage. */
export function getSafeLocalStorageItem(key: string): string | null {
  if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') {
    return null;
  }
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

/** Safely writes to localStorage without crashing on SSR or disabled storage. */
export function setSafeLocalStorageItem(key: string, value: string): void {
  if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') {
    return;
  }
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Quota exceeded or storage blocked
  }
}

export function getStoredProjectTickets(): ProjectTickets[] | null {
  const raw = getSafeLocalStorageItem('wrkld_local_tickets');
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    return parsed.filter(isProjectTickets);
  } catch {
    return null;
  }
}

/**
 * Returns unified Dashboard tickets:
 * - Starts with the base mock tickets from TICKETS.
 * - If localStorage has stored Kanban tickets, overrides matching records and appends new ones.
 * - Protects against SSR and produces no duplicate keys.
 */
export function getUnifiedDashboardTickets(): DashboardTicket[] {
  const storedProjects = getStoredProjectTickets();

  if (!storedProjects || storedProjects.length === 0) {
    return TICKETS;
  }

  const ticketMap = new Map<string, DashboardTicket>();
  for (const dt of TICKETS) {
    ticketMap.set(dt.key, { ...dt });
  }

  for (const proj of storedProjects) {
    for (const kt of proj.tickets) {
      const existing = ticketMap.get(kt.key);
      const unified = toDashboardTicket(kt, existing);
      ticketMap.set(kt.key, unified);
    }
  }

  return Array.from(ticketMap.values());
}
