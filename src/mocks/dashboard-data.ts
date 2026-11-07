/**
 * Mock backend records for the Dashboard & Analytics module.
 * Illustrative data only. Progress percentages here stand in for values the
 * backend will supply; the frontend displays them as-is.
 */
import {
  CurrentUser,
  PodCode,
  PodProgress,
  ProjectAnalytics,
  Person,
  StatusCounts,
  Ticket,
} from '@/types/dashboard';

const person = (id: string, name: string): Person => ({
  id,
  name,
  initials: name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase(),
});

export const PEOPLE = {
  shwetha: person('u-shwetha', 'Shwetha V'),
  nithin: person('u-nithin', 'Nithin R'),
  arun: person('u-arun', 'Arun K'),
  priya: person('u-priya', 'Priya M'),
  divya: person('u-divya', 'Divya R'),
  megha: person('u-megha', 'Megha I'),
  edwin: person('u-edwin', 'Edwin A'),
};

export const MOCK_USER: CurrentUser = {
  ...PEOPLE.shwetha,
  email: 'shwetha@wrkld.io',
  title: 'Frontend Lead',
  role: 'pod-lead',
  pod: 'FE',
};

/** Order: backlog, todo, in-progress, pr-review, pod-lead-approved, ready-for-integration, integration-verified, done */
type CountTuple = [number, number, number, number, number, number, number, number];

const counts = (t: CountTuple): StatusCounts => ({
  backlog: t[0],
  todo: t[1],
  'in-progress': t[2],
  'pr-review': t[3],
  'pod-lead-approved': t[4],
  'ready-for-integration': t[5],
  'integration-verified': t[6],
  done: t[7],
});

const pod = (code: PodCode, progress: number, t: CountTuple, lead?: Person): PodProgress => ({
  pod: code,
  progress,
  lead,
  statusCounts: counts(t),
});

/** Project-level counts are the backend's tally across pods. */
const tally = (pods: PodProgress[]): StatusCounts =>
  pods.reduce((acc, p) => {
    (Object.keys(acc) as (keyof StatusCounts)[]).forEach((k) => (acc[k] += p.statusCounts[k]));
    return acc;
  }, counts([0, 0, 0, 0, 0, 0, 0, 0]));

type ProjectRecord = Omit<ProjectAnalytics, 'statusCounts' | 'myTicketCount'> & {
  memberIds: string[];
};

const project = (r: ProjectRecord): ProjectRecord => r;

export const PROJECT_RECORDS: ProjectRecord[] = [
  project({
    slug: 'wrkld-platform',
    name: 'Wrkld Platform',
    status: 'active',
    progress: 68,
    lead: PEOPLE.nithin,
    memberIds: ['u-shwetha', 'u-nithin', 'u-arun', 'u-priya', 'u-megha'],
    pods: [
      pod('FE', 85, [0, 1, 1, 1, 0, 1, 1, 9], PEOPLE.shwetha),
      pod('BE', 75, [1, 1, 1, 1, 1, 1, 0, 7], PEOPLE.nithin),
      pod('INT', 40, [2, 2, 2, 0, 1, 1, 1, 3], PEOPLE.arun),
      pod('QA', 60, [1, 1, 2, 1, 0, 0, 0, 4], PEOPLE.priya),
    ],
  }),
  project({
    slug: 'ai-analytics',
    name: 'AI Analytics',
    status: 'in-progress',
    progress: 42,
    lead: PEOPLE.divya,
    memberIds: ['u-shwetha', 'u-divya', 'u-arun', 'u-priya'],
    pods: [
      pod('FE', 45, [2, 2, 2, 1, 0, 0, 0, 3], PEOPLE.shwetha),
      pod('BE', 52, [2, 1, 3, 1, 1, 0, 0, 4], PEOPLE.divya),
      pod('INT', 18, [3, 2, 1, 0, 0, 0, 0, 1], PEOPLE.arun),
      pod('QA', 25, [2, 1, 0, 0, 0, 0, 0, 1], PEOPLE.priya),
    ],
  }),
  project({
    slug: 'mobile-companion',
    name: 'Mobile Companion',
    status: 'planning',
    progress: 8,
    lead: PEOPLE.megha,
    memberIds: ['u-shwetha', 'u-megha', 'u-nithin'],
    pods: [
      pod('FE', 15, [5, 2, 1, 0, 0, 0, 0, 1], PEOPLE.megha),
      pod('BE', 10, [4, 1, 0, 0, 0, 0, 0, 0], PEOPLE.nithin),
      pod('INT', 0, [3, 0, 0, 0, 0, 0, 0, 0]),
      pod('QA', 0, [2, 0, 0, 0, 0, 0, 0, 0]),
    ],
  }),
  project({
    slug: 'customer-portal',
    name: 'Customer Portal',
    status: 'completed',
    progress: 100,
    lead: PEOPLE.priya,
    memberIds: ['u-shwetha', 'u-priya', 'u-edwin'],
    pods: [
      pod('FE', 100, [0, 0, 0, 0, 0, 0, 0, 8], PEOPLE.shwetha),
      pod('BE', 100, [0, 0, 0, 0, 0, 0, 0, 6], PEOPLE.edwin),
      pod('INT', 100, [0, 0, 0, 0, 0, 0, 0, 4], PEOPLE.edwin),
      pod('QA', 100, [0, 0, 0, 0, 0, 0, 0, 5], PEOPLE.priya),
    ],
  }),
  project({
    slug: 'partner-api',
    name: 'Partner API',
    status: 'blocked',
    progress: 55,
    lead: PEOPLE.edwin,
    memberIds: ['u-edwin', 'u-divya'],
    pods: [
      pod('FE', 60, [1, 1, 2, 1, 0, 1, 0, 4], PEOPLE.divya),
      pod('BE', 70, [0, 1, 1, 1, 1, 1, 1, 5], PEOPLE.edwin),
      pod('INT', 35, [2, 1, 1, 0, 0, 1, 0, 2], PEOPLE.edwin),
      pod('QA', 40, [1, 1, 1, 0, 0, 0, 0, 2]),
    ],
  }),
];

