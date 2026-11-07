import { StatusCounts, Ticket } from '@/types/dashboard';

export const counts = (partial: Partial<StatusCounts> = {}): StatusCounts => ({
  backlog: 0,
  todo: 0,
  'in-progress': 0,
  'pr-review': 0,
  'pod-lead-approved': 0,
  'ready-for-integration': 0,
  'integration-verified': 0,
  done: 0,
  ...partial,
});

export const ticket = (overrides: Partial<Ticket> = {}): Ticket => ({
  key: 'WRK-104',
  title: 'Implement login authentication',
  description: 'Sign-in screens',
  status: 'in-progress',
  type: 'story',
  pod: 'FE',
  projectSlug: 'wrkld-platform',
  projectName: 'Wrkld Platform',
  updatedAt: '2026-11-07T05:40:00Z',
  ...overrides,
});
