import { PodCode, Ticket } from '@/types/dashboard';

/**
 * Navigation targets used by the dashboard. Kept in one place so they can be
 * re-pointed once the Projects and Tasks modules settle their routes.
 */
export const dashboardRoutes = {
  dashboard: '/dashboard',
  project: (slug: string) => `/projects/${slug}`,
  podBoard: (slug: string, pod: PodCode) => `/projects/${slug}?pod=${pod}`,
  ticket: (t: Pick<Ticket, 'projectSlug' | 'key'>) => `/projects/${t.projectSlug}?ticket=${t.key}`,
  analytics: (slug?: string, pod?: PodCode) => {
    const q = new URLSearchParams();
    if (slug) q.set('project', slug);
    if (pod) q.set('pod', pod);
    const s = q.toString();
    return `/analytics${s ? `?${s}` : ''}`;
  },
};
