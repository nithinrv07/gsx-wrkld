import { describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RollUpProgress } from '../RollUpProgress';
import { PodProgressBars } from '../PodProgressBars';
import { TicketStatusBreakdown } from '../TicketStatusBreakdown';
import { counts } from '@/test/fixtures';
import { PodProgress } from '@/types/dashboard';

describe('RollUpProgress', () => {
  it('shows the backend percentage as-is, not one derived from ticket counts', () => {
    // 1 of 4 tickets done would be 25%, but the backend says 68%.
    render(<RollUpProgress progress={68} statusCounts={counts({ todo: 3, done: 1 })} />);
    expect(screen.getByText('68%')).toBeInTheDocument();
    expect(screen.queryByText('25%')).not.toBeInTheDocument();
  });

  it('distinguishes completed from pending work', () => {
    render(<RollUpProgress progress={40} statusCounts={counts({ backlog: 2, 'in-progress': 3, done: 5 })} />);
    expect(screen.getByRole('img', { name: '5 completed, 3 in flight, 2 not started' })).toBeInTheDocument();
    expect(screen.getByText('10 tickets')).toBeInTheDocument();
  });
});

const pods: PodProgress[] = [
  { pod: 'FE', progress: 85, statusCounts: counts({ done: 9 }), lead: { id: '1', name: 'Shwetha V', initials: 'SV' } },
  { pod: 'BE', progress: 75, statusCounts: counts({ done: 7 }) },
  { pod: 'INT', progress: 40, statusCounts: counts({ done: 3 }) },
  { pod: 'QA', progress: 60, statusCounts: counts({ done: 4 }) },
];

describe('PodProgressBars', () => {
  it('renders every pod with its percentage and progress bar', () => {
    render(<PodProgressBars pods={pods} />);
    for (const [name, pct] of [['Frontend', 85], ['Backend', 75], ['Integration', 40], ['Quality Assurance', 60]] as const) {
      expect(screen.getByText(name)).toBeInTheDocument();
      expect(screen.getByText(`${pct}%`)).toBeInTheDocument();
    }
    expect(screen.getAllByRole('progressbar')).toHaveLength(4);
  });

  it('shows pod leads only when allowed, with a fallback when missing', () => {
    const { rerender } = render(<PodProgressBars pods={pods} showLeads />);
    expect(screen.getByText('Shwetha V')).toBeInTheDocument();
    expect(screen.getAllByText('No pod lead')).toHaveLength(3);
    rerender(<PodProgressBars pods={pods} showLeads={false} />);
    expect(screen.queryByText('Shwetha V')).not.toBeInTheDocument();
  });

  it('links each pod when a link builder is given', () => {
    render(<PodProgressBars pods={pods} hrefForPod={(p) => `/analytics?pod=${p}`} />);
    expect(screen.getByRole('link', { name: /Integration pod, 40% complete/ })).toHaveAttribute('href', '/analytics?pod=INT');
  });
});

describe('TicketStatusBreakdown', () => {
  it('lists all eight lifecycle statuses in order with counts', () => {
    render(<TicketStatusBreakdown statusCounts={counts({ 'pr-review': 4, done: 12 })} />);
    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(8);
    expect(items[0]).toHaveTextContent('1. Backlog');
    expect(items[7]).toHaveTextContent('8. Done12');
    expect(within(items[3]).getByText('4')).toBeInTheDocument();
  });

  it('toggles a status selection', async () => {
    const onSelect = vi.fn();
    const { rerender } = render(<TicketStatusBreakdown statusCounts={counts()} onSelect={onSelect} />);
    await userEvent.click(screen.getByRole('button', { name: /Ready for Integration/ }));
    expect(onSelect).toHaveBeenCalledWith('ready-for-integration');
    rerender(<TicketStatusBreakdown statusCounts={counts()} onSelect={onSelect} selected="ready-for-integration" />);
    await userEvent.click(screen.getByRole('button', { name: /Ready for Integration/ }));
    expect(onSelect).toHaveBeenLastCalledWith(undefined);
  });
});
