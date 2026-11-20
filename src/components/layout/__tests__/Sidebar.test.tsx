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

  it('renders all four intended navigation items', () => {
    render(
      <AuthProvider>
        <Sidebar isOpen />
      </AuthProvider>
    );

    expect(screen.getByRole('link', { name: /dashboard/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /projects/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /analytics/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /settings/i })).toBeInTheDocument();
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

  it('correctly marks active route highlighting for Analytics and Settings', () => {
    mockPathname = '/analytics';
    const { rerender } = render(
      <AuthProvider>
        <Sidebar isOpen />
      </AuthProvider>
    );

    expect(screen.getByRole('link', { name: /analytics/i })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: /dashboard/i })).not.toHaveAttribute('aria-current');

    mockPathname = '/settings';
    rerender(
      <AuthProvider>
        <Sidebar isOpen />
      </AuthProvider>
    );

    expect(screen.getByRole('link', { name: /settings/i })).toHaveAttribute('aria-current', 'page');
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
