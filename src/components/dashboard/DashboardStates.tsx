'use client';

import React from 'react';
import { CloudOff, LayoutDashboard, RotateCw } from 'lucide-react';
import { Button, Card, EmptyState } from '@/components/ui';
import { SkeletonBlock } from './primitives';

export const DashboardSkeleton: React.FC = () => (
  <div className="space-y-6" aria-busy="true" aria-label="Loading dashboard">
    <div className="flex flex-col gap-4 lg:flex-row lg:justify-between">
      <div className="space-y-3">
        <SkeletonBlock className="h-3 w-24" />
        <SkeletonBlock className="h-8 w-72" />
        <SkeletonBlock className="h-4 w-56" />
      </div>
      <SkeletonBlock className="h-24 w-full rounded-2xl lg:w-80" />
    </div>
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
      {[0, 1, 2, 3, 4].map((i) => (
        <SkeletonBlock key={i} className="h-24 rounded-2xl" />
      ))}
    </div>
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
      <div className="space-y-6 xl:col-span-2">
        <SkeletonBlock className="h-72 rounded-2xl" />
        <SkeletonBlock className="h-80 rounded-2xl" />
      </div>
      <SkeletonBlock className="h-96 rounded-2xl" />
    </div>
  </div>
);

export const DashboardEmptyState: React.FC<{ onRefresh: () => void }> = ({ onRefresh }) => (
  <EmptyState
    icon={LayoutDashboard}
    title="Your workspace is empty"
    description="You haven't been added to any projects and have no tickets assigned. Once a project lead adds you, your projects, tickets and alerts will appear here."
    action={
      <Button size="sm" variant="secondary" onClick={onRefresh} leftIcon={<RotateCw className="h-3.5 w-3.5" />}>
        Check again
      </Button>
    }
  />
);

export const DashboardError: React.FC<{ message?: string; onRetry: () => void; isRetrying?: boolean }> = ({
  message,
  onRetry,
  isRetrying,
}) => (
  <Card role="alert" className="flex flex-col items-center px-6 py-14 text-center">
    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
      <CloudOff className="h-7 w-7" />
    </div>
    <h2 className="text-lg font-semibold text-slate-900">We couldn&apos;t load your dashboard</h2>
    <p className="mt-1 max-w-md text-sm text-slate-500">
      {message ?? 'The server did not respond.'} Check your connection and try again.
    </p>
    <Button className="mt-6" onClick={onRetry} isLoading={isRetrying} leftIcon={<RotateCw className="h-4 w-4" />}>
      Retry
    </Button>
  </Card>
);
