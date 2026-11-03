'use client';

import React from 'react';
import { CheckSquare, Plus } from 'lucide-react';
import { PageHeader, EmptyState, Button } from '@/components/ui';

export default function TasksPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Tasks"
        description="Track tasks, sprint backlogs, and Kanban boards across pods."
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Tasks' },
        ]}
        actions={
          <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />}>
            New Task
          </Button>
        }
      />
      <EmptyState
        icon={CheckSquare}
        title="Tasks & Kanban Module Ready"
        description="The Tasks module foundation is configured. The Kanban team can implement the drag-and-drop board columns, filters, and task detail drawers."
        action={
          <Button variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />}>
            Create Task
          </Button>
        }
      />
    </div>
  );
}
