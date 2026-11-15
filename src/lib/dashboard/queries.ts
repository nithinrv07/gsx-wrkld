'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { Viewer } from '@/types/dashboard';
import {
  fetchDashboardSummary,
  fetchMyTickets,
  fetchOpenBlockers,
  fetchProjectAnalytics,
  fetchProjectTickets,
} from './api';
import { useViewer } from './viewer';

const viewerKey = (v: Viewer | null) => (v ? `${v.id}:${v.role}` : 'anonymous');

export const dashboardKeys = {
  all: ['dashboard'] as const,
  summary: (v: Viewer | null) => ['dashboard', 'summary', viewerKey(v)] as const,
  myTickets: (v: Viewer | null) => ['dashboard', 'my-tickets', viewerKey(v)] as const,
  blockers: (v: Viewer | null) => ['dashboard', 'blockers', viewerKey(v)] as const,
  project: (slug: string, v: Viewer | null) => ['dashboard', 'project', slug, viewerKey(v)] as const,
  projectTickets: (slug: string, v: Viewer | null) => ['dashboard', 'project-tickets', slug, viewerKey(v)] as const,
};

export function useDashboardSummary() {
  const { viewer } = useViewer();
  return useQuery({
    queryKey: dashboardKeys.summary(viewer),
    queryFn: () => fetchDashboardSummary(viewer!),
    enabled: !!viewer,
  });
}

export function useMyTickets() {
  const { viewer } = useViewer();
  return useQuery({
    queryKey: dashboardKeys.myTickets(viewer),
    queryFn: () => fetchMyTickets(viewer!),
    enabled: !!viewer,
  });
}

export function useOpenBlockers() {
  const { viewer } = useViewer();
  return useQuery({
    queryKey: dashboardKeys.blockers(viewer),
    queryFn: () => fetchOpenBlockers(viewer!),
    enabled: !!viewer,
  });
}

export function useProjectAnalytics(slug: string | undefined) {
  const { viewer } = useViewer();
  return useQuery({
    queryKey: dashboardKeys.project(slug ?? '', viewer),
    queryFn: () => fetchProjectAnalytics(slug!, viewer!),
    enabled: !!slug && !!viewer,
  });
}

export function useProjectTickets(slug: string | undefined) {
  const { viewer } = useViewer();
  return useQuery({
    queryKey: dashboardKeys.projectTickets(slug ?? '', viewer),
    queryFn: () => fetchProjectTickets(slug!, viewer!),
    enabled: !!slug && !!viewer,
  });
}

/** Re-fetch every dashboard query. */
export function useRefreshDashboard() {
  const client = useQueryClient();
  return useCallback(() => client.invalidateQueries({ queryKey: dashboardKeys.all }), [client]);
}
