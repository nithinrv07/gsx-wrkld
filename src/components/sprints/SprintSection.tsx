'use client';

import React, { useState } from 'react';
import { Zap, Plus, AlertCircle, RefreshCw } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button, EmptyState } from '@/components/ui';
import { useSprints } from '@/hooks/useSprints';
import { SprintItem } from './SprintItem';
import { CreateSprintModal } from './CreateSprintModal';
import { useAuth } from '@/lib/auth/rbac';

export interface SprintSectionProps {
  projectSlug: string;
  projectName?: string;
}

export const SprintSection: React.FC<SprintSectionProps> = ({
  projectSlug,
  projectName,
}) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { data: sprints, isLoading, isError, error, refetch } = useSprints(projectSlug);
  const { canCreateSprint } = useAuth();

  return (
    <Card className="border-slate-200/90 shadow-xs">
      {/* Header */}
      <CardHeader className="border-b border-slate-100">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-base sm:text-lg font-bold text-slate-900">
                Project Sprints
              </CardTitle>
              {sprints && sprints.length > 0 && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  {sprints.length}
                </span>
              )}
            </div>
            <CardDescription>
              Sprint delivery cadences, iteration schedules, and milestone timelines.
            </CardDescription>
          </div>

          {canCreateSprint && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsCreateModalOpen(true)}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Start New Sprint
            </Button>
          )}
        </div>
      </CardHeader>

      {/* Content */}
      <CardContent className="p-5 sm:p-6">
        {isLoading ? (
          // Skeletons
          <div className="space-y-3">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="p-5 rounded-2xl bg-white border border-slate-200/80 animate-pulse flex items-center justify-between"
              >
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-slate-100 rounded-md w-1/3" />
                  <div className="h-3 bg-slate-100 rounded-md w-1/2" />
                </div>
                <div className="h-4 bg-slate-100 rounded-md w-24" />
              </div>
            ))}
          </div>
        ) : isError ? (
          // Error State
          <div className="p-6 rounded-2xl bg-rose-50/70 border border-rose-200 text-center space-y-3">
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-5 h-5" />
            </div>
            <p className="text-sm font-semibold text-rose-900">
              Failed to load sprints for this project.
            </p>
            <p className="text-xs text-rose-600 max-w-sm mx-auto">
              {error instanceof Error ? error.message : 'An unexpected error occurred.'}
            </p>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => refetch()}
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            >
              Try Again
            </Button>
          </div>
        ) : !sprints || sprints.length === 0 ? (
          // Empty State
          <EmptyState
            icon={Zap}
            title="No Sprints Planned Yet"
            description="Start by creating Sprint 1 to schedule deliverables, manage timeboxed cycles, and track team cadence."
            action={
              canCreateSprint ? (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setIsCreateModalOpen(true)}
                  leftIcon={<Plus className="w-4 h-4" />}
                >
                  Create First Sprint
                </Button>
              ) : undefined
            }
          />
        ) : (
          // Sprint List
          <div className="space-y-3">
            {sprints.map((sprint) => (
              <SprintItem key={sprint.id} sprint={sprint} />
            ))}
          </div>
        )}
      </CardContent>

      {/* Creation Modal */}
      <CreateSprintModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        projectSlug={projectSlug}
        projectName={projectName}
      />
    </Card>
  );
};