export const projectStatusCounts = (r: ProjectRecord) => tally(r.pods);

/** Overall progress figures as the backend would report them per audience. */
export const OVERALL_PROGRESS = { member: 68, workspace: 64 };

const t = (
  key: string,
  slug: string,
  title: string,
  description: string,
  status: Ticket['status'],
  type: Ticket['type'],
  pod: PodCode,
  assignee: Person | undefined,
  updatedAt: string,
  severity?: Ticket['severity']
): Ticket => ({
  key,
  title,
  description,
  status,
  type,
  pod,
  projectSlug: slug,
  projectName: PROJECT_RECORDS.find((p) => p.slug === slug)!.name,
  assignee,
  updatedAt,
  severity,
});

export const TICKETS: Ticket[] = [
  // Assigned to the signed-in user
  t('WRK-104', 'wrkld-platform', 'Implement login authentication', 'Email + SSO sign-in screens wired to the auth service, with session refresh.', 'in-progress', 'story', 'FE', PEOPLE.shwetha, '2026-11-07T05:40:00Z'),
  t('WRK-108', 'wrkld-platform', 'Create API integration', 'Typed client for the projects and tickets endpoints with error mapping.', 'pr-review', 'integration', 'BE', PEOPLE.shwetha, '2026-11-06T13:10:00Z'),
  t('WRK-112', 'wrkld-platform', 'Fix dashboard responsiveness', 'Cards overflow at tablet widths; stats row should wrap to two columns.', 'todo', 'bug', 'FE', PEOPLE.shwetha, '2026-11-06T09:00:00Z'),
  t('AIA-21', 'ai-analytics', 'Insights panel UI', 'Render model insights with confidence labels and empty states.', 'pod-lead-approved', 'story', 'FE', PEOPLE.shwetha, '2026-11-05T11:25:00Z'),
  t('MOB-3', 'mobile-companion', 'Mobile navigation epic', 'Tab bar, deep links and offline shell for the companion app.', 'backlog', 'epic', 'FE', PEOPLE.shwetha, '2026-11-02T08:00:00Z'),
  t('CPT-77', 'customer-portal', 'Invoice download', 'PDF invoice download from the billing page.', 'done', 'story', 'FE', PEOPLE.shwetha, '2026-10-12T08:00:00Z'),

  // Others' tickets
  t('WRK-115', 'wrkld-platform', 'Sprint board API', 'CRUD endpoints for sprint boards.', 'ready-for-integration', 'story', 'BE', PEOPLE.nithin, '2026-11-06T07:00:00Z'),
  t('WRK-121', 'wrkld-platform', 'Pod switcher dropdown', 'Switch active pod from the top navbar.', 'pr-review', 'story', 'FE', PEOPLE.megha, '2026-11-06T16:20:00Z'),
  t('AIA-24', 'ai-analytics', 'Chart empty states', 'Empty and error states for insight charts.', 'pr-review', 'story', 'FE', PEOPLE.megha, '2026-11-06T11:05:00Z'),
  t('WRK-118','wrkld-platform', 'E2E smoke suite', 'Playwright smoke tests for core flows.', 'in-progress', 'story', 'QA', PEOPLE.priya, '2026-11-06T10:00:00Z'),
  t('WRK-124', 'wrkld-platform', 'Wire FE login to auth service', 'Connect WRK-104 screens to the staging auth API.', 'ready-for-integration', 'integration', 'INT', PEOPLE.arun, '2026-11-06T14:00:00Z'),
  t('WRK-126', 'wrkld-platform', 'Contract tests for projects API', 'Consumer-driven contract tests between FE and BE.', 'in-progress', 'integration', 'INT', PEOPLE.arun, '2026-11-05T10:30:00Z'),
  t('WRK-102', 'wrkld-platform', 'Shared API error format', 'Agree and integrate a common error envelope.', 'done', 'integration', 'INT', PEOPLE.arun, '2026-10-30T10:30:00Z'),
  t('AIA-30','ai-analytics', 'Inference gateway', 'Gateway service in front of the model API.', 'in-progress', 'integration', 'INT', PEOPLE.arun, '2026-11-06T12:00:00Z'),

  // Blocker Flag tickets (manually created)
  t('WRK-131', 'wrkld-platform', 'Auth service token endpoint returns 500', 'Login flow (WRK-104) cannot be completed until the token endpoint is fixed in staging.', 'in-progress', 'blocker', 'BE', PEOPLE.nithin, '2026-11-07T04:15:00Z', 'high'),
  t('AIA-33', 'ai-analytics', 'Model inference API contract undecided', 'Integration pod is waiting on the response schema before wiring the insights panel.', 'todo', 'blocker', 'INT', PEOPLE.arun, '2026-11-06T15:30:00Z', 'medium'),
  t('PAR-9', 'partner-api', 'Partner sandbox credentials expired', 'All partner API integration tests failing; needs new sandbox keys from the partner.', 'todo', 'blocker', 'INT', PEOPLE.edwin, '2026-11-05T09:45:00Z', 'critical'),
  t('WRK-090', 'wrkld-platform', 'CI runners out of disk', 'Resolved by expanding runner volumes.', 'done', 'blocker', 'QA', PEOPLE.priya, '2026-10-28T09:45:00Z', 'low'),
];
