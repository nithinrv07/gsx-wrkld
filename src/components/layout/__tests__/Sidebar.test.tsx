import React from 'react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Sidebar } from '../Sidebar';
import { MOCK_SESSION_KEY } from '@/features/auth/useMockSession';
import { AuthProvider } from '@/lib/auth/rbac';

let mockPathname = '/dashboard';
vi.mock('next/navigation', () => ({
  usePathname: () => mockPathname,
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

const signInAs = (id: string | null) => {
  if (id) {
    window.localStorage.setItem(MOCK_SESSION_KEY, JSON.stringify({ id }));
  } else {
    window.localStorage.removeItem(MOCK_SESSION_KEY);
  }
};

describe('Sidebar Integration & Profile Consistency', () => {
  beforeEach(() => {
    mockPathname = '/dashboard';
    window.localStorage.clear();
  });

  it('renders only Dashboard and Projects, plus Sign out', () => {
    render(
      <AuthProvider>
        <Sidebar isOpen />
      </AuthProvider>
    );

    const nav = screen.getByRole('navigation', { name: 'Main navigation' });
    const links = Array.from(nav.querySelectorAll('a')).map((a) => a.textContent);
    expect(links).toEqual(['Dashboard', 'Projects']);
    expect(screen.getByRole('button', { name: /sign out/i })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /analytics|settings|pods|sprints|tasks/i })).not.toBeInTheDocument();
  });

  it('correctly marks active route highlighting for Dashboard', () => {
    mockPathname = '/dashboard';
    render(
      <AuthProvider>
        <Sidebar isOpen />
      </AuthProvider>
    );

    const dashboardLink = screen.getByRole('link', { name: /dashboard/i });
    expect(dashboardLink).toHaveAttribute('aria-current', 'page');

    const projectsLink = screen.getByRole('link', { name: /projects/i });
    expect(projectsLink).not.toHaveAttribute('aria-current');
  });

  it('keeps Projects highlighted on project, pod and board pages', () => {
    for (const p of ['/projects', '/projects/wrkld-core', '/projects/wrkld-core/pods/pod-fe']) {
      mockPathname = p;
      const { unmount } = render(
        <AuthProvider>
          <Sidebar isOpen />
        </AuthProvider>
      );
      expect(screen.getByRole('link', { name: /projects/i })).toHaveAttribute('aria-current', 'page');
      expect(screen.getByRole('link', { name: /dashboard/i })).not.toHaveAttribute('aria-current');
      unmount();
    }
  });

  it('displays Shwetha V as Project Lead with initials SV in default/fallback session', () => {
    render(
      <AuthProvider>
        <Sidebar isOpen />
      </AuthProvider>
    );

    expect(screen.getByText('Shwetha V')).toBeInTheDocument();
    expect(screen.getByText('Project Lead')).toBeInTheDocument();
    expect(screen.getByText('SV')).toBeInTheDocument();
  });

  it('derives consistent profile role when logged in as usr-2 (Shwetha V)', () => {
    signInAs('usr-2');
    render(
      <AuthProvider>
        <Sidebar isOpen />
      </AuthProvider>
    );

    expect(screen.getByText('Shwetha V')).toBeInTheDocument();
    expect(screen.getByText('Project Lead')).toBeInTheDocument();
    expect(screen.getByText('SV')).toBeInTheDocument();
  });

  it('updates dynamically when persona switches to Super Admin (usr-1)', () => {
    signInAs('usr-1');
    render(
      <AuthProvider>
        <Sidebar isOpen />
      </AuthProvider>
    );

    expect(screen.getByText('Nithin R V')).toBeInTheDocument();
    expect(screen.getByText('Super Admin')).toBeInTheDocument();
    expect(screen.getByText('NR')).toBeInTheDocument();
  });
});
