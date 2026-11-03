'use client';

import React, { useState } from 'react';
import {
  FolderKanban,
  CheckCircle2,
  Users2,
  TrendingUp,
  Plus,
  ArrowRight,
  Sparkles,
  ExternalLink,
  Layers,
  Trash2,
  ShieldAlert,
} from 'lucide-react';
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  StatusBadge,
  ProgressBar,
  PageHeader,
  EmptyState,
  DataTable,
  ConfirmDialog,
  Column,
} from '@/components/ui';

interface SampleTask {
  id: string;
  title: string;
  pod: string;
  assignee: string;
  status: 'active' | 'in-progress' | 'completed' | 'review' | 'blocked';
  progress: number;
}

const sampleTasks: SampleTask[] = [
  {
    id: 'TSK-101',
    title: 'Implement Pod-first architecture state',
    pod: 'Alpha',
    assignee: 'Shwetha V',
    status: 'in-progress',
    progress: 75,
  },
  {
    id: 'TSK-102',
    title: 'Sprint burndown telemetry pipeline',
    pod: 'Alpha',
    assignee: 'Divya R',
    status: 'completed',
    progress: 100,
  },
  {
    id: 'TSK-103',
    title: 'Design token alignment with dark navy theme',
    pod: 'Beta',
    assignee: 'Keerthana S',
    status: 'active',
    progress: 40,
  },
  {
    id: 'TSK-104',
    title: 'Kanban board drag-and-drop integration',
    pod: 'Gamma',
    assignee: 'Arun K',
    status: 'review',
    progress: 90,
  },
  {
    id: 'TSK-105',
    title: 'Auth0 token refresh service degradation test',
    pod: 'Alpha',
    assignee: 'Edwin A',
    status: 'blocked',
    progress: 20,
  },
];

