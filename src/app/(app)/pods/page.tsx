'use client';

import React from 'react';
import Link from 'next/link';
import { Users, FolderKanban, ArrowRight, UserCheck } from 'lucide-react';
import { PageHeader, Card, Button } from '@/components/ui';
import { MOCK_PODS } from '@/lib/mocks/pod-auth.mock';

const POD_COLORS: Record<string, { badge: string; border: string }> = {
  FE: { badge: 'bg-blue-50 text-blue-700 border-blue-200', border: 'border-l-blue-500' },
  BE: { badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', border: 'border-l-emerald-500' },
  INT: { badge: 'bg-purple-50 text-purple-700 border-purple-200', border: 'border-l-purple-500' },
  QA: { badge: 'bg-amber-50 text-amber-700 border-amber-200', border: 'border-l-amber-500' },
};

export default function PodsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Engineering Pods"
        description="Autonomous, cross-functional engineering pods driving agile velocity."
        breadcrumbs={[
          { label: 'Home', href: '/dashboard' },
          { label: 'Pods' },
        ]}
        actions={
          <Link href="/projects">
            <Button variant="secondary" size="sm" leftIcon={<FolderKanban className="w-4 h-4" />}>
              View All Projects
            </Button>
          </Link>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {MOCK_PODS.map((pod) => {
          const colors = POD_COLORS[pod.type] || {
            badge: 'bg-slate-100 text-slate-700 border-slate-200',
            border: 'border-l-slate-400',
          };

          return (
            <Card
              key={pod.id}
              className={`p-6 border-l-4 ${colors.border} space-y-4 hover:shadow-md transition-shadow`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded-md text-xs font-bold border ${colors.badge} mb-2`}
                  >
                    {pod.type} Pod
                  </span>
                  <h3 className="text-lg font-bold text-slate-900">{pod.name}</h3>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">Project: Wrkld Platform</p>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium bg-slate-50 border border-slate-200/80 px-2.5 py-1 rounded-lg">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  <span>{pod.memberCount} members</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                <UserCheck className="w-4 h-4 text-[#5851d8]" />
                <span className="text-xs text-slate-500">Pod Lead:</span>
                <span className="text-xs font-semibold text-slate-900">
                  {pod.leadName || 'Unassigned'}
                </span>
              </div>

              <div className="pt-2 flex justify-end">
                <Link
                  href={`/projects/wrkld/pods/${pod.id}`}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5851d8] hover:text-[#4a43c4] hover:underline"
                >
                  <span>Open Kanban Board & Team</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
