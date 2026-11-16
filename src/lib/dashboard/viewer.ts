'use client';

import { useMockSession } from '@/features/auth/useMockSession';
import { MOCK_PODS } from '@/lib/mocks/pod-auth.mock';
import type { User } from '@/types/auth-pod';
import { CurrentUser, PodCode, Viewer } from '@/types/dashboard';

/** The pod a user leads, else the first pod they belong to. */
function podFor(userId: string): PodCode | undefined {
  const led = MOCK_PODS.find((p) => p.leadId === userId);
  if (led) return led.type;
  return MOCK_PODS.find((p) => p.members.some((m) => m.userId === userId))?.type;
}

const titleCase = (s: string) =>
  s
    .toLowerCase()
    .split(/\s+/)
    .map((w) => (w.length > 1 ? w[0].toUpperCase() + w.slice(1) : w.toUpperCase()))
    .join(' ');

export function toCurrentUser(user: User): CurrentUser {
  const name = titleCase(user.name);
  return {
    id: user.id,
    name,
    initials: name
      .split(' ')
      .map((p) => p[0])
      .join('')
      .slice(0, 2)
      .toUpperCase(),
    email: user.email,
    githubHandle: user.githubHandle,
    role: user.globalRole,
    pod: podFor(user.id),
  };
}

export type ViewerState =
  | { status: 'loading' | 'signed-out'; user: null; viewer: null }
  | { status: 'signed-in'; user: CurrentUser; viewer: Viewer };

/** The signed-in user, from the shared (mock) session. */
export function useViewer(): ViewerState {
  const session = useMockSession();
  if (session.status !== 'signed-in') return { status: session.status, user: null, viewer: null };
  const user = toCurrentUser(session.user);
  return { status: 'signed-in', user, viewer: { id: user.id, role: user.role, pod: user.pod } };
}
