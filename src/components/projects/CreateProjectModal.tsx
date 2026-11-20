'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, FolderPlus, AlertCircle, CheckCircle2 } from 'lucide-react';
import { ProjectStatus } from '@/types';
import { Button } from '@/components/ui';
import { useCreateProject } from '@/hooks/useProjects';
import { projectsApi } from '@/services/api';

export interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: (slug: string) => void;
}

// Available project leads from team pods
export const AVAILABLE_PROJECT_LEADS = [
  { name: 'Shwetha V', email: 'shwetha@wrkld.io', initials: 'SV', role: 'Frontend Lead' },
  { name: 'Arun K', email: 'arun@wrkld.io', initials: 'AK', role: 'Pod Lead - Gamma' },
  { name: 'Divya R', email: 'divya@wrkld.io', initials: 'DR', role: 'Pod Lead - Beta' },
  { name: 'Keerthana S', email: 'keerthana@wrkld.io', initials: 'KS', role: 'Product Designer' },
  { name: 'Edwin A', email: 'edwin@wrkld.io', initials: 'EA', role: 'Mobile Engineer' },
  { name: 'Naveen M', email: 'naveen@wrkld.io', initials: 'NM', role: 'Security Engineer' },
];

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const createProjectSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Project name is required.')
    .min(3, 'Project name must be at least 3 characters.'),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, 'Project slug is required.')
    .regex(
      SLUG_REGEX,
      'Slug can only contain lowercase letters, numbers, and hyphens (e.g. mobile-app).'
    ),
  targetDate: z
    .string()
    .min(1, 'Target completion date is required.')
    .refine((val) => !isNaN(new Date(val).getTime()), 'Please select a valid date.'),
  status: z.enum(['planning', 'active', 'in-progress', 'on-track', 'completed', 'blocked'] as const),
  projectLeadIndex: z.number().int().min(0),
  description: z.string().optional(),
});

export type CreateProjectFormData = z.infer<typeof createProjectSchema>;

interface FormProps {
  onClose: () => void;
  onCreated?: (slug: string) => void;
}

