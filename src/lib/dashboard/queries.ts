'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import {
  fetchDashboardSummary,
  fetchMyTickets,
  fetchOpenBlockers,
  fetchProjectAnalytics,
  fetchProjectTickets,
} from './api';
import { usePreviewRole } from './local-store';

export const dashboardKeys = {
  all: ['dashboard'] as const,
  summary: (role: string) => ['dashboard', 'summary', role] as const,
  myTickets: (role: string) => ['dashboard', 'my-tickets', role] as const,
  blockers: (role: string) => ['dashboard', 'blockers', role] as const,
  project: (slug: string, role: string) => ['dashboard', 'project', slug, role] as const,
  projectTickets: (slug: string, role: string) => ['dashboard', 'project-tickets', slug, role] as const,
};

/** The role used for role-aware UI. Swap for the auth session's role once available. */
export function useCurrentRole() {
  return usePreviewRole();
}

export function useDashboardSummary() {
  const [role] = useCurrentRole();
  return useQuery({ queryKey: dashboardKeys.summary(role), queryFn: () => fetchDashboardSummary(role) });
}

export function useMyTickets() {
  const [role] = useCurrentRole();
  return useQuery({ queryKey: dashboardKeys.myTickets(role), queryFn: () => fetchMyTickets(role) });
}

export function useOpenBlockers() {
  const [role] = useCurrentRole();
  return useQuery({ queryKey: dashboardKeys.blockers(role), queryFn: () => fetchOpenBlockers(role) });
}

export function useProjectAnalytics(slug: string | undefined) {
  const [role] = useCurrentRole();
  return useQuery({
    queryKey: dashboardKeys.project(slug ?? '', role),
    queryFn: () => fetchProjectAnalytics(slug!, role),
    enabled: !!slug,
  });
}

export function useProjectTickets(slug: string | undefined) {
  const [role] = useCurrentRole();
  return useQuery({
    queryKey: dashboardKeys.projectTickets(slug ?? '', role),
    queryFn: () => fetchProjectTickets(slug!, role),
    enabled: !!slug,
  });
}

/** Re-fetch every dashboard query. */
export function useRefreshDashboard() {
  const client = useQueryClient();
  return useCallback(() => client.invalidateQueries({ queryKey: dashboardKeys.all }), [client]);
}
