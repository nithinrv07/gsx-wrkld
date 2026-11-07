'use client';

import React, { useState } from 'react';
import { PodMember } from '@/types/auth-pod';
import { UserX, Shield, GitBranch, Mail, Pencil, X } from 'lucide-react';

interface MemberListProps {
  members: PodMember[];
  onRemoveMember?: (memberId: string) => void;
  onUpdateMember?: (member: PodMember) => void;
  /** Add/remove members: Pod Lead (own pod), Project Lead, Super Admin. */
  canManageMembers?: boolean;
  /** Change who is Pod Lead: Project Lead and Super Admin only. */
  canAssignLead?: boolean;
}

export const MemberList: React.FC<MemberListProps> = ({
  members,
  onRemoveMember,
  onUpdateMember,
  canManageMembers = false,
  canAssignLead = false,
}) => {
  const [memberBeingEdited, setMemberBeingEdited] = useState<PodMember | null>(null);

  if (members.length === 0) {
    return (
      <div className="text-center p-8 bg-slate-900/50 border border-slate-800 rounded-xl">
        <p className="text-slate-400 text-sm">No members assigned to this pod yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">
          Pod Members ({members.length})
        </h3>
      </div>

      <div className="divide-y divide-slate-800">
        {members.map((member) => {
          const isLead = member.roleInPod === 'Pod Lead';

          return (
            <div
              key={member.id}
              className="p-4 flex items-center justify-between hover:bg-slate-850/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                {member.avatarUrl ? (
                  <>
                    {/* Mock avatars come from external URLs; next/image would need remotePatterns config. */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={member.avatarUrl}
                      alt={member.name}
                      className="w-10 h-10 rounded-full border border-slate-700 object-cover"
                    />
                  </>
                ) : (
                  <div
                    aria-label={`${member.name} avatar`}
                    className="w-10 h-10 rounded-full border border-slate-700 bg-slate-800 flex items-center justify-center text-xs font-medium text-slate-300"
                  >
                    {member.name
                      .split(/\s+/)
                      .filter(Boolean)
                      .map((part) => part[0])
                      .slice(0, 2)
                      .join('')
                      .toUpperCase()}
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-white">{member.name}</p>
                    {isLead ? (
                      <span className="inline-flex items-center gap-1 text-[10px] bg-indigo-950 text-indigo-300 border border-indigo-800 px-2 py-0.5 rounded-full font-medium">
                        <Shield className="w-2.5 h-2.5" /> Pod Lead
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-[10px] bg-slate-800 text-slate-300 border border-slate-700 px-2 py-0.5 rounded-full font-medium">
                        {member.roleInPod}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Mail className="w-3 h-3 text-indigo-400" />
                    <span>{member.email}</span>
                  </div>
                  {member.githubHandle && (
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <GitBranch className="w-3 h-3 text-indigo-400" />
                      <span>@{member.githubHandle}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-xs text-slate-500 font-mono">
                  Joined: {member.joinedDate}
                </span>

                <div className="flex items-center gap-1">
                  {canManageMembers && onUpdateMember && (
                    <button
                      onClick={() => setMemberBeingEdited(member)}
                      className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-indigo-950/30 rounded-md transition-colors"
                      title="Edit member details"
                      aria-label={`Edit ${member.name}`}
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                  )}

                  {canManageMembers && onRemoveMember && !isLead && (
                    <button
                      onClick={() => onRemoveMember(member.id)}
                      className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-950/30 rounded-md transition-colors"
                      title="Remove from pod"
                      aria-label={`Remove ${member.name} from pod`}
                    >
                      <UserX className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {memberBeingEdited && onUpdateMember && (
        <EditMemberDialog
          member={memberBeingEdited}
          members={members}
          canAssignLead={canAssignLead}
          onClose={() => setMemberBeingEdited(null)}
          onSave={(updatedMember) => {
            onUpdateMember(updatedMember);
            setMemberBeingEdited(null);
          }}
        />
      )}
    </div>
  );
};

interface EditMemberDialogProps {
  member: PodMember;
  members: PodMember[];
  canAssignLead: boolean;
  onClose: () => void;
  onSave: (member: PodMember) => void;
}

function EditMemberDialog({
  member,
  members,
  canAssignLead,
  onClose,
  onSave,
}: EditMemberDialogProps) {
  const [name, setName] = useState(member.name);
  const [email, setEmail] = useState(member.email);
  const [role, setRole] = useState(member.roleInPod);
  const [error, setError] = useState('');

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const cleanName = name.trim();
    const cleanEmail = email.trim();
    const cleanRole = role.trim();

    if (!cleanName || !cleanEmail || !cleanRole) {
      setError('Enter a name, email, and role.');
      return;
    }

    const normalizedRole =
      cleanRole.toLowerCase() === 'pod lead' ? 'Pod Lead' : cleanRole;
    const roleChanged = normalizedRole !== member.roleInPod;
    if (
      roleChanged &&
      (normalizedRole === 'Pod Lead' || member.roleInPod === 'Pod Lead') &&
      !canAssignLead
    ) {
      setError('Only Project Leads and Super Admins can change the Pod Lead role.');
      return;
    }
    if (
      members.some(
        (existingMember) =>
          existingMember.id !== member.id &&
          existingMember.email.trim().toLowerCase() === cleanEmail.toLowerCase()
      )
    ) {
      setError('This email is already a member of this pod.');
      return;
    }

    onSave({
      ...member,
      name: cleanName,
      email: cleanEmail,
      roleInPod: normalizedRole,
    });
  };

  const inputClassName =
    'w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-member-title"
        className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-md p-6 shadow-2xl space-y-5"
      >
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 id="edit-member-title" className="font-bold text-white text-lg">
            Edit Member
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="edit-member-name"
              className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2"
            >
              Name
            </label>
            <input
              id="edit-member-name"
              type="text"
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
              className={inputClassName}
            />
          </div>

          <div>
            <label
              htmlFor="edit-member-email"
              className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2"
            >
              Email
            </label>
            <input
              id="edit-member-email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className={inputClassName}
            />
          </div>

          <div>
            <label
              htmlFor="edit-member-role"
              className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2"
            >
              Role
            </label>
            <input
              id="edit-member-role"
              type="text"
              required
              value={role}
              onChange={(event) => setRole(event.target.value)}
              className={inputClassName}
            />
          </div>

          {error && (
            <p role="alert" className="text-sm text-red-400">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm text-slate-400 hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg text-sm bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-colors"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}