const CreateProjectForm: React.FC<FormProps> = ({ onClose, onCreated }) => {
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const createMutation = useCreateProject();

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    formState: { errors },
  } = useForm<CreateProjectFormData>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      name: '',
      slug: '',
      targetDate: '',
      status: 'planning',
      projectLeadIndex: 0,
      description: '',
    },
  });

  const nameRegister = register('name');
  const slugRegister = register('slug');

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !createMutation.isPending) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, createMutation.isPending]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    nameRegister.onChange(e);
    if (!isSlugManuallyEdited) {
      setValue('slug', slugify(e.target.value), { shouldValidate: true });
    }
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsSlugManuallyEdited(true);
    slugRegister.onChange(e);
  };

  const onSubmit = async (data: CreateProjectFormData) => {
    setApiError(null);

    // Check slug uniqueness
    const cleanSlug = data.slug.trim().toLowerCase();
    const isUnique = await projectsApi.isSlugUnique(cleanSlug);
    if (!isUnique) {
      setError('slug', {
        type: 'manual',
        message: `Slug "${cleanSlug}" is already in use. Please choose another.`,
      });
      return;
    }

    const lead = AVAILABLE_PROJECT_LEADS[data.projectLeadIndex] || AVAILABLE_PROJECT_LEADS[0];

    try {
      const created = await createMutation.mutateAsync({
        name: data.name.trim(),
        slug: cleanSlug,
        description: data.description?.trim() || undefined,
        status: data.status as ProjectStatus,
        projectLead: {
          name: lead.name,
          email: lead.email,
          initials: lead.initials,
        },
        targetDate: data.targetDate,
      });

      setSuccessMessage(`Project "${created.name}" created successfully!`);
      setTimeout(() => {
        onClose();
        if (onCreated) {
          onCreated(created.slug);
        }
      }, 700);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create project.';
      setApiError(message);
    }
  };

  return (
    <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-200/90 z-10 transition-all my-8 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-[#5851d8] flex items-center justify-center shrink-0">
            <FolderPlus className="w-5 h-5" />
          </div>
          <div>
            <h2
              id="create-project-title"
              className="text-lg font-bold text-slate-900 tracking-tight"
            >
              Create New Project
            </h2>
            <p className="text-xs text-slate-500">
              Define project identity, target milestone, and lead assignment.
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          disabled={createMutation.isPending}
          className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Form Body */}
      <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
        {apiError && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{apiError}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Project Name */}
        <div className="space-y-1.5">
          <label
            htmlFor="project-name"
            className="text-xs font-semibold text-slate-700 flex items-center justify-between"
          >
            <span>Project Name *</span>
            <span className="text-[11px] font-normal text-slate-400">e.g. Wrkld Core Platform</span>
          </label>
          <input
            id="project-name"
            type="text"
            {...nameRegister}
            onChange={handleNameChange}
            placeholder="Enter project name"
            className={`w-full px-3.5 py-2 text-sm bg-slate-50 border rounded-xl focus:bg-white transition-all outline-none ${
              errors.name
                ? 'border-rose-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/15'
                : 'border-slate-200 focus:border-[#5851d8] focus:ring-2 focus:ring-[#5851d8]/15'
            }`}
          />
          {errors.name && (
            <p className="text-xs text-rose-600 font-medium">{errors.name.message}</p>
          )}
        </div>

        {/* Project Slug */}
        <div className="space-y-1.5">
          <label
            htmlFor="project-slug"
            className="text-xs font-semibold text-slate-700 flex items-center justify-between"
          >
            <span>Project Slug *</span>
            <span className="text-[11px] font-normal text-slate-400">Used in URL routes</span>
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-xs font-mono text-slate-400 pointer-events-none">
              /projects/
            </span>
            <input
              id="project-slug"
              type="text"
              {...slugRegister}
              onChange={handleSlugChange}
              placeholder="project-slug"
              className={`w-full pl-22 pr-3.5 py-2 text-sm font-mono bg-slate-50 border rounded-xl focus:bg-white transition-all outline-none ${
                errors.slug
                  ? 'border-rose-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/15'
                  : 'border-slate-200 focus:border-[#5851d8] focus:ring-2 focus:ring-[#5851d8]/15'
              }`}
            />
          </div>
          {errors.slug && (
            <p className="text-xs text-rose-600 font-medium">{errors.slug.message}</p>
          )}
        </div>

        {/* Target Date & Initial Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label
              htmlFor="target-date"
              className="text-xs font-semibold text-slate-700"
            >
              Target Date *
            </label>
            <input
              id="target-date"
              type="date"
              {...register('targetDate')}
              className={`w-full px-3.5 py-2 text-sm bg-slate-50 border rounded-xl focus:bg-white transition-all outline-none ${
                errors.targetDate
                  ? 'border-rose-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/15'
                  : 'border-slate-200 focus:border-[#5851d8] focus:ring-2 focus:ring-[#5851d8]/15'
              }`}
            />
            {errors.targetDate && (
              <p className="text-xs text-rose-600 font-medium">
                {errors.targetDate.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="project-status"
              className="text-xs font-semibold text-slate-700"
            >
              Initial Status
            </label>
            <select
              id="project-status"
              {...register('status')}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#5851d8] focus:ring-2 focus:ring-[#5851d8]/15 outline-none transition-all cursor-pointer"
            >
              <option value="planning">Planning</option>
              <option value="active">Active</option>
              <option value="in-progress">In Progress</option>
              <option value="on-track">On Track</option>
            </select>
          </div>
        </div>

        {/* Project Lead */}
        <div className="space-y-1.5">
          <label
            htmlFor="project-lead"
            className="text-xs font-semibold text-slate-700"
          >
            Project Lead *
          </label>
          <select
            id="project-lead"
            {...register('projectLeadIndex', { valueAsNumber: true })}
            className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#5851d8] focus:ring-2 focus:ring-[#5851d8]/15 outline-none transition-all cursor-pointer"
          >
            {AVAILABLE_PROJECT_LEADS.map((lead, idx) => (
              <option key={lead.email} value={idx}>
                {lead.name} — {lead.role} ({lead.email})
              </option>
            ))}
          </select>
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label
            htmlFor="project-description"
            className="text-xs font-semibold text-slate-700"
          >
            Description <span className="font-normal text-slate-400">(Optional)</span>
          </label>
          <textarea
            id="project-description"
            rows={2}
            {...register('description')}
            placeholder="Brief summary of project objectives and scope..."
            className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#5851d8] focus:ring-2 focus:ring-[#5851d8]/15 outline-none transition-all resize-none"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={createMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={createMutation.isPending}
          >
            Create Project
          </Button>
        </div>
      </form>
    </div>
  );
};

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  isOpen,
  onClose,
  onCreated,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-project-title"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <CreateProjectForm onClose={onClose} onCreated={onCreated} />
    </div>
  );
};
