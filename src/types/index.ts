import { ComponentType, SVGProps } from 'react';

export type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

export interface NavItem {
  label: string;
  href: string;
  iconName: 'Home' | 'Projects' | 'Sprints' | 'Tasks' | 'Pods' | 'Analytics' | 'Settings';
  badge?: string | number;
}

export type StatusType =
  | 'active'
  | 'in-progress'
  | 'completed'
  | 'done'
  | 'pending'
  | 'todo'
  | 'review'
  | 'planning'
  | 'blocked'
  | 'on-track';

export interface UserProfile {
  name: string;
  role: string;
  avatarUrl?: string;
  initials: string;
  email?: string;
}

export * from './project';
export * from './sprint';
