/**
 * Mock backend records for the Dashboard & Analytics module.
 * Illustrative data only. Progress percentages here stand in for values the
 * backend will supply; the frontend displays them as-is.
 */
import {
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

/** usr-* ids match the shared auth mock (src/lib/mocks/pod-auth.mock.ts). */
export const PEOPLE = {
  nithin: person('usr-1', 'Nithin R V'), // Super Admin
  shwetha: person('usr-2', 'Shwetha V'), // Project Lead
  nithyasri: person('usr-3', 'Nithyasri R'), // Pod Lead (FE)
  megha: person('usr-4', 'Megha I'), // Contributor
  manya: person('usr-5', 'Manya'), // Contributor
  arun: person('u-arun', 'Arun K'),
  priya: person('u-priya', 'Priya M'),
  divya: person('u-divya', 'Divya R'),
  edwin: person('u-edwin', 'Edwin A'),
  keerthana: person('u-keerthana', 'Keerthana S'),
  naveen: person('u-naveen', 'Naveen M'),
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
    slug: 'wrkld',
    name: 'Wrkld Platform',
    status: 'active',
    progress: 68,
    lead: PEOPLE.shwetha,
    memberIds: ['usr-1', 'usr-2', 'usr-3', 'usr-4', 'usr-5', 'u-arun', 'u-priya'],
    // Pod leads mirror the Pod module's mock: only Frontend has a lead so far.
    pods: [
      pod('FE', 85, [0, 1, 1, 1, 0, 1, 1, 9], PEOPLE.nithyasri),
      pod('BE', 75, [1, 1, 1, 1, 1, 1, 0, 7]),
      pod('INT', 40, [2, 2, 2, 0, 1, 1, 1, 3]),
      pod('QA', 60, [1, 1, 2, 1, 0, 0, 0, 4]),
    ],
  }),
  project({
    // Same projects as the Projects page (src/services/fixtures/projects.ts).
    slug: 'telemetry-engine',
    name: 'Agile Metrics & Telemetry',
    status: 'in-progress',
    progress: 42,
    lead: PEOPLE.divya,
    memberIds: ['usr-2', 'usr-3', 'usr-4', 'u-divya', 'u-arun', 'u-priya'],
    pods: [
      pod('FE', 45, [2, 2, 2, 1, 0, 0, 0, 3], PEOPLE.nithyasri),
      pod('BE', 52, [2, 1, 3, 1, 1, 0, 0, 4], PEOPLE.divya),
      pod('INT', 18, [3, 2, 1, 0, 0, 0, 0, 1], PEOPLE.arun),
      pod('QA', 25, [2, 1, 0, 0, 0, 0, 0, 1], PEOPLE.priya),
    ],
  }),
  project({
    slug: 'mobile-pwa',
    name: 'Wrkld Mobile Companion PWA',
    status: 'planning',
    progress: 8,
    lead: PEOPLE.edwin,
    memberIds: ['usr-2', 'usr-4', 'usr-5'],
    pods: [
      pod('FE', 15, [5, 2, 1, 0, 0, 0, 0, 1], PEOPLE.manya),
      pod('BE', 10, [4, 1, 0, 0, 0, 0, 0, 0], PEOPLE.nithin),
      pod('INT', 0, [3, 0, 0, 0, 0, 0, 0, 0]),
      pod('QA', 0, [2, 0, 0, 0, 0, 0, 0, 0]),
    ],
  }),
  project({
    slug: 'design-system-v2',
    name: 'Next-Gen Design System v2',
    status: 'completed',
    progress: 100,
    lead: PEOPLE.keerthana,
    memberIds: ['usr-3', 'usr-4', 'usr-5', 'u-priya', 'u-edwin'],
    pods: [
      pod('FE', 100, [0, 0, 0, 0, 0, 0, 0, 8], PEOPLE.nithyasri),
      pod('BE', 100, [0, 0, 0, 0, 0, 0, 0, 6], PEOPLE.edwin),
      pod('INT', 100, [0, 0, 0, 0, 0, 0, 0, 4], PEOPLE.edwin),
      pod('QA', 100, [0, 0, 0, 0, 0, 0, 0, 5], PEOPLE.priya),
    ],
  }),
  project({
    slug: 'auth-security',
    name: 'SSO & Enterprise RBAC',
    status: 'blocked',
    progress: 55,
    lead: PEOPLE.naveen,
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
  t('WRK-104', 'wrkld', 'Implement login authentication', 'Email + SSO sign-in screens wired to the auth service, with session refresh.', 'in-progress', 'story', 'FE', PEOPLE.megha, '2026-11-07T05:40:00Z'),
  t('WRK-108', 'wrkld', 'Create API integration', 'Typed client for the projects and tickets endpoints with error mapping.', 'pr-review', 'integration', 'BE', PEOPLE.megha, '2026-11-06T13:10:00Z'),
  t('WRK-112', 'wrkld', 'Fix dashboard responsiveness', 'Cards overflow at tablet widths; stats row should wrap to two columns.', 'todo', 'bug', 'FE', PEOPLE.megha, '2026-11-06T09:00:00Z'),
  t('TEL-21', 'telemetry-engine', 'Insights panel UI', 'Render model insights with confidence labels and empty states.', 'pod-lead-approved', 'story', 'FE', PEOPLE.megha, '2026-11-05T11:25:00Z'),
  t('MOB-3', 'mobile-pwa', 'Mobile navigation epic', 'Tab bar, deep links and offline shell for the companion app.', 'backlog', 'epic', 'FE', PEOPLE.manya, '2026-11-02T08:00:00Z'),
  t('DSV-77', 'design-system-v2', 'Invoice download', 'PDF invoice download from the billing page.', 'done', 'story', 'FE', PEOPLE.megha, '2026-10-12T08:00:00Z'),

  // Others' tickets
  t('WRK-115', 'wrkld', 'Sprint board API', 'CRUD endpoints for sprint boards.', 'ready-for-integration', 'story', 'BE', PEOPLE.nithin, '2026-11-06T07:00:00Z'),
  t('WRK-121', 'wrkld', 'Pod switcher dropdown', 'Switch active pod from the top navbar.', 'pr-review', 'story', 'FE', PEOPLE.manya, '2026-11-06T16:20:00Z'),
  t('TEL-24', 'telemetry-engine', 'Chart empty states', 'Empty and error states for insight charts.', 'pr-review', 'story', 'FE', PEOPLE.manya, '2026-11-06T11:05:00Z'),
  t('WRK-118','wrkld', 'E2E smoke suite', 'Playwright smoke tests for core flows.', 'in-progress', 'story', 'QA', PEOPLE.priya, '2026-11-06T10:00:00Z'),
  t('WRK-127', 'wrkld', 'Pod board column layout', 'Responsive column layout for the pod board.', 'pod-lead-approved', 'story', 'FE', PEOPLE.nithyasri, '2026-11-06T12:40:00Z'),
  t('WRK-133', 'wrkld', 'Beta release readiness', 'Track go-live checklist across all pods.', 'in-progress', 'epic', 'QA', PEOPLE.shwetha, '2026-11-07T06:10:00Z'),
  t('MOB-7', 'mobile-pwa', 'Companion app scope', 'Agree MVP scope and pod split for the mobile app.', 'todo', 'epic', 'FE', PEOPLE.shwetha, '2026-11-04T06:10:00Z'),
  t('WRK-124', 'wrkld', 'Wire FE login to auth service', 'Connect WRK-104 screens to the staging auth API.', 'ready-for-integration', 'integration', 'INT', PEOPLE.arun, '2026-11-06T14:00:00Z'),
  t('WRK-126', 'wrkld', 'Contract tests for projects API', 'Consumer-driven contract tests between FE and BE.', 'in-progress', 'integration', 'INT', PEOPLE.arun, '2026-11-05T10:30:00Z'),
  t('WRK-102', 'wrkld', 'Shared API error format', 'Agree and integrate a common error envelope.', 'done', 'integration', 'INT', PEOPLE.arun, '2026-10-30T10:30:00Z'),
  t('TEL-30','telemetry-engine', 'Inference gateway', 'Gateway service in front of the model API.', 'in-progress', 'integration', 'INT', PEOPLE.arun, '2026-11-06T12:00:00Z'),

  // Blocker Flag tickets (manually created)
  t('WRK-131', 'wrkld', 'Auth service token endpoint returns 500', 'Login flow (WRK-104) cannot be completed until the token endpoint is fixed in staging.', 'in-progress', 'blocker', 'BE', PEOPLE.nithin, '2026-11-07T04:15:00Z', 'high'),
  t('TEL-33', 'telemetry-engine', 'Model inference API contract undecided', 'Integration pod is waiting on the response schema before wiring the insights panel.', 'todo', 'blocker', 'INT', PEOPLE.arun, '2026-11-06T15:30:00Z', 'medium'),
  t('SSO-9', 'auth-security', 'Identity provider sandbox credentials expired', 'All SSO integration tests failing; needs new sandbox keys from the identity provider.', 'todo', 'blocker', 'INT', PEOPLE.edwin, '2026-11-05T09:45:00Z', 'critical'),
  t('WRK-090', 'wrkld', 'CI runners out of disk', 'Resolved by expanding runner volumes.', 'done', 'blocker', 'QA', PEOPLE.priya, '2026-10-28T09:45:00Z', 'low'),
];
