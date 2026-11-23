'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { podsApi, type CreatePodInput } from '@/services/api/podsApi';

export const podKeys = {
  all: ['pods'] as const,
  byProject: (projectSlug: string) => [...podKeys.all, 'project', projectSlug.toLowerCase()] as const,
  detail: (projectSlug: string, podId: string) =>
    [...podKeys.byProject(projectSlug), 'detail', podId.toLowerCase()] as const,
};

export function useAllPods() {
  return useQuery({ queryKey: podKeys.all, queryFn: () => podsApi.listAllPods() });
}

export function usePods(projectSlug: string) {
  return useQuery({
    queryKey: podKeys.byProject(projectSlug),
    queryFn: () => podsApi.listPods(projectSlug),
    enabled: projectSlug.trim().length > 0,
  });
}

export function usePod(projectSlug: string, podId: string) {
  return useQuery({
    queryKey: podKeys.detail(projectSlug, podId),
    queryFn: () => podsApi.getPod(projectSlug, podId),
    enabled: projectSlug.trim().length > 0 && podId.trim().length > 0,
  });
}

export function useCreatePod(projectSlug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreatePodInput) => podsApi.createPod(projectSlug, input),
    onSuccess: () => {
      // Pod lists, the /pods directory and dashboard roll-ups all read pods.
      queryClient.invalidateQueries({ queryKey: podKeys.all });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
