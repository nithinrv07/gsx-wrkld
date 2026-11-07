'use client';

import { useSyncExternalStore } from 'react';
import { MOCK_USERS } from '@/lib/mocks/pod-auth.mock';
import type { User } from '@/types/auth-pod';

// MOCK session stored in localStorage. This is NOT real authentication.
// Replace with Auth.js once a GitHub OAuth app exists.

export const MOCK_SESSION_KEY = 'wrkld_mock_session';

const LOADING = '__loading__';
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((listener) => listener());

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  window.addEventListener('storage', onChange);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener('storage', onChange);
  };
}

function readRaw(): string | null {
  try {
    return window.localStorage.getItem(MOCK_SESSION_KEY);
  } catch {
    return null;
  }
}

function resolveUser(raw: string | null): User | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as { id?: unknown };
    // Always use the canonical mock user, so stale or edited storage cannot grant a role.
    return MOCK_USERS.find((u) => u.id === parsed.id) ?? null;
  } catch {
    return null;
  }
}

export function saveMockSession(user: User): void {
  try {
    window.localStorage.setItem(MOCK_SESSION_KEY, JSON.stringify(user));
  } catch {
    // Storage can be blocked (private mode). The session just will not persist.
  }
  notify();
}

export function clearMockSession(): void {
  try {
    window.localStorage.removeItem(MOCK_SESSION_KEY);
  } catch {
    // ignore
  }
  notify();
}

export type MockSession =
  | { status: 'loading'; user: null }
  | { status: 'signed-out'; user: null }
  | { status: 'signed-in'; user: User };

export function useMockSession(): MockSession {
  const raw = useSyncExternalStore(subscribe, readRaw, () => LOADING);
  if (raw === LOADING) return { status: 'loading', user: null };
  const user = resolveUser(raw);
  return user ? { status: 'signed-in', user } : { status: 'signed-out', user: null };
}