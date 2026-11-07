import {
  Project,
  ProjectFilters,
  CreateProjectInput,
  UpdateProjectInput,
  Sprint,
  CreateSprintInput,
} from '@/types';
import { INITIAL_PROJECTS } from '../fixtures/projects';
import { INITIAL_SPRINTS } from '../fixtures/sprints';

const STORAGE_KEY_PROJECTS = 'wrkld_mock_projects';
const STORAGE_KEY_SPRINTS = 'wrkld_mock_sprints';

const SIMULATED_DELAY_MS = 250;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

class MockStorageAdapter {
  private projects: Project[] = [...INITIAL_PROJECTS];
  private sprints: Sprint[] = [...INITIAL_SPRINTS];
  private initialized = false;

  private initFromStorage() {
    if (this.initialized) return;
    if (typeof window !== 'undefined') {
      try {
        const storedProjects = localStorage.getItem(STORAGE_KEY_PROJECTS);
        if (storedProjects) {
          this.projects = JSON.parse(storedProjects);
        } else {
          localStorage.setItem(STORAGE_KEY_PROJECTS, JSON.stringify(this.projects));
        }

        const storedSprints = localStorage.getItem(STORAGE_KEY_SPRINTS);
        if (storedSprints) {
          this.sprints = JSON.parse(storedSprints);
        } else {
          localStorage.setItem(STORAGE_KEY_SPRINTS, JSON.stringify(this.sprints));
        }
      } catch (err) {
        console.warn('LocalStorage not available, falling back to memory storage', err);
      }
    }
    this.initialized = true;
  }

  private persist() {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY_PROJECTS, JSON.stringify(this.projects));
        localStorage.setItem(STORAGE_KEY_SPRINTS, JSON.stringify(this.sprints));
      } catch (err) {
        console.warn('Failed to persist to localStorage', err);
      }
    }
  }

  public resetToFixtures() {
    this.projects = [...INITIAL_PROJECTS];
    this.sprints = [...INITIAL_SPRINTS];
    this.persist();
  }

  // --- Project Operations ---

  async getProjects(filters?: ProjectFilters): Promise<Project[]> {
    this.initFromStorage();
    await sleep(SIMULATED_DELAY_MS);

    let result = [...this.projects];

    if (filters?.search && filters.search.trim().length > 0) {
      const q = filters.search.trim().toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.slug.toLowerCase().includes(q) ||
          p.projectLead.name.toLowerCase().includes(q)
      );
    }

    if (filters?.status && filters.status !== 'all') {
      result = result.filter((p) => p.status === filters.status);
    }

    // Sort by creation date descending
    return result.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getProjectBySlug(slug: string): Promise<Project> {
    this.initFromStorage();
    await sleep(SIMULATED_DELAY_MS);

    const project = this.projects.find(
      (p) =>
        p.slug.toLowerCase() === slug.toLowerCase() ||
        p.id.toLowerCase() === slug.toLowerCase()
    );
    if (!project) {
      throw new Error(`Project with slug "${slug}" not found.`);
    }
    return { ...project };
  }

  async getProjectById(id: string): Promise<Project> {
    this.initFromStorage();
    await sleep(SIMULATED_DELAY_MS);

    const project = this.projects.find(
      (p) =>
        p.id.toLowerCase() === id.toLowerCase() ||
        p.slug.toLowerCase() === id.toLowerCase()
    );
    if (!project) {
      throw new Error(`Project with ID "${id}" not found.`);
    }
    return { ...project };
  }

  async isSlugUnique(slug: string, excludeId?: string): Promise<boolean> {
    this.initFromStorage();
    const normalized = slug.trim().toLowerCase();
    const exists = this.projects.some(
      (p) => p.slug.toLowerCase() === normalized && p.id !== excludeId
    );
    return !exists;
  }

  async createProject(input: CreateProjectInput): Promise<Project> {
    this.initFromStorage();
    await sleep(SIMULATED_DELAY_MS);

    const normalizedSlug = input.slug.trim().toLowerCase();
    const isUnique = await this.isSlugUnique(normalizedSlug);
    if (!isUnique) {
      throw new Error(`Project slug "${normalizedSlug}" is already taken.`);
    }

    const initials =
      input.projectLead.initials ||
      input.projectLead.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    const newProject: Project = {
      id: `prj-${Date.now()}`,
      name: input.name.trim(),
      slug: normalizedSlug,
      description: input.description?.trim(),
      status: input.status || 'planning',
      projectLead: {
        name: input.projectLead.name.trim(),
        email: input.projectLead.email.trim(),
        initials,
      },
      targetDate: input.targetDate,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.projects.unshift(newProject);
    this.persist();
    return { ...newProject };
  }

  async updateProject(slugOrId: string, input: UpdateProjectInput): Promise<Project> {
    this.initFromStorage();
    await sleep(SIMULATED_DELAY_MS);

    const index = this.projects.findIndex(
      (p) =>
        p.slug.toLowerCase() === slugOrId.toLowerCase() ||
        p.id.toLowerCase() === slugOrId.toLowerCase()
    );
    if (index === -1) {
      throw new Error(`Project with identifier "${slugOrId}" not found.`);
    }

    const existing = this.projects[index];
    const updated: Project = {
      ...existing,
      name: input.name?.trim() ?? existing.name,
      description: input.description !== undefined ? input.description.trim() : existing.description,
      status: input.status ?? existing.status,
      targetDate: input.targetDate ?? existing.targetDate,
      projectLead: input.projectLead
        ? {
            ...existing.projectLead,
            name: input.projectLead.name.trim(),
            email: input.projectLead.email.trim(),
            initials:
              input.projectLead.initials ||
              input.projectLead.name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2),
          }
        : existing.projectLead,
      updatedAt: new Date().toISOString(),
    };

    this.projects[index] = updated;
    this.persist();
    return { ...updated };
  }

  // --- Sprint Operations ---

  async getSprintsByProject(projectSlugOrId: string): Promise<Sprint[]> {
    this.initFromStorage();
    await sleep(SIMULATED_DELAY_MS);

    const normalized = projectSlugOrId.trim().toLowerCase();
    const project = this.projects.find(
      (p) => p.slug.toLowerCase() === normalized || p.id.toLowerCase() === normalized
    );
    const validIds = new Set<string>([normalized]);
    if (project) {
      validIds.add(project.id.toLowerCase());
      validIds.add(project.slug.toLowerCase());
    }

    const sprints = this.sprints.filter(
      (s) => validIds.has(s.projectId.toLowerCase())
    );

    // Sort: active first, then planning, then in-progress, then by start date descending
    return [...sprints].sort(
      (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
    );
  }

  async createSprint(
    projectSlugOrId: string,
    input: CreateSprintInput
  ): Promise<Sprint> {
    this.initFromStorage();
    await sleep(SIMULATED_DELAY_MS);

    if (new Date(input.endDate) <= new Date(input.startDate)) {
      throw new Error('End date must be strictly after the start date.');
    }

    const newSprint: Sprint = {
      id: `sp-${Date.now()}`,
      projectId: projectSlugOrId.trim().toLowerCase(),
      name: input.name.trim(),
      startDate: input.startDate,
      endDate: input.endDate,
      status: input.status || 'planning',
      goal: input.goal?.trim(),
      createdAt: new Date().toISOString(),
    };

    this.sprints.unshift(newSprint);
    this.persist();
    return { ...newSprint };
  }
}

export const mockStorageAdapter = new MockStorageAdapter();
