import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { NAV_ITEMS } from '../constants/navigation';

describe('Task 8: Route and Navigation Cleanup (Seven-Route Hybrid Architecture)', () => {
  const appDir = path.resolve(__dirname, '../app');
  const appRoutesDir = path.resolve(appDir, '(app)');

  it('validates the canonical seven-route NAV_ITEMS configuration', () => {
    expect(NAV_ITEMS).toHaveLength(7);
    const labels = NAV_ITEMS.map((item) => item.label);
    expect(labels).toEqual([
      'Home',
      'Projects',
      'Sprints',
      'Tasks',
      'Pods',
      'Analytics',
      'Settings',
    ]);
  });

  it('preserves all core authenticated application routes inside (app)', () => {
    const expectedAppRoutes = [
      'dashboard',
      'projects',
      'pods',
      'sprints',
      'tasks',
      'analytics',
      'settings',
    ];

    for (const route of expectedAppRoutes) {
      const pageFile = path.resolve(appRoutesDir, route, 'page.tsx');
      expect(fs.existsSync(pageFile), `Expected ${route}/page.tsx to exist`).toBe(true);
    }
  });

  it('keeps /sign-in cleanly outside (app) in (auth) route group', () => {
    const signInPage = path.resolve(appDir, '(auth)/sign-in/page.tsx');
    expect(fs.existsSync(signInPage)).toBe(true);
  });

  it('provides a redirect page for /projects/[slug]/pods to avoid 404s', () => {
    const projectPodsPage = path.resolve(appRoutesDir, 'projects/[slug]/pods/page.tsx');
    expect(fs.existsSync(projectPodsPage)).toBe(true);
  });

  it('ensures Sidebar does not have duplicate Help & Docs pointing to /settings', () => {
    const sidebarSource = fs.readFileSync(
      path.resolve(__dirname, '../components/layout/Sidebar.tsx'),
      'utf8'
    );
    expect(sidebarSource).not.toContain('Help & Docs');
    expect(sidebarSource).not.toContain('HelpCircle');
    expect(sidebarSource).toContain("href: '/settings'");
  });

  it('ensures Sidebar maps all seven canonical destinations', () => {
    const sidebarSource = fs.readFileSync(
      path.resolve(__dirname, '../components/layout/Sidebar.tsx'),
      'utf8'
    );
    expect(sidebarSource).toContain("href: '/dashboard'");
    expect(sidebarSource).toContain("href: '/projects'");
    expect(sidebarSource).toContain("href: '/pods'");
    expect(sidebarSource).toContain("href: '/sprints'");
    expect(sidebarSource).toContain("href: '/tasks'");
    expect(sidebarSource).toContain("href: '/analytics'");
    expect(sidebarSource).toContain("href: '/settings'");
  });

  it('ensures Project Details page integrates ProjectTicketsTable for analytics and links to global analytics', () => {
    const projectDetailSource = fs.readFileSync(
      path.resolve(appRoutesDir, 'projects/[slug]/page.tsx'),
      'utf8'
    );
    expect(projectDetailSource).toContain('ProjectTicketsTable');
    expect(projectDetailSource).toContain('Progress & Performance Analytics');
    expect(projectDetailSource).toContain('/analytics?project=');
  });

  it('ensures Settings page retains persona switcher for RBAC testing', () => {
    const settingsSource = fs.readFileSync(
      path.resolve(appRoutesDir, 'settings/page.tsx'),
      'utf8'
    );
    expect(settingsSource).toContain('Switch Testing Profile & Role');
    expect(settingsSource).toContain('MOCK_USERS');
    expect(settingsSource).toContain('saveMockSession');
  });
});
