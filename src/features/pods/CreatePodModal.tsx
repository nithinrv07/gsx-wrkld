'use client';

// Create Pod dialog (M9). Only rendered for users allowed `create_pod`
// (Super Admin, Project Lead). The caller decides visibility; this form
// validates input and saves through the pods data layer.

import React, { useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Users, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui';
import { useCreatePod } from '@/hooks/usePods';
import { MOCK_USERS } from '@/lib/mocks/pod-auth.mock';
import { POD_TYPE_LABELS, POD_TYPES } from '@/services/api/podsApi';
import type { PodType } from '@/types/auth-pod';

export const createPodSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Pod name is required.')
    .min(3, 'Pod name must be at least 3 characters.')
    .max(60, 'Pod name must be 60 characters or fewer.'),
  type: z.enum(['FE', 'BE', 'INT', 'QA'] as const, { message: 'Choose a pod type.' }),
  leadId: z.string(),
});

export type CreatePodFormData = z.infer<typeof createPodSchema>;

export interface CreatePodModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectSlug: string;
  projectName?: string;
  /** Pod types this project already has; they can't be created twice. */
  existingTypes: PodType[];
}

const inputClass = (hasError: boolean) =>
  `w-full px-3.5 py-2 text-sm bg-slate-50 border rounded-xl focus:bg-white transition-all outline-none ${
    hasError
      ? 'border-rose-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/15'
      : 'border-slate-200 focus:border-[#5851d8] focus:ring-2 focus:ring-[#5851d8]/15'
  }`;

const CreatePodForm: React.FC<Omit<CreatePodModalProps, 'isOpen'>> = ({
  onClose,
  projectSlug,
  projectName,
  existingTypes,
}) => {
  const [apiError, setApiError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const createMutation = useCreatePod(projectSlug);

  const availableTypes = POD_TYPES.filter((t) => !existingTypes.includes(t));

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors, dirtyFields },
  } = useForm<CreatePodFormData>({
    resolver: zodResolver(createPodSchema),
    defaultValues: {
      name: availableTypes[0] ? `${POD_TYPE_LABELS[availableTypes[0]]} Pod` : '',
      type: availableTypes[0],
      leadId: '',
    },
  });

  // Keep the suggested name in step with the chosen type until the user edits the name.
  const selectedType = useWatch({ control, name: 'type' });
  useEffect(() => {
    if (selectedType && !dirtyFields.name) {
      setValue('name', `${POD_TYPE_LABELS[selectedType]} Pod`);
    }
  }, [selectedType, dirtyFields.name, setValue]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !createMutation.isPending) onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose, createMutation.isPending]);

  const onSubmit = async (data: CreatePodFormData) => {
    setApiError(null);
    try {
      const pod = await createMutation.mutateAsync({
        name: data.name.trim(),
        type: data.type,
        leadId: data.leadId || null,
      });
      setSuccessMessage(`Pod "${pod.name}" created.`);
      setTimeout(onClose, 700);
    } catch (err: unknown) {
      setApiError(err instanceof Error ? err.message : 'Failed to create pod.');
    }
  };

  return (
    <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-200/90 z-10 my-8 overflow-hidden">
      <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-[#5851d8] flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 id="create-pod-title" className="text-lg font-bold text-slate-900 tracking-tight">
              Create Pod
            </h2>
            <p className="text-xs text-slate-500">
              {projectName ? `Project: ${projectName}` : `Project: /${projectSlug}`}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          disabled={createMutation.isPending}
          className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {availableTypes.length === 0 ? (
        <div className="p-6 space-y-4">
          <p className="text-sm text-slate-600">
            This project already has all four pod types (Frontend, Backend, Integration, Quality Assurance).
          </p>
          <div className="flex justify-end">
            <Button type="button" variant="secondary" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4" noValidate>
          {apiError && (
            <div role="alert" className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{apiError}</span>
            </div>
          )}
          {successMessage && (
            <div role="status" className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMessage}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label htmlFor="pod-type" className="text-xs font-semibold text-slate-700">
              Pod Type *
            </label>
            <select id="pod-type" {...register('type')} className={`${inputClass(!!errors.type)} cursor-pointer`}>
              {availableTypes.map((t) => (
                <option key={t} value={t}>
                  {POD_TYPE_LABELS[t]} ({t})
                </option>
              ))}
            </select>
            {errors.type && <p className="text-xs text-rose-600 font-medium">{errors.type.message}</p>}
            {existingTypes.length > 0 && (
              <p className="text-[11px] text-slate-400">
                Already in this project: {existingTypes.map((t) => POD_TYPE_LABELS[t]).join(', ')}.
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="pod-name" className="text-xs font-semibold text-slate-700">
              Pod Name *
            </label>
            <input
              id="pod-name"
              type="text"
              {...register('name')}
              placeholder="e.g. Frontend Pod"
              aria-invalid={!!errors.name}
              className={inputClass(!!errors.name)}
            />
            {errors.name && <p className="text-xs text-rose-600 font-medium">{errors.name.message}</p>}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="pod-lead" className="text-xs font-semibold text-slate-700">
              Pod Lead <span className="font-normal text-slate-400">(Optional)</span>
            </label>
            <select id="pod-lead" {...register('leadId')} className={`${inputClass(false)} cursor-pointer`}>
              <option value="">No lead yet</option>
              {MOCK_USERS.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} (@{u.githubHandle})
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-400">
              The lead becomes the pod&apos;s first member. You can add members after the pod is created.
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button type="button" variant="secondary" onClick={onClose} disabled={createMutation.isPending}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={createMutation.isPending}>
              Create Pod
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};

export const CreatePodModal: React.FC<CreatePodModalProps> = ({ isOpen, ...props }) => {
  if (!isOpen) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-pod-title"
    >
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={props.onClose} />
      <CreatePodForm {...props} />
    </div>
  );
};
