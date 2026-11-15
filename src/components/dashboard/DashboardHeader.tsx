'use client';

import React from 'react';
import Link from 'next/link';
import { AtSign, Mail, Plus, RotateCw } from 'lucide-react';
import { Button, Card, PodBadge } from '@/components/ui';
import { CurrentUser } from '@/types/dashboard';
import { can } from '@/lib/dashboard/permissions';
import { InitialsAvatar } from './primitives';

export interface DashboardHeaderProps {
  user: CurrentUser;
  onRefresh: () => void;
  isRefreshing?: boolean;
  updatedAt?: number;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  user,
  onRefresh,
  isRefreshing,
  updatedAt,
}) => {
  const firstName = user.name.split(' ')[0];
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-stretch lg:justify-between">
      <div className="flex flex-col justify-center gap-1">
        <p className="text-xs font-medium uppercase tracking-wider text-[#5851d8]">Dashboard</p>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Welcome back, {firstName}!
        </h1>
        <p className="text-sm text-slate-500">Here&apos;s your workspace overview.</p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={onRefresh}
            isLoading={isRefreshing}
            leftIcon={<RotateCw className="h-3.5 w-3.5" />}
          >
            Refresh
          </Button>
          {can(user.role, 'create_project') && (
            <Link href="/projects">
              <Button size="sm" leftIcon={<Plus className="h-3.5 w-3.5" />}>
                New project
              </Button>
            </Link>
          )}
          {updatedAt ? (
            <span className="text-xs text-slate-400" suppressHydrationWarning>
              Updated {new Date(updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          ) : null}
        </div>
      </div>

      <Card className="flex items-center gap-4 p-4 lg:min-w-[20rem]" aria-label="Signed-in user">
        <InitialsAvatar initials={user.initials} size="lg" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate font-semibold text-slate-900">{user.name}</p>
            {user.pod && <PodBadge pod={user.pod} />}
          </div>
          <p className="text-xs text-slate-500">{user.role}</p>
          <p className="mt-1 flex items-center gap-1.5 truncate text-xs text-slate-400">
            <Mail className="h-3 w-3 shrink-0" /> {user.email}
          </p>
          {user.githubHandle && (
            <p className="flex items-center gap-1.5 truncate text-xs text-slate-400">
              <AtSign className="h-3 w-3 shrink-0" /> {user.githubHandle}
            </p>
          )}
        </div>
      </Card>
    </div>
  );
};
