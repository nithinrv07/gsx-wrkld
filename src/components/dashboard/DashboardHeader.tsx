'use client';

import React from 'react';
import Link from 'next/link';
import { Eye, Mail, Plus, RotateCw } from 'lucide-react';
import { Button, Card, PodBadge } from '@/components/ui';
import { CurrentUser, Role } from '@/types/dashboard';
import { ROLE_LABELS } from '@/lib/dashboard/meta';
import { can } from '@/lib/dashboard/permissions';
import { InitialsAvatar } from './primitives';

const ROLES = Object.keys(ROLE_LABELS) as Role[];

export interface DashboardHeaderProps {
  user: CurrentUser;
  onRefresh: () => void;
  isRefreshing?: boolean;
  updatedAt?: number;
  /** Dev-only role preview. Hidden when not provided. */
  onPreviewRole?: (role: Role) => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  user,
  onRefresh,
  isRefreshing,
  updatedAt,
  onPreviewRole,
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
          {can(user.role, 'projects:create') && (
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
          <p className="text-xs text-slate-500">
            {user.title} · {ROLE_LABELS[user.role]}
          </p>
          <p className="mt-1 flex items-center gap-1.5 truncate text-xs text-slate-400">
            <Mail className="h-3 w-3" /> {user.email}
          </p>
          {onPreviewRole && (
            <label className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-400">
              <Eye className="h-3 w-3" />
              Preview as
              <select
                aria-label="Preview dashboard as role"
                value={user.role}
                onChange={(e) => onPreviewRole(e.target.value as Role)}
                className="rounded-md border border-dashed border-slate-300 bg-transparent px-1 py-0.5 text-[11px] text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {ROLE_LABELS[r]}
                  </option>
                ))}
              </select>
              <span className="rounded bg-amber-50 px-1 text-[10px] font-semibold text-amber-700">DEV</span>
            </label>
          )}
        </div>
      </Card>
    </div>
  );
};
