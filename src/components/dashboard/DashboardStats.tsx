import React from 'react';
import { CheckCircle2, ClipboardList, AlertTriangle, Eye, FolderKanban } from 'lucide-react';
import { Card } from '@/components/ui';
import { DashboardSummary } from '@/types/dashboard';

interface StatProps {
  label: string;
  value: React.ReactNode;
  icon: React.ReactNode;
  iconClass: string;
}

function Stat({ label, value, icon, iconClass }: StatProps) {
  return (
    <Card className="flex items-center gap-4 p-5 bg-white border border-slate-200/80 rounded-2xl shadow-xs">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${iconClass}`}>{icon}</div>
      <div>
        <p className="text-xs font-medium text-slate-500">{label}</p>
        <p className="text-2xl font-extrabold tracking-tight text-slate-900">{value}</p>
      </div>
    </Card>
  );
}

/** Four numbers, all from the dashboard summary. No made-up trends. */
export const DashboardStats: React.FC<{ summary: DashboardSummary }> = ({ summary }) => {
  const { stats, overallProgress } = summary;
  const showsReviews = stats.awaitingReview !== undefined;

  return (
    <section aria-label="Dashboard summary" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Stat
        label="Overall progress"
        value={`${overallProgress}%`}
        icon={<CheckCircle2 className="w-5 h-5" />}
        iconClass="bg-blue-50 text-blue-600"
      />
      <Stat
        label="Assigned tickets"
        value={stats.assignedTickets}
        icon={<ClipboardList className="w-5 h-5" />}
        iconClass="bg-indigo-50 text-indigo-600"
      />
      <Stat
        label="Open blockers"
        value={stats.openBlockers}
        icon={<AlertTriangle className="w-5 h-5" />}
        iconClass="bg-amber-50 text-amber-600"
      />
      {showsReviews ? (
        <Stat
          label="Awaiting review"
          value={stats.awaitingReview}
          icon={<Eye className="w-5 h-5" />}
          iconClass="bg-purple-50 text-purple-600"
        />
      ) : (
        <Stat
          label="Projects"
          value={stats.projects}
          icon={<FolderKanban className="w-5 h-5" />}
          iconClass="bg-purple-50 text-purple-600"
        />
      )}
    </section>
  );
};
