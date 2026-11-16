import React from 'react';
import Link from 'next/link';
import { AlertOctagon, FolderKanban, GitPullRequest, Ticket, TrendingUp } from 'lucide-react';
import { Card, ProgressBar } from '@/components/ui';
import { DashboardSummary } from '@/types/dashboard';
import { dashboardRoutes } from '@/lib/dashboard/routes';

const pad = (n: number) => String(n).padStart(2, '0');

export const DashboardStats: React.FC<{ summary: DashboardSummary }> = ({ summary }) => {
  const { stats, overallProgress } = summary;

  const items = [
    { label: 'Projects', value: pad(stats.projects), icon: FolderKanban, tint: 'bg-indigo-50 text-[#5851d8]', href: '#project-overview' },
    { label: 'Assigned tickets', value: pad(stats.assignedTickets), icon: Ticket, tint: 'bg-blue-50 text-blue-600', href: '#my-tickets' },
    {
      label: 'Open blockers',
      value: pad(stats.openBlockers),
      icon: AlertOctagon,
      tint: stats.openBlockers > 0 ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600',
      href: '#alerts',
    },
    ...(stats.awaitingReview !== undefined
      ? [{ label: 'Awaiting review', value: pad(stats.awaitingReview), icon: GitPullRequest, tint: 'bg-purple-50 text-purple-600', href: '#my-tickets' }]
      : []),
  ];

  return (
    <section aria-label="Dashboard summary" className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
      {items.map(({ label, value, icon: Icon, tint, href }) => (
        <Link key={label} href={href} className="rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300">
          <Card hoverable className="flex h-full items-center gap-4 p-5">
            <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${tint}`}>
              <Icon className="h-5 w-5" />
            </span>
            <div>
              <p className="text-2xl font-bold leading-none text-slate-900">{value}</p>
              <p className="mt-1 text-xs text-slate-500">{label}</p>
            </div>
          </Card>
        </Link>
      ))}

      <Link
        href={dashboardRoutes.analytics()}
        className="col-span-2 rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 md:col-span-3 xl:col-span-1"
        title="Overall progress across your projects, as reported by the backend"
      >
        <Card hoverable className="flex h-full flex-col justify-center gap-3 p-5">
          <div className="flex items-center gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <TrendingUp className="h-5 w-5" />
            </span>
            <div>
              <p className="text-2xl font-bold leading-none text-slate-900">{overallProgress}%</p>
              <p className="mt-1 text-xs text-slate-500">Overall progress</p>
            </div>
          </div>
          <ProgressBar value={overallProgress} size="sm" variant="gradient" />
        </Card>
      </Link>
    </section>
  );
};
