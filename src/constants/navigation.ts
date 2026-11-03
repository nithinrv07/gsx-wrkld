import { NavItem, UserProfile } from '@/types';

export const NAV_ITEMS: NavItem[] = [
  {
    label: 'Home',
    href: '/',
    iconName: 'Home',
  },
  {
    label: 'Projects',
    href: '/projects',
    iconName: 'Projects',
  },
  {
    label: 'Sprints',
    href: '/sprints',
    iconName: 'Sprints',
  },
  {
    label: 'Tasks',
    href: '/tasks',
    iconName: 'Tasks',
  },
  {
    label: 'Pods',
    href: '/pods',
    iconName: 'Pods',
  },
  {
    label: 'Analytics',
    href: '/analytics',
    iconName: 'Analytics',
  },
  {
    label: 'Settings',
    href: '/settings',
    iconName: 'Settings',
  },
];

export const CURRENT_USER: UserProfile = {
  name: 'Shwetha V',
  role: 'Frontend Lead',
  initials: 'SV',
  email: 'shwetha@wrkld.io',
};
