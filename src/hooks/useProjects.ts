'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ProjectFilters, CreateProjectInput, UpdateProjectInput } from '@/types';
import { projectsApi } from '@/services/api';

export const projectKeys = {
  all: ['projects'] as const,
  lists: () => [...projectKeys.all, 'list'] as const,
  list: (filters?: ProjectFilters) => [...projectKeys.lists(), filters] as const,
  details: () => [...projectKeys.all, 'detail'] as const,
  detail: (slug: string) => [...projectKeys.details(), slug.toLowerCase()] as const,
};

export function useProjects(filters?: ProjectFilters) {
  return useQuery({
    queryKey: projectKeys.list(filters),
    queryFn: () => projectsApi.getProjects(filters),
  });
}

export function useProject(slug: string) {
  return useQuery({
    queryKey: projectKeys.detail(slug),
    queryFn: () => projectsApi.getProjectBySlug(slug),
    enabled: Boolean(slug && slug.trim().length > 0),
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateProjectInput) => projectsApi.createProject(input),
    onSuccess: (newProject) => {
      // Invalidate project lists so new project appears immediately
      queryClient.invalidateQueries({ queryKey: projectKeys.all });
      // Pre-seed the cache for this new project
      queryClient.setQueryData(projectKeys.detail(newProject.slug), newProject);
    },
  });
}

export function useUpdateProject(slug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateProjectInput) => projectsApi.updateProject(slug, input),
    onSuccess: (updatedProject) => {
      // Update specific project cache
      queryClient.setQueryData(projectKeys.detail(slug), updatedProject);
      // Invalidate all project lists to update listings
      queryClient.invalidateQueries({ queryKey: projectKeys.all });
    },
  });
}
