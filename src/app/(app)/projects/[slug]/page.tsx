'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  AlertCircle,
  ArrowLeft,
  RefreshCw,
  BarChart3,
} from 'lucide-react';
import { Button } from '@/components/ui';
import { useProject } from '@/hooks/useProjects';
import { useAuth } from '@/lib/auth/rbac';
import { ProjectHeader } from '@/components/projects/ProjectHeader';
import { ProjectDetailsCard } from '@/components/projects/ProjectDetailsCard';
import { EditProjectModal } from '@/components/projects/EditProjectModal';
import { SprintSection } from '@/components/sprints/SprintSection';
import { ProjectProgressSection } from '@/components/analytics/ProjectProgressSection';
import { ProjectTicketsTable } from '@/components/analytics/ProjectTicketsTable';
import { PodList } from '@/features/pods/PodList';
import { MOCK_PODS } from '@/lib/mocks/pod-auth.mock';
import { matchProjectSlug } from '@/lib/dashboard/api';
import type { TicketStatus } from '@/types/dashboard';

function ProjectDetailsContent() {
  const params = useParams();
  const slug = (params?.slug as string) || '';

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<TicketStatus | undefined>();
  const { data: project, isLoading, isError, error, refetch } = useProject(slug);
  const { canEditProject } = useAuth();

  const userCanEdit = project ? canEditProject(project.projectLead.email) : false;

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        {/* Header Skeleton */}
        <div className="space-y-3 pb-6">
          <div className="h-4 bg-slate-200 rounded-md w-48" />
          <div className="flex justify-between items-center">
            <div className="h-8 bg-slate-200 rounded-lg w-72" />
            <div className="h-10 bg-slate-200 rounded-xl w-32" />
          </div>
        </div>

        {/* Card Skeleton */}
        <div className="h-64 bg-white rounded-2xl border border-slate-200 p-6 space-y-4" />
        <div className="h-72 bg-white rounded-2xl border border-slate-200 p-6 space-y-4" />
      </div>
    );
  }

  if (isError || !project) {
    return (
      <div className="p-8 sm:p-12 rounded-2xl bg-white border border-slate-200/90 text-center space-y-4 max-w-lg mx-auto my-12 shadow-sm">
        <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-7 h-7" />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-slate-900">Project Not Found</h2>
          <p className="text-xs text-slate-500">
            {error instanceof Error
              ? error.message
              : `Unable to locate any project with slug "${slug}". It may have been renamed or removed.`}
          </p>
        </div>
        <div className="flex items-center justify-center gap-3 pt-2">
          <Link href="/projects">
            <Button variant="secondary" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Back to Projects
            </Button>
          </Link>
          <Button
            variant="primary"
            size="sm"
            onClick={() => refetch()}
            leftIcon={<RefreshCw className="w-4 h-4" />}
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      {/* 1. PROJECT HEADER (Module 3 Owned) */}
      <ProjectHeader
        project={project}
        canEdit={userCanEdit}
        onEditClick={() => setIsEditModalOpen(true)}
      />

      {/* 2. PROJECT DETAILS & METADATA (Module 3 Owned) */}
      <ProjectDetailsCard project={project} />

      {/* 3. PROGRESS & PERFORMANCE ANALYTICS (Module 2) */}
      <section aria-labelledby="project-progress-title" className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 id="project-progress-title" className="text-base sm:text-lg font-bold text-slate-900">
              Progress & Performance Analytics
            </h2>
            <p className="text-xs text-slate-500">
              Overall milestone completion, pod velocity, and ticket lifecycle distribution.
            </p>
          </div>
          <Link
            href={`/analytics?project=${project.slug}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5851d8] hover:text-[#4a43c4] hover:underline"
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Open in Global Analytics</span>
          </Link>
        </div>
        <ProjectProgressSection
          slug={project.slug}
          selectedStatus={selectedStatus}
          onSelectStatus={setSelectedStatus}
          hrefForPod={(podCode) => `/projects/${project.slug}/pods/pod-${podCode.toLowerCase()}`}
        />
        <ProjectTicketsTable
          slug={project.slug}
          status={selectedStatus}
          onStatusChange={setSelectedStatus}
        />
      </section>

      {/* 4. DOMAIN PODS (Module 5) */}
      <section aria-labelledby="project-pods-title" className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 id="project-pods-title" className="text-base sm:text-lg font-bold text-slate-900">
              Domain Pods
            </h2>
            <p className="text-xs text-slate-500">
              Cross-functional engineering pods executing sprint deliverables for this project.
            </p>
          </div>
          {MOCK_PODS.filter((p) => matchProjectSlug(p.projectSlug, project.slug)).length > 0 && (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-50 text-[#5851d8] border border-indigo-100">
              {MOCK_PODS.filter((p) => matchProjectSlug(p.projectSlug, project.slug)).length} Pods
            </span>
          )}
        </div>
        <PodList
          pods={MOCK_PODS.filter((p) => matchProjectSlug(p.projectSlug, project.slug))}
          projectSlug={project.slug}
        />
      </section>

      {/* 5. SPRINT SECTION (Module 3 Owned) */}
      <SprintSection
        projectSlug={project.slug}
        projectName={project.name}
      />

      {/* 4. EDIT PROJECT MODAL (Module 3 Owned) */}
      <EditProjectModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        project={project}
      />
    </div>
  );
}

export default function ProjectDetailsPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6 animate-pulse">
          <div className="space-y-3 pb-6">
            <div className="h-4 bg-slate-200 rounded-md w-48" />
            <div className="flex justify-between items-center">
              <div className="h-8 bg-slate-200 rounded-lg w-72" />
              <div className="h-10 bg-slate-200 rounded-xl w-32" />
            </div>
          </div>
          <div className="h-64 bg-white rounded-2xl border border-slate-200 p-6 space-y-4" />
          <div className="h-72 bg-white rounded-2xl border border-slate-200 p-6 space-y-4" />
        </div>
      }
    >
      <ProjectDetailsContent />
    </Suspense>
  );
}
