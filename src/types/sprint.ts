import { StatusType } from './index';

export type SprintStatus = Extract<
  StatusType,
  'planning' | 'active' | 'in-progress' | 'review' | 'completed'
>;

export interface Sprint {
  id: string;
  projectId: string; // Project ID or slug
  name: string;
  startDate: string; // ISO date string (YYYY-MM-DD)
  endDate: string; // ISO date string (YYYY-MM-DD)
  status: SprintStatus;
  goal?: string;
  createdAt: string;
}

export interface CreateSprintInput {
  name: string;
  startDate: string;
  endDate: string;
  status?: SprintStatus;
  goal?: string;
}

