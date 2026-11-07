import { Sprint, CreateSprintInput } from '@/types';
import { mockStorageAdapter } from './mockAdapter';

/**
 * Sprints API client layer.
 * Adapts to mockStorageAdapter by default, can be toggled or swapped with real HTTP fetch client.
 */
export const sprintsApi = {
  async getSprintsByProject(projectSlugOrId: string): Promise<Sprint[]> {
    return mockStorageAdapter.getSprintsByProject(projectSlugOrId);
  },

  async createSprint(
    projectSlugOrId: string,
    input: CreateSprintInput
  ): Promise<Sprint> {
    return mockStorageAdapter.createSprint(projectSlugOrId, input);
  },
};

