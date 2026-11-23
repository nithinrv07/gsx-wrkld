import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { NAV_ITEMS } from '../constants/navigation';
import nextConfig from '../../next.config';

// Simplified navigation (spec 12.2): two destinations, Dashboard and Projects.
// Pods, sprints, boards and progress are reached from inside a project.
describe('Routes and navigation: two destinations', () => {
  const appDir = path.resolve(__dirname, '../app');
  const appRoutesDir = path.resolve(appDir, '(app)');
  const read = (rel: string) => fs.readFileSync(path.resolve(__dirname, rel), 'utf8');
  const REMOVED = ['pods', 'sprints', 'tasks', 'analytics', 'settings'];

  it('NAV_ITEMS lists only Dashboard and Projects', () => {
    expect(NAV_ITEMS.map((i) => [i.label, i.href])).toEqual([
      ['Dashboard', '/dashboard'],
      ['Projects', '/projects'],
    ]);
  });

  it('keeps the dashboard, projects, project detail and pod pages', () => {
    for (const page of [
      'dashboard/page.tsx',
      'projects/page.tsx',
      'projects/[slug]/page.tsx',
      'projects/[slug]/pods/page.tsx',
      'projects/[slug]/pods/[pod]/page.tsx',
    ]) {
      expect(fs.existsSync(path.resolve(appRoutesDir, page)), `${page} should exist`).toBe(true);
    }
  });

  it('no longer has the standalone pods, sprints, tasks, analytics or settings pages', () => {
    for (const route of REMOVED) {
      expect(fs.existsSync(path.resolve(appRoutesDir, route)), `${route}/ should be removed`).toBe(false);
    }
  });

  it('keeps /sign-in outside (app) in the (auth) route group', () => {
    expect(fs.existsSync(path.resolve(appDir, '(auth)/sign-in/page.tsx'))).toBe(true);
  });

  it('redirects every removed page so old links and bookmarks still work', async () => {
    const redirects = await nextConfig.redirects!();
    const bySource = (src: string) => redirects.filter((r) => r.source === src);

    for (const route of REMOVED) {
      expect(bySource(`/${route}`).length, `/${route} should redirect`).toBeGreaterThan(0);
      for (const r of bySource(`/${route}`)) expect(r.permanent).toBe(false);
    }
    expect(bySource('/settings')[0].destination).toBe('/dashboard');
    expect(bySource('/pods')[0].destination).toBe('/projects');

    // /analytics?project=<slug> opens that project's page.
    const projectAnalytics = bySource('/analytics').find((r) => r.has?.some((h) => h.key === 'project'));
    expect(projectAnalytics?.destination).toBe('/projects/:project');
  });

  it('Sidebar links only to Dashboard and Projects', () => {
    const sidebar = read('../components/layout/Sidebar.tsx');
    expect(sidebar).toContain("href: '/dashboard'");
    expect(sidebar).toContain("href: '/projects'");
    for (const route of REMOVED) expect(sidebar).not.toContain(`'/${route}'`);
  });

  it('project page holds progress analytics and pods without linking to a global analytics page', () => {
    const projectDetail = read('../app/(app)/projects/[slug]/page.tsx');
    expect(projectDetail).toContain('ProjectProgressSection');
    expect(projectDetail).toContain('ProjectTicketsTable');
    expect(projectDetail).toContain('PodList');
    // Component imports live under '@/components/analytics/'; only a link would start with a quote + '/analytics'.
    expect(projectDetail).not.toMatch(/['"`]\/analytics/);
  });

  it('projects page has no role switcher (users cannot change their own role)', () => {
    const projects = read('../app/(app)/projects/page.tsx');
    expect(projects).not.toContain('Switch Role');
    expect(projects).not.toContain('setRole');
  });

  it('no source file links to a removed page', () => {
    const offenders: string[] = [];
    const walk = (dir: string) => {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          if (entry.name !== '__tests__') walk(full);
        } else if (/\.(tsx?|jsx?)$/.test(entry.name) && !/\.test\./.test(entry.name)) {
          const src = fs.readFileSync(full, 'utf8');
          for (const route of REMOVED) {
            if (new RegExp(`['"\`]/${route}(['"\`?/]|$)`).test(src)) offenders.push(`${path.relative(appDir, full)} -> /${route}`);
          }
        }
      }
    };
    walk(path.resolve(__dirname, '..'));
    expect(offenders).toEqual([]);
  });
});
