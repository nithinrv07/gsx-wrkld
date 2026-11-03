'use client';

import React from 'react';
import { FolderKanban, Plus } from 'lucide-react';
import { PageHeader, EmptyState, Button } from '@/components/ui';

export default function ProjectsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Projects"
        description="Manage cross-pod software projects, repositories, and releases."
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Projects' },
        ]}
        actions={
          <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />}>
            New Project
          </Button>
        }
      />
      <EmptyState
        icon={FolderKanban}
        title="Projects Module Ready"
        description="The Projects module foundation is configured. The Projects development team can now implement card views, roadmaps, and repository integrations."
        action={
          <Button variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />}>
            Create Project
          </Button>
        }
      />
    </div>
  );
}
