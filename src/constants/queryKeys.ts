/**
 * Wrkld Canonical TanStack Query Key Convention (P1 – M14)
 *
 * All application modules adhere to this consistent, hierarchical query-key convention:
 *
 * 1. Root Key (Domain Scope):
 *    - dashboard: ['dashboard', ...]
 *    - projects:  ['projects', ...]
 *    - sprints:   ['sprints', ...]
 *    - tickets:   ['projects', slug, 'tickets', ...]
 *
 * 2. Key Structure & Granularity:
 *    - Domain root: ['<domain>'] -> Used for broad invalidation (e.g. invalidateQueries({ queryKey: projectKeys.all }))
 *    - List/Summary: ['<domain>', 'list' | 'summary', filters?] -> Filterable collections
 *    - Detail:       ['<domain>', 'detail' | 'project', idOrSlug] -> Single resource queries
 *
 * 3. Cross-Module Invalidation:
 *    - Ticket mutations invalidate ticketKeys.project(slug) and dashboardKeys.all
 *    - Sprint mutations invalidate sprintKeys.byProject(slug) and ticketKeys.sprints(slug)
 *    - Project mutations invalidate projectKeys.all and dashboardKeys.all
 */

import { dashboardKeys } from '@/lib/dashboard/queries';
import { projectKeys } from '@/hooks/useProjects';
import { sprintKeys } from '@/hooks/useSprints';
import { ticketKeys } from '@/features/tickets/hooks/useTickets';

export { dashboardKeys, projectKeys, sprintKeys, ticketKeys };

export const queryKeys = {
  dashboard: dashboardKeys,
  projects: projectKeys,
  sprints: sprintKeys,
  tickets: ticketKeys,
} as const;

export default queryKeys;
