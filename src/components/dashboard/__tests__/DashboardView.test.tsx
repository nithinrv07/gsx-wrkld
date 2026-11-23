import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryProvider } from '@/providers/QueryProvider';
import { DashboardView } from '../DashboardView';
import { MOCK_SESSION_KEY } from '@/features/auth/useMockSession';

const replace = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ replace, push: vi.fn() }) }));

const signInAs = (id: string | null) => {
  if (id) window.localStorage.setItem(MOCK_SESSION_KEY, JSON.stringify({ id }));
};

const renderAt = (search: string, userId: string | null = 'usr-4') => {
  signInAs(userId);
  window.history.replaceState({}, '', `/dashboard${search}`);
  return render(
    <QueryProvider>
      <DashboardView />
    </QueryProvider>
  );
};

const opts = { timeout: 4000 };

describe('DashboardView', () => {
  beforeEach(() => replace.mockClear());

  it("loads the signed-in contributor's overview", async () => {
    renderAt('', 'usr-4'); // Megha I, Contributor
    expect(screen.getByLabelText('Loading dashboard')).toBeInTheDocument();
    expect(await screen.findByText('Welcome back, Megha!', {}, opts)).toBeInTheDocument();
    expect(screen.getByText('megha@gsx.org')).toBeInTheDocument();
    expect(screen.getByText('Overall progress')).toBeInTheDocument();
    expect(await screen.findByText('Implement login authentication', {}, opts)).toBeInTheDocument();
    expect(await screen.findByText('Auth service token endpoint returns 500', {}, opts)).toBeInTheDocument();
    // Contributor: no review queue, no create-project action
    expect(screen.queryByText('Awaiting review')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'New project' })).not.toBeInTheDocument();
  });

  it('shows the review queue to a Pod Lead but not the create action', async () => {
    renderAt('', 'usr-3'); // Nithyasri R, Pod Lead (FE)
    expect(await screen.findByText('Awaiting review', {}, opts)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'New project' })).not.toBeInTheDocument();
  });

  it('gives a Super Admin the create action and every project', async () => {
    renderAt('', 'usr-1'); // Nithin R V, Super Admin
    expect(await screen.findByRole('button', { name: 'New project' }, opts)).toBeInTheDocument();
    expect(await screen.findByText('Identity provider sandbox credentials expired', {}, opts)).toBeInTheDocument();
  });

  it('redirects to sign-in when there is no session', async () => {
    renderAt('', null);
    await vi.waitFor(() => expect(replace).toHaveBeenCalledWith('/sign-in'));
  });

  it('shows an error with retry when the dashboard fails to load', async () => {
    renderAt('?mock=error');
    expect(await screen.findByText("We couldn't load your dashboard", {}, { timeout: 6000 })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument();
  }, 10000);

  it('shows the empty workspace state', async () => {
    renderAt('?mock=empty');
    expect(await screen.findByText('Your workspace is empty', {}, opts)).toBeInTheDocument();
  });
});
