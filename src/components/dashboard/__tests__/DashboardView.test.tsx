import { describe, expect, it, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DashboardProviders } from '../DashboardProviders';
import { DashboardView } from '../DashboardView';

const renderAt = (search: string) => {
  window.history.replaceState({}, '', `/dashboard${search}`);
  return render(
    <DashboardProviders>
      <DashboardView />
    </DashboardProviders>
  );
};

describe('DashboardView', () => {
  beforeEach(() => window.history.replaceState({}, '', '/dashboard'));

  it('loads the overview: welcome, stats, projects, tickets and alerts', async () => {
    renderAt('');
    expect(screen.getByLabelText('Loading dashboard')).toBeInTheDocument();
    expect(await screen.findByText('Welcome back, Shwetha!', {}, { timeout: 3000 })).toBeInTheDocument();
    expect(screen.getByText('Overall progress')).toBeInTheDocument();
    expect(screen.getByText('Wrkld Platform', { selector: 'h3 *, h3' })).toBeInTheDocument();
    expect(await screen.findByText('Implement login authentication', {}, { timeout: 3000 })).toBeInTheDocument();
    expect(await screen.findByText('Auth service token endpoint returns 500', {}, { timeout: 3000 })).toBeInTheDocument();
  });

  it('adapts actions to the previewed role', async () => {
    renderAt('');
    await screen.findByText('Welcome back, Shwetha!', {}, { timeout: 3000 });
    expect(screen.getByText('Awaiting review')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'New project' })).not.toBeInTheDocument();

    await userEvent.selectOptions(screen.getByLabelText('Preview dashboard as role'), 'contributor');
    await screen.findByText('Welcome back, Shwetha!', {}, { timeout: 3000 });
    expect(screen.queryByText('Awaiting review')).not.toBeInTheDocument();

    await userEvent.selectOptions(screen.getByLabelText('Preview dashboard as role'), 'project-lead');
    expect(await screen.findByRole('button', { name: 'New project' }, { timeout: 3000 })).toBeInTheDocument();
  });

  it('shows an error with retry when the dashboard fails to load', async () => {
    renderAt('?mock=error');
    expect(await screen.findByText("We couldn't load your dashboard", {}, { timeout: 5000 })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument();
  }, 10000);

  it('shows the empty workspace state', async () => {
    renderAt('?mock=empty');
    expect(await screen.findByText('Your workspace is empty', {}, { timeout: 3000 })).toBeInTheDocument();
  });
});
