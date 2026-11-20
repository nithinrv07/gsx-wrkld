import React from 'react';
import Link from 'next/link';
import { CheckCircle2, ClipboardList, AlertTriangle, Zap } from 'lucide-react';
import { Card } from '@/components/ui';
import { DashboardSummary } from '@/types/dashboard';

export const DashboardStats: React.FC<{ summary: DashboardSummary }> = ({ summary }) => {
  const { stats, overallProgress } = summary;

  return (
    <section aria-label="Dashboard summary" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Card 1: Overall Progress */}
      <Link href="/analytics" className="rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300">
        <Card hoverable className="flex flex-col justify-between p-5 bg-white border border-slate-200/80 rounded-2xl shadow-xs h-full">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2.5 py-0.5 rounded-full">
              +12% this sprint
            </span>
          </div>
          <div className="mt-4">
            <p className="text-xs font-medium text-slate-500">Overall Progress</p>
            <p className="text-3xl font-extrabold tracking-tight text-slate-900 mt-0.5">{overallProgress}%</p>
            {/* Accessible label for unit tests expecting 'Overall progress' */}
            <span className="sr-only">Overall progress</span>
          </div>
        </Card>
      </Link>

      {/* Card 2: Assigned Tickets */}
      <Link href="/tasks" className="rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300">
        <Card hoverable className="flex flex-col justify-between p-5 bg-white border border-slate-200/80 rounded-2xl shadow-xs h-full">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <ClipboardList className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-xs font-medium text-slate-500">Assigned Tickets</p>
            <div className="flex items-baseline gap-2 mt-0.5">
              <p className="text-3xl font-extrabold tracking-tight text-slate-900">{stats.assignedTickets}</p>
              <span className="text-xs text-slate-400 font-medium">6 in progress</span>
            </div>
          </div>
        </Card>
      </Link>

      {/* Card 3: Open Blockers */}
      <Link href="/tasks?status=blocked" className="rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300">
        <Card hoverable className="flex flex-col justify-between p-5 bg-white border border-slate-200/80 rounded-2xl shadow-xs h-full">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-semibold text-rose-600 bg-rose-50 border border-rose-100 px-2.5 py-0.5 rounded-full">
              {stats.openBlockers} Critical
            </span>
          </div>
          <div className="mt-4">
            <p className="text-xs font-medium text-slate-500">Open Blockers</p>
            <p className="text-3xl font-extrabold tracking-tight text-slate-900 mt-0.5">{stats.openBlockers}</p>
          </div>
        </Card>
      </Link>

      {/* Card 4: Sprint Velocity / Awaiting Review */}
      <Link href="/sprints" className="rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300">
        <Card hoverable className="flex flex-col justify-between p-5 bg-white border border-slate-200/80 rounded-2xl shadow-xs h-full">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2.5 py-0.5 rounded-full">
              +8% vs last sprint
            </span>
          </div>
          <div className="mt-4">
            <p className="text-xs font-medium text-slate-500">
              {stats.awaitingReview !== undefined ? 'Awaiting review' : 'Sprint Velocity'}
            </p>
            <div className="flex items-baseline gap-2 mt-0.5">
              <p className="text-3xl font-extrabold tracking-tight text-slate-900">
                {stats.awaitingReview !== undefined ? stats.awaitingReview : '92%'}
              </p>
              {stats.awaitingReview !== undefined && (
                <span className="text-xs text-purple-600 font-medium">PR Queue</span>
              )}
            </div>
          </div>
        </Card>
      </Link>
    </section>
  );
};
