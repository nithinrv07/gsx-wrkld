'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  FolderKanban,
  Plus,
  RefreshCw,
  AlertCircle,
  ShieldCheck,
  ShieldAlert,
} from 'lucide-react';
import { PageHeader, EmptyState, Button } from '@/components/ui';
import { useProjects } from '@/hooks/useProjects';
import { ProjectStatus } from '@/types';
import { ProjectFilters } from '@/components/projects/ProjectFilters';
import { ProjectCard } from '@/components/projects/ProjectCard';
import { ProjectTable } from '@/components/projects/ProjectTable';
import { CreateProjectModal } from '@/components/projects/CreateProjectModal';
import { useAuth, UserRole } from '@/lib/auth/rbac';

export default function ProjectsPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<ProjectStatus | 'all'>('all');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const { user, setRole, canCreateProject } = useAuth();

  // TanStack Query hook
  const {
    data: projects,
    isLoading,
    isError,
    error,
    refetch,
  } = useProjects({
    search: search.trim() || undefined,
    status: status !== 'all' ? status : undefined,
  });

  const totalCount = projects?.length ?? 0;

  // Filtered count based on current client filters
  const filteredProjects = useMemo(() => {
    if (!projects) return [];
    return projects;
  }, [projects]);

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* RBAC Role Indicator Banner */}
      <div className="p-3 px-4 rounded-xl bg-slate-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-xs">
        <div className="flex items-center gap-2">
          {canCreateProject ? (
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
          )}
          <span>
            Logged in as <strong className="text-white">{user.name}</strong> ({user.role}).{' '}
            {canCreateProject ? (
              <span className="text-emerald-300 font-medium">
                Super Admin privileges active (can create new projects).
              </span>
            ) : (
              <span className="text-slate-300">
                &quot;New Project&quot; action requires Super Admin role.
              </span>
            )}
          </span>
        </div>

        {/* Quick Role Switcher for Testing */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-slate-400 font-medium mr-1">Switch Role:</span>
          {(['Frontend Lead', 'Super Admin', 'Pod Lead'] as UserRole[]).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors cursor-pointer ${
                user.role === r
                  ? 'bg-[#5851d8] text-white'
                  : 'bg-white/10 hover:bg-white/20 text-slate-300'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Page Header */}
      <PageHeader
        title="Projects"
        description="Cross-pod software projects, repositories, delivery milestones, and sprint cadences."
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Projects' },
        ]}
        actions={
          canCreateProject ? (
            <Button
              variant="primary"
              onClick={() => setIsCreateModalOpen(true)}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              New Project
            </Button>
          ) : undefined
        }
      />

      {/* Search & Filter Toolbar */}
      <ProjectFilters
        search={search}
        onSearchChange={setSearch}
        status={status}
        onStatusChange={setStatus}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        totalCount={totalCount}
        filteredCount={filteredProjects.length}
      />

      {/* Main Content Area: Loading, Error, Empty, or Data */}
      {isLoading ? (
        // Loading Skeletons
        viewMode === 'cards' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="h-52 bg-white rounded-2xl border border-slate-200/80 p-5 animate-pulse flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="w-10 h-10 bg-slate-100 rounded-xl" />
                  <div className="h-5 bg-slate-100 rounded-md w-3/4" />
                  <div className="h-3 bg-slate-100 rounded-md w-1/2" />
                </div>
                <div className="pt-3 border-t border-slate-100 flex justify-between">
                  <div className="h-4 bg-slate-100 rounded-md w-24" />
                  <div className="h-4 bg-slate-100 rounded-md w-20" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 animate-pulse space-y-4">
            {[1, 2, 3, 4, 5].map((n) => (
              <div key={n} className="h-8 bg-slate-100 rounded-md w-full" />
            ))}
          </div>
        )
      ) : isError ? (
        // Error State
        <div className="p-8 rounded-2xl bg-rose-50/80 border border-rose-200 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-rose-900">
            Failed to Load Projects
          </h3>
          <p className="text-xs text-rose-600 max-w-sm mx-auto">
            {error instanceof Error ? error.message : 'An unexpected error occurred while fetching projects.'}
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
      ) : filteredProjects.length === 0 ? (
        // Empty State
        <EmptyState
          icon={FolderKanban}
          title={search || status !== 'all' ? 'No Matching Projects' : 'No Projects Found'}
          description={
            search || status !== 'all'
              ? 'No projects match your current search or filter criteria. Try resetting filters or using a different query.'
              : 'There are no active projects configured in Wrkld yet. Get started by creating your first project.'
          }
          action={
            search || status !== 'all' ? (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setSearch('');
                  setStatus('all');
                }}
              >
                Clear Filters
              </Button>
            ) : canCreateProject ? (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsCreateModalOpen(true)}
                leftIcon={<Plus className="w-4 h-4" />}
              >
                Create Project
              </Button>
            ) : undefined
          }
        />
      ) : (
        // Projects View
        viewMode === 'cards' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        ) : (
          <ProjectTable projects={filteredProjects} />
        )
      )}

      {/* Project Creation Modal */}
      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreated={(slug) => {
          router.push(`/projects/${slug}`);
        }}
      />
    </div>
  );
}
