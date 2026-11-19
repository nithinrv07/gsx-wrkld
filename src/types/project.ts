import { StatusType } from './index';

export type ProjectStatus = Extract<
  StatusType,
  'planning' | 'active' | 'in-progress' | 'on-track' | 'completed' | 'blocked'
>;

export interface ProjectLead {
  name: string;
  email: string;
  avatarUrl?: string;
  initials: string;
  role?: string;
}

export interface Project {
  id: string;
  name: string;
  slug: string;
  description?: string;
  status: ProjectStatus;
  projectLead: ProjectLead;
  targetDate: string; // ISO date string (YYYY-MM-DD)
  createdAt: string;
  updatedAt: string;
}

export interface ProjectFilters {
  search?: string;
  status?: ProjectStatus | 'all';
}

export interface CreateProjectInput {
  name: string;
  slug: string;
  description?: string;
  projectLead: {
    name: string;
    email: string;
    initials?: string;
  };
  targetDate: string;
  status?: ProjectStatus;
}

export interface UpdateProjectInput {
  name?: string;
  description?: string;
  projectLead?: {
    name: string;
    email: string;
    initials?: string;
  };
  targetDate?: string;
  status?: ProjectStatus;
}

