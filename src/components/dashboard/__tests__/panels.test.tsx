import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MyTicketsPanel } from '../MyTicketsPanel';
import { AlertsPanel } from '../AlertsPanel';
import { ticket } from '@/test/fixtures';

const tickets = [
  ticket(),
  ticket({ key: 'WRK-108', title: 'Create API integration', status: 'pr-review', pod: 'BE', type: 'integration' }),
  ticket({ key: 'WRK-112', title: 'Fix dashboard responsiveness', status: 'todo', type: 'bug' }),
  ticket({ key: 'CPT-77', title: 'Invoice download', status: 'done', projectSlug: 'customer-portal', projectName: 'Customer Portal' }),
];

describe('MyTicketsPanel', () => {
  it('shows open tickets with key, status, pod and a link to the ticket', () => {
    render(<MyTicketsPanel tickets={tickets} onRetry={() => {}} />);
    expect(screen.getByText('3 tickets')).toBeInTheDocument();
    expect(screen.queryByText('CPT-77')).not.toBeInTheDocument();
    const link = screen.getByRole('link', { name: /WRK-108/ });
    expect(link).toHaveAttribute('href', '/projects/wrkld-platform?ticket=WRK-108');
    expect(link).toHaveTextContent('PR Open / Review');
    expect(link).toHaveTextContent('Backend Pod');
    expect(link).toHaveTextContent('Integration Ticket');
  });

  it('searches by ticket ID or title', async () => {
    render(<MyTicketsPanel tickets={tickets} onRetry={() => {}} />);
    await userEvent.type(screen.getByLabelText('Search tickets'), 'responsive');
    expect(screen.getAllByRole('link')).toHaveLength(1);
    expect(screen.getByText('WRK-112')).toBeInTheDocument();
  });

  it('filters by lifecycle status', async () => {
    render(<MyTicketsPanel tickets={tickets} onRetry={() => {}} />);
    await userEvent.selectOptions(screen.getByLabelText('Filter tickets by status'), 'done');
    expect(screen.getAllByRole('link')).toHaveLength(1);
    expect(screen.getByText('CPT-77')).toBeInTheDocument();
  });

  it('shows the empty state when nothing is assigned', () => {
    render(<MyTicketsPanel tickets={[]} onRetry={() => {}} />);
    expect(screen.getByText('No tickets assigned to you')).toBeInTheDocument();
  });

  it('shows loading and error states', async () => {
    const onRetry = vi.fn();
    const { rerender } = render(<MyTicketsPanel isLoading onRetry={onRetry} />);
    expect(screen.getByLabelText('Loading tickets')).toBeInTheDocument();
    rerender(<MyTicketsPanel error={new Error('Server down')} onRetry={onRetry} />);
    expect(screen.getByRole('alert')).toHaveTextContent('Server down');
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(onRetry).toHaveBeenCalled();
  });
});

const blockers = [
  ticket({ key: 'WRK-131', title: 'Token endpoint returns 500', type: 'blocker', severity: 'high', pod: 'BE' }),
  ticket({ key: 'AIA-33', title: 'API contract undecided', type: 'blocker', status: 'todo', pod: 'INT', projectName: 'AI Analytics', projectSlug: 'ai-analytics' }),
];

describe('AlertsPanel', () => {
  it('lists open blockers with project, pod, status, severity and an unread badge', () => {
    render(<AlertsPanel blockers={blockers} onRetry={() => {}} readKeys={[]} onReadKeysChange={() => {}} />);
    expect(screen.getByLabelText('2 unread blockers')).toHaveTextContent('2');
    expect(screen.getByRole('link', { name: /WRK-131/ })).toHaveAttribute('href', '/projects/wrkld-platform?ticket=WRK-131');
    expect(screen.getByText('High')).toBeInTheDocument();
    expect(screen.getByText('AI Analytics')).toBeInTheDocument();
  });

  it('marks one or all alerts as read', async () => {
    const onChange = vi.fn();
    render(<AlertsPanel blockers={blockers} onRetry={() => {}} readKeys={[]} onReadKeysChange={onChange} />);
    await userEvent.click(screen.getByRole('button', { name: 'Mark WRK-131 as read' }));
    expect(onChange).toHaveBeenLastCalledWith(['WRK-131']);
    await userEvent.click(screen.getByRole('button', { name: 'Mark all read' }));
    expect(onChange).toHaveBeenLastCalledWith(['WRK-131', 'AIA-33']);
  });

  it('keeps read alerts in the "All open" history tab', async () => {
    render(<AlertsPanel blockers={blockers} onRetry={() => {}} readKeys={['WRK-131', 'AIA-33']} onReadKeysChange={() => {}} />);
    expect(screen.getByText("You're all caught up")).toBeInTheDocument();
    await userEvent.click(screen.getByRole('tab', { name: /All open/ }));
    expect(screen.getAllByRole('link')).toHaveLength(2);
  });

  it('shows empty, loading and error states', () => {
    const { rerender } = render(<AlertsPanel blockers={[]} onRetry={() => {}} readKeys={[]} onReadKeysChange={() => {}} />);
    expect(screen.getByText('No open blockers')).toBeInTheDocument();
    rerender(<AlertsPanel isLoading onRetry={() => {}} readKeys={[]} onReadKeysChange={() => {}} />);
    expect(screen.getByLabelText('Loading alerts')).toBeInTheDocument();
    rerender(<AlertsPanel error={new Error('Alerts failed')} onRetry={() => {}} readKeys={[]} onReadKeysChange={() => {}} />);
    expect(screen.getByRole('alert')).toHaveTextContent('Alerts failed');
  });
});
