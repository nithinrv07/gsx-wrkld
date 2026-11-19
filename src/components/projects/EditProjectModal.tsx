'use client';

import React, { useState, useEffect } from 'react';
import { X, Edit3, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Project, ProjectStatus } from '@/types';
import { Button } from '@/components/ui';
import { useUpdateProject } from '@/hooks/useProjects';
import { AVAILABLE_PROJECT_LEADS } from './CreateProjectModal';

export interface EditProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
}

interface FormProps {
  onClose: () => void;
  project: Project;
}

const EditProjectForm: React.FC<FormProps> = ({ onClose, project }) => {
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description || '');
  const [targetDate, setTargetDate] = useState(project.targetDate);
  const [status, setStatus] = useState<ProjectStatus>(project.status);
  const [selectedLeadIndex, setSelectedLeadIndex] = useState(() => {
    const leadIdx = AVAILABLE_PROJECT_LEADS.findIndex(
      (l) => l.email.toLowerCase() === project.projectLead.email.toLowerCase()
    );
    return leadIdx >= 0 ? leadIdx : 0;
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const updateMutation = useUpdateProject(project.slug);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !updateMutation.isPending) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, updateMutation.isPending]);

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!name.trim()) {
      newErrors.name = 'Project name is required.';
    }
    if (!targetDate) {
      newErrors.targetDate = 'Target date is required.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);

    if (!validate()) return;

    const lead = AVAILABLE_PROJECT_LEADS[selectedLeadIndex];

    try {
      await updateMutation.mutateAsync({
        name: name.trim(),
        description: description.trim(),
        status,
        targetDate,
        projectLead: lead
          ? {
              name: lead.name,
              email: lead.email,
              initials: lead.initials,
            }
          : undefined,
      });

      setSuccessMessage('Project updated successfully!');
      setTimeout(() => {
        onClose();
      }, 700);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update project.';
      setApiError(msg);
    }
  };

  return (
    <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-200/90 z-10 transition-all my-8 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-[#5851d8] flex items-center justify-center shrink-0">
            <Edit3 className="w-5 h-5" />
          </div>
          <div>
            <h2
              id="edit-project-title"
              className="text-lg font-bold text-slate-900 tracking-tight"
            >
              Edit Project
            </h2>
            <p className="text-xs text-slate-500 font-mono">
              /{project.slug}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          disabled={updateMutation.isPending}
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

        {/* Project Name */}
        <div className="space-y-1.5">
          <label
            htmlFor="edit-project-name"
            className="text-xs font-semibold text-slate-700"
          >
            Project Name *
          </label>
          <input
            id="edit-project-name"
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
            }}
            className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#5851d8] focus:ring-2 focus:ring-[#5851d8]/15 outline-none transition-all"
          />
          {errors.name && (
            <p className="text-xs text-rose-600 font-medium">{errors.name}</p>
          )}
        </div>

        {/* Status & Target Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label
              htmlFor="edit-status"
              className="text-xs font-semibold text-slate-700"
            >
              Project Status
            </label>
            <select
              id="edit-status"
              value={status}
              onChange={(e) => setStatus(e.target.value as ProjectStatus)}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#5851d8] focus:ring-2 focus:ring-[#5851d8]/15 outline-none transition-all cursor-pointer"
            >
              <option value="planning">Planning</option>
              <option value="active">Active</option>
              <option value="in-progress">In Progress</option>
              <option value="on-track">On Track</option>
              <option value="completed">Completed</option>
              <option value="blocked">Blocked</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="edit-target-date"
              className="text-xs font-semibold text-slate-700"
            >
              Target Date *
            </label>
            <input
              id="edit-target-date"
              type="date"
              value={targetDate}
              onChange={(e) => {
                setTargetDate(e.target.value);
                if (errors.targetDate) {
                  setErrors((prev) => ({ ...prev, targetDate: '' }));
                }
              }}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#5851d8] focus:ring-2 focus:ring-[#5851d8]/15 outline-none transition-all"
            />
            {errors.targetDate && (
              <p className="text-xs text-rose-600 font-medium">
                {errors.targetDate}
              </p>
            )}
          </div>
        </div>

        {/* Lead */}
        <div className="space-y-1.5">
          <label
            htmlFor="edit-lead"
            className="text-xs font-semibold text-slate-700"
          >
            Project Lead
          </label>
          <select
            id="edit-lead"
            value={selectedLeadIndex}
            onChange={(e) => setSelectedLeadIndex(Number(e.target.value))}
            className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#5851d8] focus:ring-2 focus:ring-[#5851d8]/15 outline-none transition-all cursor-pointer"
          >
            {AVAILABLE_PROJECT_LEADS.map((lead, idx) => (
              <option key={lead.email} value={idx}>
                {lead.name} — {lead.role}
              </option>
            ))}
          </select>
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label
            htmlFor="edit-description"
            className="text-xs font-semibold text-slate-700"
          >
            Description
          </label>
          <textarea
            id="edit-description"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#5851d8] focus:ring-2 focus:ring-[#5851d8]/15 outline-none transition-all resize-none"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={updateMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={updateMutation.isPending}
          >
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
};

export const EditProjectModal: React.FC<EditProjectModalProps> = ({
  isOpen,
  onClose,
  project,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-project-title"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <EditProjectForm onClose={onClose} project={project} />
    </div>
  );
};
