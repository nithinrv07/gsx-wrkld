'use client';

import React, { useState, useEffect } from 'react';
import { X, Zap, AlertCircle, CheckCircle2 } from 'lucide-react';
import { SprintStatus } from '@/types';
import { Button } from '@/components/ui';
import { useCreateSprint } from '@/hooks/useSprints';

export interface CreateSprintModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectSlug: string;
  projectName?: string;
}

interface FormProps {
  onClose: () => void;
  projectSlug: string;
  projectName?: string;
}

const CreateSprintForm: React.FC<FormProps> = ({
  onClose,
  projectSlug,
  projectName,
}) => {
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState<SprintStatus>('planning');
  const [goal, setGoal] = useState('');

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const createMutation = useCreateSprint(projectSlug);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !createMutation.isPending) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, createMutation.isPending]);

  const validate = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!name.trim()) {
      newErrors.name = 'Sprint name is required.';
    } else if (name.trim().length < 3) {
      newErrors.name = 'Sprint name must be at least 3 characters.';
    }

    if (!startDate) {
      newErrors.startDate = 'Start date is required.';
    }

    if (!endDate) {
      newErrors.endDate = 'End date is required.';
    }

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (end <= start) {
        newErrors.endDate = 'End date must be strictly after the start date.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);

    if (!validate()) return;

    try {
      await createMutation.mutateAsync({
        name: name.trim(),
        startDate,
        endDate,
        status,
        goal: goal.trim() || undefined,
      });

      setSuccessMessage(`Sprint "${name.trim()}" created successfully!`);
      setTimeout(() => {
        onClose();
      }, 700);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create sprint.';
      setApiError(msg);
    }
  };

  return (
    <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-200/90 z-10 transition-all my-8 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-[#5851d8] flex items-center justify-center shrink-0">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h2
              id="create-sprint-title"
              className="text-lg font-bold text-slate-900 tracking-tight"
            >
              Create Sprint
            </h2>
            <p className="text-xs text-slate-500">
              {projectName ? `Project: ${projectName}` : `Project: /${projectSlug}`}
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

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
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

        {/* Sprint Name */}
        <div className="space-y-1.5">
          <label
            htmlFor="sprint-name"
            className="text-xs font-semibold text-slate-700"
          >
            Sprint Name *
          </label>
          <input
            id="sprint-name"
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
            }}
            placeholder="e.g. Sprint 3 — Core Delivery"
            className={`w-full px-3.5 py-2 text-sm bg-slate-50 border rounded-xl focus:bg-white transition-all outline-none ${
              errors.name
                ? 'border-rose-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/15'
                : 'border-slate-200 focus:border-[#5851d8] focus:ring-2 focus:ring-[#5851d8]/15'
            }`}
          />
          {errors.name && (
            <p className="text-xs text-rose-600 font-medium">{errors.name}</p>
          )}
        </div>

        {/* Start and End Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label
              htmlFor="sprint-start-date"
              className="text-xs font-semibold text-slate-700"
            >
              Start Date *
            </label>
            <input
              id="sprint-start-date"
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                if (errors.startDate) {
                  setErrors((prev) => ({ ...prev, startDate: '' }));
                }
              }}
              className={`w-full px-3.5 py-2 text-sm bg-slate-50 border rounded-xl focus:bg-white transition-all outline-none ${
                errors.startDate
                  ? 'border-rose-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/15'
                  : 'border-slate-200 focus:border-[#5851d8] focus:ring-2 focus:ring-[#5851d8]/15'
              }`}
            />
            {errors.startDate && (
              <p className="text-xs text-rose-600 font-medium">
                {errors.startDate}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="sprint-end-date"
              className="text-xs font-semibold text-slate-700"
            >
              End Date *
            </label>
            <input
              id="sprint-end-date"
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                if (errors.endDate) {
                  setErrors((prev) => ({ ...prev, endDate: '' }));
                }
              }}
              className={`w-full px-3.5 py-2 text-sm bg-slate-50 border rounded-xl focus:bg-white transition-all outline-none ${
                errors.endDate
                  ? 'border-rose-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/15'
                  : 'border-slate-200 focus:border-[#5851d8] focus:ring-2 focus:ring-[#5851d8]/15'
              }`}
            />
            {errors.endDate && (
              <p className="text-xs text-rose-600 font-medium">
                {errors.endDate}
              </p>
            )}
          </div>
        </div>

        {/* Initial Status */}
        <div className="space-y-1.5">
          <label
            htmlFor="sprint-status"
            className="text-xs font-semibold text-slate-700"
          >
            Sprint Cadence Status
          </label>
          <select
            id="sprint-status"
            value={status}
            onChange={(e) => setStatus(e.target.value as SprintStatus)}
            className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#5851d8] focus:ring-2 focus:ring-[#5851d8]/15 outline-none transition-all cursor-pointer"
          >
            <option value="planning">Planning (Backlog grooming)</option>
            <option value="active">Active (Current sprint)</option>
            <option value="in-progress">In Progress</option>
            <option value="review">Review</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        {/* Goal */}
        <div className="space-y-1.5">
          <label
            htmlFor="sprint-goal"
            className="text-xs font-semibold text-slate-700"
          >
            Sprint Goal <span className="font-normal text-slate-400">(Optional)</span>
          </label>
          <textarea
            id="sprint-goal"
            rows={2}
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder="Primary milestone or deliverables for this sprint cycle..."
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
            Create Sprint
          </Button>
        </div>
      </form>
    </div>
  );
};

export const CreateSprintModal: React.FC<CreateSprintModalProps> = ({
  isOpen,
  onClose,
  projectSlug,
  projectName,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-sprint-title"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <CreateSprintForm
        onClose={onClose}
        projectSlug={projectSlug}
        projectName={projectName}
      />
    </div>
  );
};
