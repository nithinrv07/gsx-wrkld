'use client';

import React from 'react';
import { Edit3 } from 'lucide-react';
import { Project } from '@/types';
import { PageHeader, StatusBadge, Button } from '@/components/ui';

export interface ProjectHeaderProps {
  project: Project;
  onEditClick?: () => void;
  canEdit?: boolean;
}

export const ProjectHeader: React.FC<ProjectHeaderProps> = ({
  project,
  onEditClick,
  canEdit = true,
}) => {
  return (
    <PageHeader
      title={project.name}
      description={
        <span className="font-mono text-xs text-slate-500">
          Project identifier: /{project.slug}
        </span>
      }
      badge={<StatusBadge status={project.status} size="md" />}
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'Projects', href: '/projects' },
        { label: project.name },
      ]}
      actions={
        canEdit && onEditClick ? (
          <Button
            variant="secondary"
            size="sm"
            onClick={onEditClick}
            leftIcon={<Edit3 className="w-4 h-4" />}
          >
            Edit Project
          </Button>
        ) : undefined
      }
    />
  );
};

