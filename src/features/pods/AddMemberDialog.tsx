'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { MOCK_USERS } from '@/lib/mocks/pod-auth.mock';
import { PodMember, PodRole } from '@/types/auth-pod';
import { X, UserPlus } from 'lucide-react';

let memberIdCounter = 0;
const createMockId = (prefix: string) => `${prefix}-${Date.now()}-${++memberIdCounter}`;

interface AddMemberDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAddMember: (newMember: PodMember) => void;
  existingEmails: string[];
  /** Only Project Lead and Super Admin may make someone Pod Lead. */
  canAssignLead?: boolean;
}

export const AddMemberDialog: React.FC<AddMemberDialogProps> = ({
  isOpen,
  onClose,
  onAddMember,
  existingEmails,
  canAssignLead = false,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [error, setError] = useState('');

  const closeDialog = useCallback(() => {
    setName('');
    setEmail('');
    setRole('');
    setError('');
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeDialog();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, closeDialog]);

  if (!isOpen) return null;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const cleanName = name.trim();
    const cleanEmail = email.trim();
    const cleanRole = role.trim();

    if (!cleanName || !cleanEmail || !cleanRole) {
      setError('Enter a name, email, and role.');
      return;
    }

    const assignedRole: PodRole =
      cleanRole.toLowerCase() === 'pod lead' ? 'Pod Lead' : cleanRole;
    if (assignedRole === 'Pod Lead' && !canAssignLead) {
      setError('Only Project Leads and Super Admins can assign the Pod Lead role.');
      return;
    }
    if (existingEmails.some((existingEmail) => existingEmail.trim().toLowerCase() === cleanEmail.toLowerCase())) {
      setError('This email is already a member of this pod.');
      return;
    }

    const knownUser = MOCK_USERS.find((user) => user.email.toLowerCase() === cleanEmail.toLowerCase());
    const newMember: PodMember = {
      id: createMockId('mem'),
      userId: knownUser?.id ?? createMockId('usr'),
      name: cleanName,
      email: cleanEmail,
      githubHandle: knownUser?.githubHandle ?? '',
      avatarUrl: knownUser?.image ?? '',
      roleInPod: assignedRole,
      joinedDate: new Date().toISOString().split('T')[0],
    };

    onAddMember(newMember);
    closeDialog();
  };

  const inputClassName =
    'w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-member-title"
        className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-md p-6 shadow-2xl space-y-5"
      >
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-indigo-400">
            <UserPlus className="w-5 h-5" />
            <h3 id="add-member-title" className="font-bold text-white text-lg">
              Add Member to Pod
            </h3>
          </div>
          <button
            type="button"
            onClick={closeDialog}
            aria-label="Close dialog"
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="add-member-name"
              className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2"
            >
              Name
            </label>
            <input
              id="add-member-name"
              type="text"
              autoComplete="name"
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
              className={inputClassName}
            />
          </div>

          <div>
            <label
              htmlFor="add-member-email"
              className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2"
            >
              Email
            </label>
            <input
              id="add-member-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className={inputClassName}
            />
          </div>

          <div>
            <label
              htmlFor="add-member-role"
              className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2"
            >
              Role
            </label>
            <input
              id="add-member-role"
              type="text"
              required
              placeholder="Enter a role"
              value={role}
              onChange={(event) => setRole(event.target.value)}
              aria-describedby={error ? 'add-member-error' : undefined}
              className={inputClassName}
            />
            <p className="mt-1 text-xs text-slate-500">
              Enter any role name.
            </p>
          </div>

          {error && (
            <p id="add-member-error" role="alert" className="text-sm text-red-400">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={closeDialog}
              className="px-4 py-2 rounded-lg text-sm text-slate-400 hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg text-sm bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-colors"
            >
              Add Member
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
