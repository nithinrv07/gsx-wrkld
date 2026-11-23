import { NavItem, UserProfile } from '@/types';

// The app has two destinations (spec 12.2). Pods, sprints, boards and progress
// are reached from inside a project.
export const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', iconName: 'Home' },
  { label: 'Projects', href: '/projects', iconName: 'Projects' },
];

export const CURRENT_USER: UserProfile = {
  name: 'Shwetha V',
  role: 'Project Lead',
  initials: 'SV',
  email: 'shwetha@gsx.org',
};