export default function HomePage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [dialogActionMessage, setDialogActionMessage] = useState<string | null>(null);

  const handleConfirmAction = () => {
    setIsDeleting(true);
    setTimeout(() => {
      setIsDeleting(false);
      setIsDialogOpen(false);
      setDialogActionMessage('Action successfully executed via ConfirmDialog!');
      setTimeout(() => setDialogActionMessage(null), 4000);
    }, 1000);
  };

  const columns: Column<SampleTask>[] = [
    {
      key: 'id',
      header: 'Task ID',
      width: '120px',
      render: (task) => (
        <span className="font-mono text-xs font-semibold text-slate-500">
          {task.id}
        </span>
      ),
    },
    {
      key: 'title',
      header: 'Task Title',
      render: (task) => (
        <div className="font-medium text-slate-900 hover:text-[#5851d8] transition-colors">
          {task.title}
        </div>
      ),
    },
    {
      key: 'pod',
      header: 'Pod',
      render: (task) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700">
          Pod {task.pod}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (task) => <StatusBadge status={task.status} />,
    },
    {
      key: 'progress',
      header: 'Sprint Progress',
      render: (task) => (
        <div className="w-36">
          <ProgressBar
            value={task.progress}
            size="sm"
            showValue
            variant={task.progress === 100 ? 'emerald' : 'brand'}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <PageHeader
        title="Welcome back, Shwetha!"
        description="Let's make this sprint count 🚀. Here is the Wrkld design system and application foundation."
        badge={<StatusBadge status="active">Current Sprint</StatusBadge>}
        actions={
          <>
            <Button
              variant="secondary"
              leftIcon={<Layers className="w-4 h-4" />}
              onClick={() => window.open('https://github.com/nithinrv07/gsx-wrkld', '_blank')}
            >
              Repository
            </Button>
            <Button
              variant="primary"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => setIsDialogOpen(true)}
            >
              Test Modal Dialog
            </Button>
          </>
        }
      />

      {/* Action Message Feedback */}
      {dialogActionMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center justify-between">
          <span>{dialogActionMessage}</span>
          <button
            onClick={() => setDialogActionMessage(null)}
            className="text-emerald-600 hover:text-emerald-900 text-xs font-semibold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Top Metric Cards - Matching Wrkld Visual Reference */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <Card hoverable>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-slate-500">
                Total Projects
              </span>
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-[#5851d8] flex items-center justify-center">
                <FolderKanban className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold tracking-tight text-slate-900">
                12
              </span>
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                ↑ 12%
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Metric 2 */}
        <Card hoverable>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-slate-500">
                Active Tasks
              </span>
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold tracking-tight text-slate-900">
                48
              </span>
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                ↑ 8%
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Metric 3 */}
        <Card hoverable>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-slate-500">
                Your Pod
              </span>
              <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                <Users2 className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold tracking-tight text-slate-900">
                Alpha
              </span>
              <div className="flex -space-x-1.5 overflow-hidden">
                <div className="w-6 h-6 rounded-full bg-[#5851d8] text-white flex items-center justify-center text-[10px] ring-2 ring-white font-medium">
                  SV
                </div>
                <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-[10px] ring-2 ring-white font-medium">
                  DR
                </div>
                <div className="w-6 h-6 rounded-full bg-purple-500 text-white flex items-center justify-center text-[10px] ring-2 ring-white font-medium">
                  AK
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Metric 4 */}
        <Card hoverable>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-slate-500">
                On Track
              </span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold tracking-tight text-slate-900">
                92%
              </span>
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                ↑ 2%
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress & Deadlines Showcase Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card highlight className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Sprint 2 Velocity & Pod Progress</CardTitle>
              <StatusBadge status="on-track">78% Completed</StatusBadge>
            </div>
            <CardDescription>
              Overall progress tracked across Alpha, Beta, and Gamma engineering pods.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5 pt-3">
            <ProgressBar
              label="Alpha Pod (Core Frontend & UI Shell)"
              value={88}
              showValue
              variant="gradient"
              size="md"
            />
            <ProgressBar
              label="Beta Pod (Agile Metrics & Burndown Telemetry)"
              value={65}
              showValue
              variant="brand"
              size="md"
            />
            <ProgressBar
              label="Gamma Pod (Kanban Board & Drag-and-Drop Sync)"
              value={42}
              showValue
              variant="amber"
              size="md"
            />
          </CardContent>
          <CardFooter>
            <span className="text-xs text-slate-500">
              Sprint 2 ends in 4 days (Aug 30)
            </span>
            <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
              View Sprints
            </Button>
          </CardFooter>
        </Card>

        {/* Brand Banner Card */}
        <div className="rounded-2xl p-6 bg-gradient-to-br from-[#0e1322] via-[#141b2d] to-[#1d263e] text-white flex flex-col justify-between shadow-sm relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-[#5851d8]/20 blur-2xl" />
          <div className="space-y-3 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-[#5851d8] flex items-center justify-center font-bold text-lg shadow-md">
              W
            </div>
            <h3 className="text-lg font-bold tracking-tight text-white">
              Build. Collaborate. Grow.
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Wrkld empowers high-performing teams with pod-first agile delivery, rapid sprints, and unified workflows.
            </p>
          </div>
          <div className="pt-6 relative z-10">
            <Button
              variant="primary"
              size="sm"
              className="w-full bg-[#5851d8] hover:bg-[#4a43cc]"
              rightIcon={<Sparkles className="w-3.5 h-3.5" />}
            >
              Explore Pod Workflows
            </Button>
          </div>
        </div>
      </div>

      {/* DataTable Component Showcase */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Sample Tasks (DataTable Component)
            </h2>
            <p className="text-xs text-slate-500">
              Generic type-safe table component supporting custom renderers and state badges.
            </p>
          </div>
          <Button variant="secondary" size="sm" leftIcon={<Plus className="w-3.5 h-3.5" />}>
            Add Row
          </Button>
        </div>
        <DataTable
          columns={columns}
          data={sampleTasks}
          keyExtractor={(task) => task.id}
        />
      </div>

      {/* Reusable Component Playground */}
      <Card>
        <CardHeader>
          <CardTitle>Design System & Component Library</CardTitle>
          <CardDescription>
            Reusable UI building blocks ready for use by module teams (Projects, Kanban, Pods, Analytics).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8 pt-4">
          {/* Button Variants */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Buttons (Variants & Sizes)
            </h4>
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="subtle">Subtle</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="danger" leftIcon={<Trash2 className="w-4 h-4" />}>
                Danger
              </Button>
              <Button variant="primary" isLoading>
                Loading
              </Button>
            </div>
          </div>

          {/* Status Badges */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Status Badges
            </h4>
            <div className="flex flex-wrap items-center gap-2.5">
              <StatusBadge status="active" />
              <StatusBadge status="in-progress" />
              <StatusBadge status="completed" />
              <StatusBadge status="pending" />
              <StatusBadge status="todo" />
              <StatusBadge status="review" />
              <StatusBadge status="planning" />
              <StatusBadge status="blocked" />
              <StatusBadge status="on-track" />
            </div>
          </div>

          {/* Empty State Component Showcase */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              EmptyState Component
            </h4>
            <EmptyState
              title="No Sprints Configured Yet"
              description="Get started by defining your pod's sprint cadence and story point allocations."
              action={
                <Button variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />}>
                  Create Sprint
                </Button>
              }
              secondaryAction={
                <Button variant="secondary" size="sm">
                  Learn Pod Cadences
                </Button>
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* ConfirmDialog Modal */}
      <ConfirmDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onConfirm={handleConfirmAction}
        title="Execute Test Action?"
        description="This will demonstrate the accessible ConfirmDialog modal dialog with animated backdrop, escape key support, and loading states."
        confirmText="Proceed"
        cancelText="Cancel"
        variant="primary"
        isLoading={isDeleting}
      />
    </div>
  );
}
