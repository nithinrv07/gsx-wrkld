'use client';

import { useCallback, useSyncExternalStore } from 'react';

/**
 * Tiny localStorage-backed store that is safe for SSR/prerendering: the server
 * snapshot always returns the fallback, and the client hydrates afterwards.
 */
function createLocalStore<T>(key: string, fallback: T) {
  const listeners = new Set<() => void>();
  let cachedRaw: string | null | undefined;
  let cachedValue: T = fallback;

  const read = (): T => {
    let raw: string | null = null;
    try {
      raw = window.localStorage.getItem(key);
    } catch {
      raw = null;
    }
    if (raw !== cachedRaw) {
      cachedRaw = raw;
      try {
        cachedValue = raw === null ? fallback : (JSON.parse(raw) as T);
      } catch {
        cachedValue = fallback;
      }
    }
    return cachedValue;
  };

  const write = (value: T) => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Storage unavailable (private mode etc.) — keep in memory only.
      cachedRaw = JSON.stringify(value);
      cachedValue = value;
    }
    listeners.forEach((l) => l());
  };

  const subscribe = (listener: () => void) => {
    listeners.add(listener);
    const onStorage = (e: StorageEvent) => e.key === key && listener();
    window.addEventListener('storage', onStorage);
    return () => {
      listeners.delete(listener);
      window.removeEventListener('storage', onStorage);
    };
  };

  return function useLocalStore() {
    const value = useSyncExternalStore(subscribe, read, () => fallback);
    const set = useCallback((next: T | ((prev: T) => T)) => {
      const resolved = typeof next === 'function' ? (next as (p: T) => T)(read()) : next;
      write(resolved);
    }, []);
    return [value, set] as const;
  };
}

const readAlertStores = new Map<string, ReturnType<typeof createLocalStore<string[]>>>();

/** Keys of blocker alerts the given user has marked as read (stored per user). */
export function useReadAlerts(userId: string) {
  let store = readAlertStores.get(userId);
  if (!store) {
    store = createLocalStore<string[]>(`wrkld.dashboard.readAlerts.${userId}`, []);
    readAlertStores.set(userId, store);
  }
  return store();
}
