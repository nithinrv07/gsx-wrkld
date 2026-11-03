'use client';

import React from 'react';
import { Users, Plus } from 'lucide-react';
import { PageHeader, EmptyState, Button, StatusBadge } from '@/components/ui';

export default function PodsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Your Pods"
        description="Autonomous, cross-functional engineering pods driving agile velocity."
        badge={<StatusBadge status="active">Active: Pod Alpha</StatusBadge>}
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Pods' },
        ]}
        actions={
          <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />}>
            Create Pod
          </Button>
        }
      />
      <EmptyState
        icon={Users}
        title="Pods Module Ready"
        description="The Pods management module foundation is configured. The Pods team can implement pod membership, role assignments, and pod performance stats."
        action={
          <Button variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />}>
            Invite Pod Members
          </Button>
        }
      />
    </div>
  );
}
