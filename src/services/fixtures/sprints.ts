import { Sprint } from '@/types';

export const INITIAL_SPRINTS: Sprint[] = [
  // Sprints for wrkld-core
  {
    id: 'sp-101',
    projectId: 'wrkld-core',
    name: 'Sprint 1 — Core Architecture',
    startDate: '2026-08-15',
    endDate: '2026-08-29',
    status: 'completed',
    goal: 'Establish Next.js App Router, Tailwind tokens, and shared UI primitives.',
    createdAt: '2026-08-10T10:00:00Z',
  },
  {
    id: 'sp-102',
    projectId: 'wrkld-core',
    name: 'Sprint 2 — Project & Sprint Management',
    startDate: '2026-08-30',
    endDate: '2026-09-13',
    status: 'active',
    goal: 'Deliver Module 3 project listing, search/filter, project creation, and sprint workflows.',
    createdAt: '2026-08-25T11:00:00Z',
  },
  {
    id: 'sp-103',
    projectId: 'wrkld-core',
    name: 'Sprint 3 — Velocity & Burndown Integration',
    startDate: '2026-09-14',
    endDate: '2026-09-28',
    status: 'planning',
    goal: 'Connect sprint progress telemetry with Pod-first analytics dashboards.',
    createdAt: '2026-08-28T09:30:00Z',
  },

  // Sprints for kanban-sync
  {
    id: 'sp-201',
    projectId: 'kanban-sync',
    name: 'Sprint 1 — Real-time Socket Pipeline',
    startDate: '2026-08-10',
    endDate: '2026-08-24',
    status: 'completed',
    goal: 'Setup pub/sub channels and room multiplexing for active boards.',
    createdAt: '2026-08-05T08:00:00Z',
  },
  {
    id: 'sp-202',
    projectId: 'kanban-sync',
    name: 'Sprint 2 — Optimistic Drag-and-Drop',
    startDate: '2026-08-25',
    endDate: '2026-09-08',
    status: 'in-progress',
    goal: 'Implement conflict resolution and optimistic task positioning.',
    createdAt: '2026-08-20T14:15:00Z',
  },

  // Sprints for telemetry-engine
  {
    id: 'sp-301',
    projectId: 'telemetry-engine',
    name: 'Sprint 1 — Telemetry Data Ingestion',
    startDate: '2026-08-18',
    endDate: '2026-09-01',
    status: 'completed',
    goal: 'Ingest story point estimations and task completion events.',
    createdAt: '2026-08-12T13:00:00Z',
  },
  {
    id: 'sp-302',
    projectId: 'telemetry-engine',
    name: 'Sprint 2 — Burndown Visualizations',
    startDate: '2026-09-02',
    endDate: '2026-09-16',
    status: 'active',
    goal: 'Render interactive SVG burndown curves and velocity trends.',
    createdAt: '2026-08-28T16:00:00Z',
  },
];

