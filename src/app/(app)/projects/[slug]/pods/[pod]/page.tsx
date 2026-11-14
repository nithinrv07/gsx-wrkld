'use client';

import React, { useEffect, useState, use, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { MOCK_PODS } from '@/lib/mocks/pod-auth.mock';
import { PodHeader } from '@/features/pods/PodHeader';
import { MemberList } from '@/features/pods/MemberList';
import { AddMemberDialog } from '@/features/pods/AddMemberDialog';
import { useMockSession } from '@/features/auth/useMockSession';
import { usePermissions } from '@/lib/permissions/usePermissions';
import { Can } from '@/lib/permissions/Can';
import { PodMember, PodRole } from '@/types/auth-pod';
import { PodBoard } from '@/features/tickets';
import { Users, LayoutGrid, Plus, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const demoteLeads = (list: PodMember[]): PodMember[] =>
  list.map((member) =>
    member.roleInPod === 'Pod Lead' ? { ...member, roleInPod: 'Contributor' as PodRole } : member
  );

function PodDetailContent({ podId }: { podId: string }) {
  const router = useRouter();
  const session = useMockSession();
  const user = session.user;
  const podData = MOCK_PODS.find((pod) => pod.id === podId);
  const [members, setMembers] = useState<PodMember[]>(podData?.members ?? []);
  const [activeTab, setActiveTab] = useState<'board' | 'members'>('members');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const myPodRole = user ? members.find((member) => member.userId === user.id)?.roleInPod : undefined;
  const userPodRoles: Record<string, PodRole> = myPodRole ? { [podId]: myPodRole } : {};
  const currentUser = {
    globalRole: user?.globalRole ?? ('Contributor' as const),
    userPodRoles,
  };
  const { can } = usePermissions(currentUser);

  useEffect(() => {
    if (session.status === 'signed-out') router.replace('/sign-in');
  }, [session.status, router]);

  if (session.status !== 'signed-in' || !user) {
    return <div className="p-6 text-slate-400">Checking your session...</div>;
  }

  if (!podData) {
    return (
      <div className="bg-slate-950 text-slate-100 rounded-2xl p-12 text-center space-y-3">
        <h2 className="text-lg font-semibold">Pod not found</h2>
        <p className="text-sm text-slate-400">
          This pod does not exist, or you do not have access to it.
        </p>
        <Link href="/projects" className="inline-block text-sm text-indigo-400 hover:text-indigo-300">
          Back to Projects
        </Link>
      </div>
    );
  }

  const canManageMembers = can('manage_pod_members', podId);
  const canAssignLead = can('assign_pod_lead', podId);
  const lead = members.find((member) => member.roleInPod === 'Pod Lead');

  const handleAddMember = (newMember: PodMember) => {
    if (!canManageMembers) return;
    setMembers((prev) => {
      if (
        prev.some(
          (member) =>
            member.userId === newMember.userId ||
            member.email.trim().toLowerCase() === newMember.email.trim().toLowerCase()
        )
      ) {
        return prev;
      }
      const currentMembers = newMember.roleInPod === 'Pod Lead' ? demoteLeads(prev) : prev;
      return [...currentMembers, newMember];
    });
  };

  const handleUpdateMember = (updatedMember: PodMember) => {
    if (!canManageMembers) return;
    setMembers((prev) => {
      const currentMember = prev.find((member) => member.id === updatedMember.id);
      if (!currentMember) return prev;

      const roleChanged = currentMember.roleInPod !== updatedMember.roleInPod;
      if (
        roleChanged &&
        (currentMember.roleInPod === 'Pod Lead' || updatedMember.roleInPod === 'Pod Lead') &&
        !canAssignLead
      ) {
        return prev;
      }
      if (
        prev.some(
          (member) =>
            member.id !== updatedMember.id &&
            member.email.trim().toLowerCase() === updatedMember.email.trim().toLowerCase()
        )
      ) {
        return prev;
      }

      const membersWithoutPreviousLead =
        updatedMember.roleInPod === 'Pod Lead' ? demoteLeads(prev) : prev;
      return membersWithoutPreviousLead.map((member) =>
        member.id === updatedMember.id ? updatedMember : member
      );
    });
  };

  const handleRemoveMember = (memberId: string) => {
    if (!canManageMembers) return;
    setMembers((prev) => prev.filter((m) => m.id !== memberId));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/projects"
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Project
        </Link>
        <span className="text-xs font-mono text-indigo-400 bg-indigo-950/60 border border-indigo-800 px-3 py-1 rounded-full">
          Viewing as: {user.name} ({user.globalRole})
        </span>
      </div>

      <PodHeader
        pod={{
          ...podData,
          leadId: lead?.userId ?? null,
          leadName: lead?.name,
          memberCount: members.length,
          members,
        }}
      />

      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('members')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'members'
                ? 'bg-slate-800 text-white border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4" /> Members ({members.length})
          </button>
          <button
            onClick={() => setActiveTab('board')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'board'
                ? 'bg-slate-800 text-white border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LayoutGrid className="w-4 h-4" /> Board
          </button>
        </div>

        <Can action="manage_pod_members" podId={podId} currentUser={currentUser}>
          <button
            onClick={() => setIsAddDialogOpen(true)}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Member
          </button>
        </Can>
      </div>

      {activeTab === 'members' ? (
        <MemberList
          members={members}
          onRemoveMember={handleRemoveMember}
          onUpdateMember={handleUpdateMember}
          canManageMembers={canManageMembers}
          canAssignLead={canAssignLead}
        />
      ) : (
        // Board tab: Task & Issue Management (M11, M12, S1, S3).
        <div className="rounded-2xl bg-[#f8f9fd] p-4 text-slate-900 sm:p-6">
          <PodBoard
            projectSlug={podData.projectSlug}
            podId={podId}
            podName={podData.name}
            podLeadName={lead?.name ?? null}
            members={members}
            currentUser={currentUser}
          />
        </div>
      )}

      <AddMemberDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onAddMember={handleAddMember}
        existingEmails={members.map((member) => member.email)}
        canAssignLead={canAssignLead}
      />
    </div>
  );
}

function PodDetailResolver({ params }: { params: Promise<{ slug: string; pod: string }> }) {
  const { pod } = use(params);
  return <PodDetailContent key={pod} podId={pod} />;
}

export default function PodDetailPage({ params }: { params: Promise<{ slug: string; pod: string }> }) {
  return (
    <Suspense fallback={<div className="p-6 text-slate-400">Loading pod details...</div>}>
      <PodDetailResolver params={params} />
    </Suspense>
  );
}
