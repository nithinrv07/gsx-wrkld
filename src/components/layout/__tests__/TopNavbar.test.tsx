import React from 'react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TopNavbar } from '../TopNavbar';
import { saveMockSession } from '@/features/auth/useMockSession';
import { MOCK_USERS } from '@/lib/mocks/pod-auth.mock';

let mockPathname = '/dashboard';
vi.mock('next/navigation', () => ({
  usePathname: () => mockPathname,
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

function renderWithClient(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

describe('TopNavbar Dynamic Functionality', () => {
  beforeEach(() => {
    mockPathname = '/dashboard';
    window.localStorage.clear();
    saveMockSession(MOCK_USERS[0]);
  });

  it('renders dynamic sprint badge and initial layout', async () => {
    renderWithClient(<TopNavbar onMenuToggle={() => {}} />);

    // Check sprint badge exists
    expect(screen.getByText(/Sprint 2 \(Current\)/i)).toBeInTheDocument();
  });

  it('renders dynamic breadcrumbs for /dashboard', () => {
    mockPathname = '/dashboard';
    renderWithClient(<TopNavbar onMenuToggle={() => {}} />);

    const nav = screen.getByRole('navigation', { name: /breadcrumbs/i });
    expect(nav).toBeInTheDocument();
    expect(nav).toHaveTextContent('Home');
    expect(nav).toHaveTextContent('Dashboard');
  });

  it('renders dynamic breadcrumbs for nested pod route', () => {
    mockPathname = '/projects/wrkld-core/pods/pod-fe';
    renderWithClient(<TopNavbar onMenuToggle={() => {}} />);

    const nav = screen.getByRole('navigation', { name: /breadcrumbs/i });
    expect(nav).toBeInTheDocument();
    expect(nav).toHaveTextContent('Home');
    expect(nav).toHaveTextContent('Projects');
    expect(nav).toHaveTextContent('Wrkld Platform');
    expect(nav).toHaveTextContent('Frontend Pod');
  });

  it('does NOT contain Settings link in the user menu dropdown', () => {
    renderWithClient(<TopNavbar onMenuToggle={() => {}} />);

    // Click user menu button to open dropdown
    const userButton = screen.getByRole('button', { name: /user menu/i });
    fireEvent.click(userButton);

    // Verify Sign out button is present
    expect(screen.getByRole('button', { name: /sign out/i })).toBeInTheDocument();

    // Verify Account Settings link is removed
    expect(screen.queryByRole('link', { name: /account settings/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /settings/i })).not.toBeInTheDocument();
  });

  it('toggles notifications dropdown when clicking the bell icon', () => {
    renderWithClient(<TopNavbar onMenuToggle={() => {}} />);

    const bellButton = screen.getByRole('button', { name: /view notifications/i });
    fireEvent.click(bellButton);

    expect(screen.getByText(/^Notifications/)).toBeInTheDocument();
  });
});
