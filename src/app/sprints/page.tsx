'use client';

import React from 'react';
import { Zap, Plus } from 'lucide-react';
import { PageHeader, EmptyState, Button, StatusBadge } from '@/components/ui';

export default function SprintsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Sprints"
        description="Plan sprint cycles, manage story points, and monitor burndown metrics."
        badge={<StatusBadge status="active">Sprint 2</StatusBadge>}
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Sprints' },
        ]}
        actions={
          <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />}>
            Start New Sprint
          </Button>
        }
      />
      <EmptyState
        icon={Zap}
        title="Sprints Module Ready"
        description="The Sprints module foundation is configured. Developers can now build the sprint backlog, burndown charts, and velocity tracker."
        action={
          <Button variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />}>
            Configure Sprint Cadence
          </Button>
        }
      />
    </div>
  );
}
