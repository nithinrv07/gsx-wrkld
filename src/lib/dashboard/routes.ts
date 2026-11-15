import { PodCode, Ticket } from '@/types/dashboard';

/** Pod ids follow the Pod module's convention: pod-fe, pod-be, pod-int, pod-qa. */
export const podId = (pod: PodCode) => `pod-${pod.toLowerCase()}`;

/**
 * Navigation targets used by the dashboard, in one place so they can be
 * re-pointed as other modules add routes. There is no /projects/[slug]
 * overview page yet, so projects open their progress analytics and tickets
 * open the pod board they belong to.
 */
export const dashboardRoutes = {
  dashboard: '/dashboard',
  signIn: '/sign-in',
  podBoard: (slug: string, pod: PodCode) => `/projects/${slug}/pods/${podId(pod)}`,
  ticket: (t: Pick<Ticket, 'projectSlug' | 'pod' | 'key'>) =>
    `/projects/${t.projectSlug}/pods/${podId(t.pod)}?ticket=${t.key}`,
  analytics: (slug?: string, pod?: PodCode) => {
    const q = new URLSearchParams();
    if (slug) q.set('project', slug);
    if (pod) q.set('pod', pod);
    const s = q.toString();
    return `/analytics${s ? `?${s}` : ''}`;
  },
};
