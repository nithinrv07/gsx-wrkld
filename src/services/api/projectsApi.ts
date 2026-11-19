import {
  Project,
  ProjectFilters,
  CreateProjectInput,
  UpdateProjectInput,
} from '@/types';
import { mockStorageAdapter } from './mockAdapter';

/**
 * Projects API client layer.
 * Adapts to mockStorageAdapter by default, can be toggled or swapped with real HTTP fetch client.
 */
export const projectsApi = {
  async getProjects(filters?: ProjectFilters): Promise<Project[]> {
    return mockStorageAdapter.getProjects(filters);
  },

  async getProjectBySlug(slug: string): Promise<Project> {
    return mockStorageAdapter.getProjectBySlug(slug);
  },

  async getProjectById(id: string): Promise<Project> {
    return mockStorageAdapter.getProjectById(id);
  },

  async isSlugUnique(slug: string, excludeId?: string): Promise<boolean> {
    return mockStorageAdapter.isSlugUnique(slug, excludeId);
  },

  async createProject(input: CreateProjectInput): Promise<Project> {
    return mockStorageAdapter.createProject(input);
  },

  async updateProject(idOrSlug: string, input: UpdateProjectInput): Promise<Project> {
    return mockStorageAdapter.updateProject(idOrSlug, input);
  },
};
