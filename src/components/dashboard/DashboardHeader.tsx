'use client';

import React from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui';
import { CurrentUser } from '@/types/dashboard';
import { can } from '@/lib/dashboard/permissions';

export interface DashboardHeaderProps {
  user: CurrentUser;
  onRefresh: () => void;
  isRefreshing?: boolean;
  updatedAt?: number;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  user,
}) => {
  const firstName = user.name.split(' ')[0];

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            Dashboard
          </h1>
          <span className="sr-only">Welcome back, {firstName}!</span>
        </div>
        <p className="text-sm text-slate-500 mt-0.5 flex items-center gap-2 flex-wrap">
          <span>Multi-Pod Agile Project Overview & Delivery Insights</span>
          <span className="text-xs text-slate-400 font-mono">{user.email}</span>
        </p>
      </div>

      <div className="flex items-center gap-2">
        {can(user.role, 'create_project') && (
          <Link href="/projects">
            <Button size="sm" variant="primary" leftIcon={<Plus className="h-3.5 w-3.5" />}>
              New project
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
};
