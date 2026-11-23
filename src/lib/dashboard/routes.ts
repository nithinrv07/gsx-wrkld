import { PodCode, Ticket } from '@/types/dashboard';

/** Pod ids follow the Pod module's convention: pod-fe, pod-be, pod-int, pod-qa. */
export const podId = (pod: PodCode) => `pod-${pod.toLowerCase()}`;

/**
 * Navigation targets used by the dashboard, in one place. Projects open their
 * project page (which holds progress, pods and sprints); tickets open the pod
 * board they belong to.
 */
export const dashboardRoutes = {
  dashboard: '/dashboard',
  signIn: '/sign-in',
  podBoard: (slug: string, pod: PodCode) => `/projects/${slug}/pods/${podId(pod)}`,
  ticket: (t: Pick<Ticket, 'projectSlug' | 'pod' | 'key'>) =>
    `/projects/${t.projectSlug}/pods/${podId(t.pod)}?ticket=${t.key}`,
  project: (slug: string) => `/projects/${slug}`,
};
