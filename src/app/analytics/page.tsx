'use client';

import React from 'react';
import { BarChart2 } from 'lucide-react';
import { PageHeader, EmptyState, Button } from '@/components/ui';

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics & Reports"
        description="Agile metrics, velocity trends, completion ratios, and team insights."
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Analytics' },
        ]}
      />
      <EmptyState
        icon={BarChart2}
        title="Analytics Module Ready"
        description="The Analytics foundation is configured. The Analytics team can integrate charting libraries, velocity distributions, and cycle time metrics."
        action={
          <Button variant="primary" size="sm">
            View Sample Reports
          </Button>
        }
      />
    </div>
  );
}
