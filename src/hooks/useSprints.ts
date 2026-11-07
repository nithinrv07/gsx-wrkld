'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CreateSprintInput } from '@/types';
import { sprintsApi } from '@/services/api';

export const sprintKeys = {
  all: ['sprints'] as const,
  byProject: (projectSlug: string) =>
    [...sprintKeys.all, 'project', projectSlug.toLowerCase()] as const,
};

export function useSprints(projectSlug: string) {
  return useQuery({
    queryKey: sprintKeys.byProject(projectSlug),
    queryFn: () => sprintsApi.getSprintsByProject(projectSlug),
    enabled: Boolean(projectSlug && projectSlug.trim().length > 0),
  });
}

export function useCreateSprint(projectSlug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateSprintInput) =>
      sprintsApi.createSprint(projectSlug, input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: sprintKeys.byProject(projectSlug),
      });
    },
  });
}

